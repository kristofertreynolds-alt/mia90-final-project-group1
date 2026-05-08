"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
from flask import Flask, request, jsonify, url_for, Blueprint
from api.models import db, User, Meal, Nutrition
from api.utils import generate_sitemap, APIException
from flask_cors import CORS
from sqlalchemy import select
from flask_jwt_extended import create_access_token
from flask_jwt_extended import get_jwt_identity
from flask_jwt_extended import jwt_required
from flask_jwt_extended import JWTManager

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
    
    # hashPassword = password.hashfunction() 
    
    # I dont understand the key value pairs how to Call User Class and add user???
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
    #Check HTTP Request
    body = request.json
    if not body:
        return jsonify({"msg": "sorry your request is empty"}), 400
    email = body.get("email")
    if not email:
        return jsonify({"msg": "sorry no email"}), 400
    password = body.get("password")
    if not password:
        return jsonify({"msg": "sorry no password"}), 400
    
    #Check if User is in Database
    user = db.session.execute(
        select(User)
        .where(User.email == email)
        .where(User.password == password)
    ).scalar_one_or_none()
    
    if not user:
        return jsonify({"msg": "sorry user does not exist, please signup"}), 400
    
    #Create Token to Login
    access_token = create_access_token(identity=email)
    return jsonify({"access_token": access_token}), 201


########### USER PROFILE AREA ##########
@api.route("/profile", methods=["GET"])
@jwt_required()
def protected(): 
    # Access the identity of the current user with get_jwt_identity
    current_user = get_jwt_identity()

    # Get User Information from Database
    user = db.session.execute(
        select(User)
        .where(User.email == current_user)
    ).scalar_one_or_none()

    return jsonify(user.serialize()), 200




########## MEALS -> GET ########## /meals/1
@api.route('/meals', methods=['GET'])
@jwt_required()
def get_meals():
    userID = get_jwt_identity()
    statement = (
        select(Meal)
        .where(User.id == userID)
    )
    meal = db.session.execute(statement).scalars().all()
    meals = []
    for meal in meals: 
        dictionary = meal.serialize()
        meals.append(dictionary)
    return jsonify(meals), 200




########## MEALS -> POST ########## /meals/1
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
    
    ## STEP 1: CONNECT TO CLAUDE API WITH MEAL DESCRIPTION
    ## STEP 2: CREATE PROMPT FOR CLAUDE LIST CARBS, PROTEINS ETC...
    ## STEP 3: I WANT THE OUTPUT TO BE A JSON OBJECT
    ## STEP 4: CREATE THE MEAL AND SEND TO THE DATABASE
    ## STEP 5: IF PROMPT DOESNT HAVE A PROPER MEAL RETURN ERROR
    ## STEP 6: THEN CREATE MEAL AND NUTRITION OBJECT AND POST TO THE DATABASE

    meal = Meal(
        user_id = userID,
        description = body.get("description")
    )
    db.session.add(meal)
    db.session.commit()

#    nutrition = Nutrition(
#       meal_id = meal.id,
#       calories = DATA-RETURNED-BY-CLAUDE-API, 
#       protein = DATA-RETURNED-BY-CLAUDE-API, 
#       carbs = DATA-RETURNED-BY-CLAUDE-API, 
#       fat = DATA-RETURNED-BY-CLAUDE-API, 
#    )

    meal_dictionary = meal.serialize()
    return jsonify(meal_dictionary), 201
    
                              



#### EXAMPLE RESPONSE BODIES 
# get_meals_response_body = [{
#     "id": 4,
#     "datetime": "2026-05-04T22:40:01.869Z",
#     "name": "Dinner",
#     "description": "4 eggs, 2 arepas.",
#     "nutritional_value": {
#         "calories": 540,
#         "proteins": 64,
#         "carbs": 108,
#         "fats": 90
#     }
# }, {
#     "id": 6,
#     "datetime": "2026-05-04T12:40:01.869Z",
#     "name": "Breakfast",
#     "description": "4 eggs, 2 arepas.",
#     "nutritional_value": {
#         "calories": 421,
#         "proteins": 21,
#         "carbs": 90,
#         "fats": 10
#     }
# }];

# post_meal_request_body = {
#     "meal_description": "Some meal I had today"
# };

# post_meal_response_body = {
#     "id": 6,
#     "datetime": "2026-05-04T12:40:01.869Z",
#     "name": "Breakfast",
#     "description": "Some meal I had today",
#     "nutritional_value": {
#         "calories": 421,
#         "proteins": 21,
#         "carbs": 90,
#         "fats": 10
#     }
# }



# @api.route('/hello', methods=['POST', 'GET'])
# def handle_hello():

#     response_body = {
#         "message": "Hello! I'm a message that came from the backend, check the network tab on the google inspector and you will see the GET request"
#     }

#     return jsonify(response_body), 200


