"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
from flask import Flask, request, jsonify, url_for, Blueprint
from api.models import db, User, Address, UserRole
from api.utils import generate_sitemap, APIException
from flask_cors import CORS
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from sqlalchemy import select
from api.utils import geoapify_forward_geocode
import requests 

api = Blueprint('api', __name__)

# Allow CORS requests to this API
CORS(api)

VALID_ROLES = ["user","driver","admin"] #se ve más profesional en MAYUS


#REGISTER
@api.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    if not data:
        return jsonify({"error": "Invalid or missing JSON body"}), 400

    name = data.get("name")
    email = data.get("email")
    phone = data.get("phone")
    password = data.get("password")
    role = data.get ("role", "user")

    if role not in VALID_ROLES:
        return jsonify({"error": "Invalid role"}), 400

    if not name or not email or not password or phone is None:
        return jsonify({"error": "name, email, phone and password are required"}), 400

    existing_user = db.session.execute(
        select(User).where(User.email == email)
    ).scalar_one_or_none()

    if existing_user:
        return jsonify({"error": "user with this email already exists"}), 409

    new_user = User(
        email=email,
        name=name,
        phone=phone,
        role=UserRole(role),      
        is_available=True         
    )
    new_user.set_password(password)

    db.session.add(new_user)
    db.session.commit()

    return jsonify({"msg": "User created successfully", "user":new_user.serialize()}), 201


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

#ADDRESSES

@api.route("/addresses", methods=["POST"])
@jwt_required()
def new_address():
    data = request.get_json() 

    street = data.get("street")
    city = data.get("city")
    postal_code = data.get("postal_code")
    label = data.get("label")

    if not street or not city or not postal_code:
        return jsonify({"error": "street, city and postal_code are required"}), 400

    user_id = int(get_jwt_identity())

    user = db.session.execute(
        select(User).where(User.id == user_id)
    ).scalar_one_or_none()

    if user is None:
        return jsonify({"error": "User not found"}), 404

    try:
        geo_data = geoapify_forward_geocode(
            street=street,
            city=city,
            postal_code=str(postal_code)
        )

        if geo_data is None:
            return jsonify({"error": "Address could not be geocoded"}), 400

        new_address = Address(
            street=street,
            city=city,
            postal_code=postal_code,
            latitude=geo_data["lat"],
            longitude=geo_data["lon"],
            label=label,
            user_id=user_id
        )

        db.session.add(new_address)
        db.session.commit()

        return jsonify({
            "msg": "Address created successfully",
            "address": new_address.serialize(),
            "geocoded_address": geo_data["formatted"]
        }), 201

    except requests.exceptions.RequestException as e:
        db.session.rollback()
        return jsonify({"error": f"Geoapify request failed: {str(e)}"}), 502

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

#OBTENER DIRECCIONES TODAS

@api.route("/addresses", methods=["GET"])
@jwt_required()
def get_addresses():
    user_id = get_jwt_identity()

    addresses = db.session.execute(
        select(Address).where(Address.user_id == int(user_id))
    ).scalars().all()

    return jsonify([a.serialize() for a in addresses]), 200

#OBTENER DIRECCIONES POR ID

@api.route("/addresses/<int:address_id>", methods=["GET"])
@jwt_required()
def get_address(address_id):
    user_id = int(get_jwt_identity())

    address = db.session.execute(
        select(Address).where(Address.id == address_id)
    ).scalar_one_or_none()

    if address is None:
        return jsonify({"error": "Address not found"}), 404

    #Solo el dueño puede verla
    if address.user_id != user_id:
        return jsonify({"error": "Forbidden"}), 403

    return jsonify(address.serialize()), 200