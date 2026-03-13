"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
from flask import Flask, request, jsonify, url_for, Blueprint
from api.models import db, User, Address, UserRole, Store, Order, OrderStatus, Payment, PaymentStatus
from api.utils import generate_sitemap, APIException
from flask_cors import CORS
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from sqlalchemy import select
from api.utils import geoapify_forward_geocode
import requests 
import stripe
import os

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
# =========================
# USER CRUD
# =========================


@api.route('/users', methods=['GET'])
@jwt_required()
def get_users():
    current_user_id = int(get_jwt_identity())

    current_user = db.session.execute(
        select(User).where(User.id == current_user_id)
    ).scalar_one_or_none()

    if current_user is None or current_user.role != UserRole.admin:
        return jsonify({"error": "Forbidden, admin only"}), 403

    users = db.session.execute(select(User)).scalars().all()

    return jsonify([user.serialize() for user in users]), 200



@api.route('/users/<int:user_id>', methods=['GET'])
@jwt_required()
def get_user(user_id):
    current_user_id = int(get_jwt_identity())

    current_user = db.session.execute(
        select(User).where(User.id == current_user_id)
    ).scalar_one_or_none()

    
    if current_user_id != user_id and current_user.role != UserRole.admin:
        return jsonify({"error": "Forbidden"}), 403

    user = db.session.execute(
        select(User).where(User.id == user_id)
    ).scalar_one_or_none()

    if user is None:
        return jsonify({"error": "User not found"}), 404

    return jsonify(user.serialize()), 200



@api.route('/users/<int:user_id>', methods=['PUT'])
@jwt_required()
def update_user(user_id):
    current_user_id = int(get_jwt_identity())

    current_user = db.session.execute(
        select(User).where(User.id == current_user_id)
    ).scalar_one_or_none()

    
    if current_user_id != user_id and current_user.role != UserRole.admin:
        return jsonify({"error": "Forbidden"}), 403

    user = db.session.execute(
        select(User).where(User.id == user_id)
    ).scalar_one_or_none()

    if user is None:
        return jsonify({"error": "User not found"}), 404

    data = request.get_json() or {}

    
    if "name" in data:
        user.name = data["name"]

    if "phone" in data:
        user.phone = data["phone"]

    if "password" in data:
        user.set_password(data["password"])  # hashea la nueva contraseña

    # solo el admin puede cambiar el rol
    if "role" in data:
        if current_user.role != UserRole.admin:
            return jsonify({"error": "Only admin can change roles"}), 403
        valid_roles = [r.value for r in UserRole]
        if data["role"] not in valid_roles:
            return jsonify({"error": f"Invalid role. Valid roles: {valid_roles}"}), 400
        user.role = UserRole(data["role"])

    db.session.commit()

    return jsonify({
        "msg": "User updated successfully",
        "user": user.serialize()
    }), 200


# ── DELETE USER (dueño o admin) ────────────────────────────────
@api.route('/users/<int:user_id>', methods=['DELETE'])
@jwt_required()
def delete_user(user_id):
    current_user_id = int(get_jwt_identity())

    current_user = db.session.execute(
        select(User).where(User.id == current_user_id)
    ).scalar_one_or_none()

    # solo puede borrarlo el dueño o un admin
    if current_user_id != user_id and current_user.role != UserRole.admin:
        return jsonify({"error": "Forbidden"}), 403

    user = db.session.execute(
        select(User).where(User.id == user_id)
    ).scalar_one_or_none()

    if user is None:
        return jsonify({"error": "User not found"}), 404

    db.session.delete(user)
    db.session.commit()

    return jsonify({"msg": "User deleted successfully"}), 200


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
  
    if address.user_id != user_id:
        return jsonify({"error": "Forbidden"}), 403

    return jsonify(address.serialize()), 200

#ACTUALIZAR DIRECCIONES POR ID
@api.route("/addresses/<int:address_id>", methods=["PUT"])
@jwt_required()
def update_address(address_id):

    data = request.get_json()

    street = data.get("street")
    city = data.get("city")
    postal_code = data.get("postal_code")
    label = data.get("label")

    user_id = int(get_jwt_identity())

    address = db.session.execute(
        select(Address).where(
            Address.id == address_id,
            Address.user_id == user_id
        )
    ).scalar_one_or_none()

    if address is None:
        return jsonify({"error": "Address not found"}), 404

    try:

        # Si cambian los datos de dirección se recalculan las coordenadas
        if street or city or postal_code:

            new_street = street if street else address.street
            new_city = city if city else address.city
            new_postal_code = postal_code if postal_code else address.postal_code

            geo_data = geoapify_forward_geocode(
                street=new_street,
                city=new_city,
                postal_code=str(new_postal_code)
            )

            if geo_data is None:
                return jsonify({"error": "Address could not be geocoded"}), 400

            address.latitude = geo_data["lat"]
            address.longitude = geo_data["lon"]

            address.street = new_street
            address.city = new_city
            address.postal_code = new_postal_code

        if label is not None:
            address.label = label

        db.session.commit()

        return jsonify({
            "msg": "Address updated successfully",
            "address": address.serialize()
        }), 200

    except requests.exceptions.RequestException as e:
        db.session.rollback()
        return jsonify({"error": f"Geoapify request failed: {str(e)}"}), 502

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500
    
