"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
from flask import Flask, request, jsonify, url_for, Blueprint
from api.models import db, User
from api.utils import generate_sitemap, APIException
from flask_cors import CORS
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from sqlalchemy import select

api = Blueprint('api', __name__)

# Allow CORS requests to this API
CORS(api)

VALID_ROLES = ["customer","driver", "admin"] #se ve más profesional en MAYUS


#REGISTER
@api.route('/register', methods=['POST'])
def register():

    data = request.get_json()
    name = data.get("name")
    email = data.get("email")
    phone = data.get ("phone")
    password = data.get ("password")
    role = data.get ("role", "customer")

    if role not in VALID_ROLES:
        return jsonify({"error": "Invalid role"}), 400


    if not email or not password or not phone: #movile also required
        return jsonify({"error": "email and password are required"}), 400
    #db.session.execute(select(Model).where(Model.id == id)).scalar_one()
    existing_user = db.session.execute(select(User).where(
        User.email == email)).scalar_one_or_none()
    
    if existing_user:
        return jsonify({"error": "user with this email alredy exists"}), 409
    new_user = User(email= email, name=name, phone = phone, role = role, is_avaliable = True)
    new_user.set_password(password)

    db.session.add(new_user)
    db.session.commit()

    return jsonify({"msg": "User created successfully"}), 201


#LOGIN
@api.route('/login', methods = ['POST'])
def login():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400
    
    user = db.session.execute(select(User).where(
        User.email == email)).scalar_one_or_none()
    
    if user is None:
        return jsonify({"error": "invalid email or password"}), 401
    if user.check_password(password):
        access_token = create_access_token(identity=str (user.id))
        return jsonify({"msg": "login successfully", "token": access_token}), 200
    else: 
        return jsonify({"error": "Invalid email or password"}), 401