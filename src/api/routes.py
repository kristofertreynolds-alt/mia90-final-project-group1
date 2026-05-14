"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
from flask import Flask, request, jsonify, url_for, Blueprint
from api.models import db, User, Meal, Nutrition, UserProfile
from api.utils import generate_sitemap, APIException
from flask_cors import CORS
from sqlalchemy import select
from flask_jwt_extended import create_access_token
from flask_jwt_extended import get_jwt_identity
from flask_jwt_extended import jwt_required
from flask_jwt_extended import JWTManager
import anthropic
import json
import os

api = Blueprint('api', __name__)

# Allow CORS requests to this API
CORS(api)


########### GET LIST OF ALL USERS ########## /users
@api.route("/users")
def get_users():
    users = db.session.execute(select(User)).scalars().all()
    user_dictionaries = [user.serialize() for user in users]
    return jsonify(user_dictionaries), 200


########### USER SIGNUP ##########
@api.route('/users', methods=['POST'])
def user_signup():
    body = request.json
    if not body:
        return jsonify({"msg": "sorry your request is empty"}), 400
    email = body.get("email")
    if not email:
        return jsonify({"msg": "sorry no email"}), 400
    password = body.get("password")
    if not password:
        return jsonify({"msg": "sorry no password"}), 400
    
    newUser = User(
        email = email,
        password = password,
        is_active = True
    )
    db.session.add(newUser)
    db.session.commit()
    return jsonify(newUser.serialize()), 201


########### USER LOGIN ########## 
@api.route('/login', methods=['POST'])
def user_login():
    body = request.json
    if not body:
        return jsonify({"msg": "sorry your request is empty"}), 400
    email = body.get("email")
    if not email:
        return jsonify({"msg": "sorry no email"}), 400
    password = body.get("password")
    if not password:
        return jsonify({"msg": "sorry no password"}), 400
    
    user = db.session.execute(
        select(User)
        .where(User.email == email)
        .where(User.password == password)
    ).scalar_one_or_none()
    
    if not user:
        return jsonify({"msg": "sorry user does not exist, please signup"}), 400
    
    access_token = create_access_token(identity=email)
    return jsonify({"access_token": access_token}), 201


########### USER PROFILE AREA ##########
@api.route("/profile", methods=["GET"])
@jwt_required()
def protected(): 
    current_user = get_jwt_identity()
    user = db.session.execute(
        select(User)
        .where(User.email == current_user)
    ).scalar_one_or_none()
    return jsonify(user.serialize()), 200


########## MEALS -> GET ##########
@api.route('/meals', methods=['GET'])
@jwt_required()
def get_meals():
    userID = get_jwt_identity()
    
    user = db.session.execute(
        select(User)
        .where(User.email == userID)
    ).scalar_one_or_none()

    statement = (
        select(Meal)
        .where(Meal.user_id == user.id)
    )
    meals = db.session.execute(statement).scalars().all()
    _meals = []

    for meal in meals: 
        dictionary = meal.serialize()
        _meals.append(dictionary)
    return jsonify(_meals), 200


########## MEALS -> POST ##########
@api.route('/meals', methods=['POST'])
@jwt_required()
def post_meals():
    body = request.json
    if not body: 
        return jsonify({"msg": "sorry no meal to add to database"}), 400
    
    userID = get_jwt_identity()
    user = db.session.execute(select(User).where(User.id == userID)).scalar_one_or_none()
    if not user:
        return jsonify({"msg": "sorry no user was found"}), 400

    meal = Meal(
        user_id = userID,
        description = body.get("description")
    )
    db.session.add(meal)
    db.session.commit()

    meal_dictionary = meal.serialize()
    return jsonify(meal_dictionary), 201