#ELIMINAR DIRECCION POR ID
@api.route("/addresses/<int:address_id>", methods=["DELETE"])
@jwt_required()
def delete_address(address_id):

    user_id = int(get_jwt_identity())

    address = db.session.execute(
        select(Address).where(
            Address.id == address_id,
            Address.user_id == user_id
        )
    ).scalar_one_or_none()

    if address is None:
        return jsonify({"error": "Address not found"}), 404

    try:
        db.session.delete(address)
        db.session.commit()

        return jsonify({
            "msg": "Address deleted successfully"
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

    return jsonify([s.serialize() for s in stores]), 200


@api.route('/orders', methods=['POST'])
@jwt_required()
def create_order():

    user_id = int(get_jwt_identity())
    data = request.get_json() or {}

    bags_count   = data.get("bags_count")
    notes        = data.get("notes")

    amount_cents = data.get("amount_cents")
    git_id     = data.get("store_id")
    address_id   = data.get("address_id")

    if not amount_cents or not store_id or not address_id:
        return jsonify({"error": "amount_cents, store_id and address_id are required"}), 400

    # ── VERIFICAR QUE EL USUARIO EXISTE ───────────────────────

    user = db.session.execute(
        select(User).where(User.id == user_id)
    ).scalar_one_or_none() 
    if user is None:
        return jsonify({"error": "User not found"}), 404    
 # ── VERIFICAR QUE LA TIENDA EXISTE ────────────────────────
    store = db.session.execute(
        select(Store).where(Store.id == store_id)
    ).scalar_one_or_none()

    if store is None:
        return jsonify({"error": "Store not found"}), 404
    # ── VERIFICAR QUE LA DIRECCIÓN EXISTE Y ES DEL USUARIO ────

    address = db.session.execute(
        select(Address).where(Address.id == address_id)
    ).scalar_one_or_none()

    if address is None:
        return jsonify({"error": "Address not found"}), 404

    if address.user_id != user_id:
        return jsonify({"error": "This address does not belong to you"}), 403
   
    # ── CREAR EL PEDIDO ────────────────────────────────────────

    try:
        new_order = Order(
            bags_count=bags_count,
            notes=notes,
            amount_cents=amount_cents,
            status=OrderStatus.pending,  
                                         
            user_id=user_id,             
            store_id=store_id,           
            address_id=address_id        
           
        )

        db.session.add(new_order)

        db.session.commit()

        return jsonify({
            "msg": "Order created successfully",
            "order": new_order.serialize()  
        }), 201
        

    except Exception as e:
        # si algo falla, deshacemos todos los cambios de esta sesión
        # para no dejar datos a medias en la BD
        db.session.rollback()
        return jsonify({"error": str(e)}), 500
    


import stripe
import os

stripe.api_key = os.getenv("STRIPE_SECRET_KEY")

# ── POST CREATE PAYMENT (usuario autenticado) ──────────────────
@api.route('/payments', methods=['POST'])
@jwt_required()
def create_payment():
    user_id = int(get_jwt_identity())
    data = request.get_json() or {}

    order_id = data.get("order_id")
    currency = data.get("currency", "eur")  # por defecto euros

    if not order_id:
        return jsonify({"error": "order_id is required"}), 400

    # verificar que el pedido existe
    order = db.session.execute(
        select(Order).where(Order.id == order_id)
    ).scalar_one_or_none()

    if order is None:
        return jsonify({"error": "Order not found"}), 404

    # solo el dueño del pedido puede pagar
    if order.user_id != user_id:
        return jsonify({"error": "Forbidden"}), 403

    # verificar que el pedido no tiene ya un pago
    existing_payment = db.session.execute(
        select(Payment).where(Payment.order_id == order_id)
    ).scalar_one_or_none()

    if existing_payment:
        return jsonify({"error": "This order already has a payment"}), 409

    try:
        # crear el Payment Intent en Stripe
        intent = stripe.PaymentIntent.create(
            amount=order.amount_cents,      # cantidad en céntimos
            currency=currency,              # "eur", "usd", etc.
            metadata={"order_id": order_id} # info extra para identificarlo
        )

        # guardar el pago en nuestra BD
        new_payment = Payment(
            amount_cents=order.amount_cents,
            currency=currency,
            status=PaymentStatus.pending,
            stripe_session_id=intent["id"],  # guardamos el id de Stripe
            order_id=order_id
        )

        db.session.add(new_payment)
        db.session.commit()

        return jsonify({
            "msg": "Payment created successfully",
            "client_secret": intent["client_secret"],  # el frontend lo necesita para completar el pago
            "payment": new_payment.serialize()
        }), 201

    except stripe.error.StripeError as e:
        db.session.rollback()
        return jsonify({"error": f"Stripe error: {str(e)}"}), 502

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


# ── GET ALL PAYMENTS ───────────────────────────────────────────
@api.route('/payments', methods=['GET'])
@jwt_required()
def get_payments():
    user_id = int(get_jwt_identity())

    current_user = db.session.execute(
        select(User).where(User.id == user_id)
    ).scalar_one_or_none()

    if current_user is None:
        return jsonify({"error": "User not found"}), 404

    # admin ve todos los pagos
    if current_user.role == UserRole.admin:
        payments = db.session.execute(
            select(Payment)
        ).scalars().all()

    # usuario normal solo ve los pagos de sus pedidos
    else:
        payments = db.session.execute(
            select(Payment).join(Order).where(Order.user_id == user_id)
        ).scalars().all()

    return jsonify([p.serialize() for p in payments]), 200


# ── GET ONE PAYMENT ────────────────────────────────────────────
@api.route('/payments/<int:payment_id>', methods=['GET'])
@jwt_required()
def get_payment(payment_id):
    user_id = int(get_jwt_identity())

    current_user = db.session.execute(
        select(User).where(User.id == user_id)
    ).scalar_one_or_none()

    payment = db.session.execute(
        select(Payment).where(Payment.id == payment_id)
    ).scalar_one_or_none()

    if payment is None:
        return jsonify({"error": "Payment not found"}), 404

    # solo el dueño del pedido o un admin pueden ver el pago
    if payment.order.user_id != user_id and current_user.role != UserRole.admin:
        return jsonify({"error": "Forbidden"}), 403

    return jsonify(payment.serialize()), 200


# ── PUT UPDATE PAYMENT (webhook de Stripe o admin) ─────────────
@api.route('/payments/<int:payment_id>', methods=['PUT'])
@jwt_required()
def update_payment(payment_id):
    user_id = int(get_jwt_identity())

    current_user = db.session.execute(
        select(User).where(User.id == user_id)
    ).scalar_one_or_none()

    # solo el admin puede actualizar el estado del pago manualmente
    if current_user is None or current_user.role != UserRole.admin:
        return jsonify({"error": "Forbidden, admin only"}), 403

    payment = db.session.execute(
        select(Payment).where(Payment.id == payment_id)
    ).scalar_one_or_none()

    if payment is None:
        return jsonify({"error": "Payment not found"}), 404

    data = request.get_json() or {}

    if "status" in data:
        valid_statuses = [s.value for s in PaymentStatus]
        if data["status"] not in valid_statuses:
            return jsonify({"error": f"Invalid status. Valid statuses: {valid_statuses}"}), 400

        payment.status = PaymentStatus(data["status"])

        # si el pago se marca como pagado, actualizamos el pedido a accepted
        if data["status"] == "paid":
            payment.order.status = OrderStatus.accepted

    db.session.commit()

    return jsonify({
        "msg": "Payment updated successfully",
        "payment": payment.serialize()
    }), 200


# ── DELETE PAYMENT (solo admin) ────────────────────────────────
@api.route('/payments/<int:payment_id>', methods=['DELETE'])
@jwt_required()
def delete_payment(payment_id):
    user_id = int(get_jwt_identity())

    current_user = db.session.execute(
        select(User).where(User.id == user_id)
    ).scalar_one_or_none()

    if current_user is None or current_user.role != UserRole.admin:
        return jsonify({"error": "Forbidden, admin only"}), 403

    payment = db.session.execute(
        select(Payment).where(Payment.id == payment_id)
    ).scalar_one_or_none()

    if payment is None:
        return jsonify({"error": "Payment not found"}), 404

    # cancelamos el Payment Intent en Stripe antes de borrar
    try:
        stripe.PaymentIntent.cancel(payment.stripe_session_id)
    except stripe.error.StripeError as e:
        return jsonify({"error": f"Stripe error: {str(e)}"}), 502

    db.session.delete(payment)
    db.session.commit()

    return jsonify({"msg": "Payment deleted successfully"}), 200
       
