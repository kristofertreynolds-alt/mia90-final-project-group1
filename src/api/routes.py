"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
from flask import Flask, request, jsonify, url_for, Blueprint
from api.models import db, User, Meal, Nutrition, UserProfile
from datetime import date as today_date
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
    return jsonify({"access_token": access_token, "user": user.serialize()}), 200


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
            description = nutrition.get("description") or description,
            date=today_date.today()
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

    # Create profile if user doesn't have one yet
    if not user.profile:
        user.profile = UserProfile(user_id=user.id)
        db.session.add(user.profile)

    profile = body.get("profile", {})
    health  = body.get("health", {})
    goals   = body.get("goals", {})
    unit    = body.get("unit", "imperial")

    # Profile
    user.profile.full_name   = profile.get("name",    user.profile.full_name)
    user.profile.age         = profile.get("age",     user.profile.age)
    user.profile.gender      = profile.get("gender",  user.profile.gender)
    user.profile.unit        = unit
    user.profile.activity    = body.get("activity",   user.profile.activity)
    user.profile.weight_goal = body.get("weightGoal", user.profile.weight_goal)
    user.profile.weekly_rate = body.get("weeklyRate", user.profile.weekly_rate)

    # Body — convert to metric before saving
    if unit == "imperial":
        weight_lbs = health.get("weight")
        height_ft  = health.get("height_ft")
        height_in  = health.get("height_in")

        if weight_lbs:
            try:
                user.profile.weight_kg = round(float(weight_lbs) * 0.453592, 2)
            except (ValueError, TypeError):
                pass

        if height_ft and height_in:
            try:
                total_inches = float(height_ft) * 12 + float(height_in)
                user.profile.height_cm = round(total_inches * 2.54, 2)
            except (ValueError, TypeError):
                pass

        # Target weight — convert lbs to kg before saving
        if health.get("target_weight"):
            try:
                user.profile.target_weight = round(float(health.get("target_weight")) * 0.453592, 2)
            except (ValueError, TypeError):
                pass

    else:
        weight_kg = health.get("weight_kg")
        height_cm = health.get("height_cm")

        if weight_kg:
            try:
                user.profile.weight_kg = float(weight_kg)
            except (ValueError, TypeError):
                pass

        if height_cm:
            try:
                user.profile.height_cm = float(height_cm)
            except (ValueError, TypeError):
                pass

        # Target weight — already in kg
        if health.get("target_weight"):
            try:
                user.profile.target_weight = float(health.get("target_weight"))
            except (ValueError, TypeError):
                pass

    # Goals
    user.profile.goal_calories = goals.get("calories", user.profile.goal_calories)
    user.profile.goal_protein  = goals.get("protein",  user.profile.goal_protein)
    user.profile.goal_carbs    = goals.get("carbs",    user.profile.goal_carbs)
    user.profile.goal_fat      = goals.get("fat",      user.profile.goal_fat)

    db.session.commit()
    return jsonify({"msg": "Settings saved successfully"}), 200

########## STREAK -> GET ##########
@api.route('/streak', methods=['GET'])
@jwt_required()
def get_streak():
    current_user = get_jwt_identity()
    user = db.session.execute(
        select(User).where(User.email == current_user)
    ).scalar_one_or_none()

    if not user:
        return jsonify({"streak": 0}), 404

    # Get all meals ordered by date descending
    meals = db.session.execute(
        select(Meal).where(Meal.user_id == user.id)
    ).scalars().all()

    if not meals:
        return jsonify({"streak": 0}), 200

    # Get unique dates from meals
    from datetime import date, timedelta
    meal_dates = set()
    for meal in meals:
        if meal.time:
            meal_dates.add(date.today())  # placeholder until we add date field

    # Count consecutive days
    streak = 0
    check_date = date.today()
    while check_date in meal_dates:
        streak += 1
        check_date -= timedelta(days=1)

    return jsonify({"streak": streak}), 200