########## ANALYZE MEAL WITH CLAUDE AI ##########
@api.route('/analyze-meal', methods=['POST'])
@jwt_required()
def analyze_meal():
    userEmail = get_jwt_identity()
    
    user = db.session.execute(
        select(User)
        .where(User.email == userEmail)
    ).scalar_one_or_none()
    
    body = request.json
    if not body:
        return jsonify({"msg": "No data provided"}), 400

    description  = body.get("description", "")
    name = body.get("meal_type")
    image_base64 = body.get("image_base64", None)
    media_type   = body.get("media_type", "image/jpeg")

    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        return jsonify({"msg": "Claude API key not configured"}), 500

    client = anthropic.Anthropic(api_key=api_key)

    try:
        if image_base64:
            # Photo analysis — Claude sees the image and returns nutrition
            message = client.messages.create(
                model="claude-opus-4-7",
                max_tokens=1000,
                messages=[{
                    "role": "user",
                    "content": [
                        {
                            "type": "image",
                            "source": {
                                "type": "base64",
                                "media_type": media_type,
                                "data": image_base64,
                            },
                        },
                        {
                            "type": "text",
                            "text": f"""You are a nutrition expert. Analyze this food image and return ONLY a JSON object with no explanation, no markdown, no backticks.

                            Return exactly this format:
                            {{"calories": 000, "protein": 00, "carbs": 00, "fat": 00, "description": "brief description of what you see"}}

                            Use realistic nutritional values for a typical serving size.
                            Additional context from user: {description}"""
                        }
                    ],
                }]
            )
        else:
            # Text analysis — Claude reads the description and returns nutrition
            message = client.messages.create(
                model="claude-opus-4-7",
                max_tokens=1000,
                messages=[{
                    "role": "user",
                    "content": f"""You are a nutrition expert. The user has described a meal. Analyze it and return ONLY a JSON object with no explanation, no markdown, no backticks.

                    Meal description: "{description}"

                    Return exactly this format:
                    {{"calories": 000, "protein": 00, "carbs": 00, "fat": 00}}

                    Use realistic nutritional values based on standard serving sizes.
                    If the description is not a food item, return:
                    {{"calories": 0, "protein": 0, "carbs": 0, "fat": 0}}"""
                }]
            )

        
        # RESPONSE FROM CLAUDE
        text = message.content[0].text
        clean = text.replace("```json", "").replace("```", "").strip()

        # DICTIONARY WITH PROTEIN CALORIES AND FAT
        nutrition = json.loads(clean)

        # CONNECT TO DATABASE
        meal = Meal(
            user_id = user.id, 
            type = name,
            description = nutrition.get("description") or description
        )
        db.session.add(meal)
        db.session.commit()

        nutrition_value = Nutrition(
            meal_id = meal.id,
            protein = nutrition.get("protein"),
            fat = nutrition.get("fat"),
            carbs = nutrition.get("carbs"),
            calories = nutrition.get("calories"),
        )
        db.session.add(nutrition_value)
        db.session.commit()

        return jsonify(meal.serialize()), 200

    except json.JSONDecodeError:
        return jsonify({"msg": "Claude returned an unexpected response"}), 500
    except Exception as e:
        print(f"Claude API error: {e}")
        return jsonify({"msg": "Failed to analyze meal"}), 500


########## SETTINGS -> GET ##########
@api.route('/settings', methods=['GET'])
@jwt_required()
def get_settings():
    current_user = get_jwt_identity()
    user = db.session.execute(
        select(User).where(User.email == current_user)
    ).scalar_one_or_none()

    if not user:
        return jsonify({"msg": "User not found"}), 404

    # Si no tiene perfil todavía, devuelve valores vacíos
    if not user.profile:
        return jsonify({
            "profile": {"name": None, "age": None, "gender": None},
            "health": {"weight": None, "weight_kg": None, "height_ft": None, "height_in": None, "height_cm": None},
            "unit": None,
            "activity": None,
            "weightGoal": None,
            "weeklyRate": None,
            "goals": {"calories": 2000, "protein": 150, "carbs": 250, "fat": 65}
        }), 200

    return jsonify(user.profile.serialize()), 200


########## SETTINGS -> POST ##########
@api.route('/settings', methods=['POST'])
@jwt_required()
def save_settings():
    current_user = get_jwt_identity()
    user = db.session.execute(
        select(User).where(User.email == current_user)
    ).scalar_one_or_none()

    if not user:
        return jsonify({"msg": "User not found"}), 404

    body = request.json
    if not body:
        return jsonify({"msg": "No data provided"}), 400

    # Si no tiene perfil, lo crea
    if not user.profile:
        user.profile = UserProfile(user_id=user.id)
        db.session.add(user.profile)

    profile = body.get("profile", {})
    health  = body.get("health", {})
    goals   = body.get("goals", {})

    user.profile.full_name   = profile.get("name",      user.profile.full_name)
    user.profile.age         = profile.get("age",       user.profile.age)
    user.profile.gender      = profile.get("gender",    user.profile.gender)
    user.profile.unit        = body.get("unit",         user.profile.unit)
    user.profile.activity    = body.get("activity",     user.profile.activity)
    user.profile.weight_goal = body.get("weightGoal",   user.profile.weight_goal)
    user.profile.weekly_rate = body.get("weeklyRate",   user.profile.weekly_rate)

    user.profile.weight    = health.get("weight",    user.profile.weight)
    user.profile.weight_kg = health.get("weight_kg", user.profile.weight_kg)
    user.profile.height_ft = health.get("height_ft", user.profile.height_ft)
    user.profile.height_in = health.get("height_in", user.profile.height_in)
    user.profile.height_cm = health.get("height_cm", user.profile.height_cm)

    user.profile.goal_calories = goals.get("calories", user.profile.goal_calories)
    user.profile.goal_protein  = goals.get("protein",  user.profile.goal_protein)
    user.profile.goal_carbs    = goals.get("carbs",    user.profile.goal_carbs)
    user.profile.goal_fat      = goals.get("fat",      user.profile.goal_fat)

    db.session.commit()
    return jsonify({"msg": "Settings saved successfully"}), 200