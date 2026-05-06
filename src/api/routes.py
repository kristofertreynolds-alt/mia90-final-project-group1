"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
from flask import Flask, request, jsonify, url_for, Blueprint
from api.models import db, User
from api.utils import generate_sitemap, APIException
from flask_cors import CORS
from models import db, User, Meal, Nutrition
from sqlalchemy import select

api = Blueprint('api', __name__)

# Allow CORS requests to this API
CORS(api)


# @api.route('/hello', methods=['POST', 'GET'])
# def handle_hello():

#     response_body = {
#         "message": "Hello! I'm a message that came from the backend, check the network tab on the google inspector and you will see the GET request"
#     }

#     return jsonify(response_body), 200


########### USERS ########## /users
@api.route("/users")
def get_users():
    users = db.session.execute(select(User)).scalars().all()
    user_dictionaries = [user.serialize() for user in users]
    return jsonify(user_dictionaries), 200


########## MEALS -> GET ########## /meals/1
@api.route('/meals/<int:user_id>', methods=['GET'])
def get_meals(user_id):
    statement = (
        select(Meal)
        .where(User.id == user_id)
    )
    meal = db.session.execute(statement).scalars().all()
    meals = []
    for meal in meals: 
        dictionary = meal.serialize()
        meals.append(dictionary)
    return jsonify(meals), 200


########## MEALS -> POST ########## /meals/1
@api.route('/meals/<int:user_id', methods=['POST'])
def post_meals(user_id):
    body = request.json
    if not body: 
        return jsonify({"msg": "sorry no meal to add to database"}), 400
    
    user = db.session.execute(select(User).where(User.id == user_id)).scalar_one_or_none()
    if not user:
        return jsonify({"msg": "sorry no user was found"}), 400
    
    meal = Meal(
        user_id = user_id,
        name = body.get("name"),
        description = body.get("description")
    )
    db.session.add(meal)
    db.session.commit()
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
