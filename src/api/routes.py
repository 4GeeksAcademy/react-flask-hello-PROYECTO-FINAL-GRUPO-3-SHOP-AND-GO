"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
from flask import Flask, request, jsonify, url_for, Blueprint
from api.models import db, User, Address, UserRole, Store, Order, OrderStatus
from api.utils import generate_sitemap, APIException, calculate_distance, calculate_order_price,geoapify_forward_geocode
from flask_cors import CORS
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from sqlalchemy import select
import random, requests

api = Blueprint('api', __name__)

# Allow CORS requests to this API
CORS(api)


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

    valid_roles = [r.value for r in UserRole]
    if role not in valid_roles:
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
        is_available=(role == "driver")        
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

    if current_user is None:
        return jsonify({"error": "User not found"}), 404

    if current_user.role != UserRole.admin:
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

    if current_user is None:
        return jsonify({"error": "User not found"}), 404

    
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

    if current_user is None:
        return jsonify({"error": "User not found"}), 404

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
        user.set_password(data["password"])

    if "role" in data:
        if current_user.role != UserRole.admin:
            return jsonify({"error": "Only admin can change roles"}), 403

        valid_roles = [r.value for r in UserRole]
        if data["role"] not in valid_roles:
            return jsonify({"error": f"Invalid role. Valid roles: {valid_roles}"}), 400

        user.role = UserRole(data["role"])
        user.is_available = data["role"] == "driver"

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

    if current_user is None:
        return jsonify({"error": "User not found"}), 404

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
@api.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    if not data:
        return jsonify({"error": "Invalid or missing JSON body"}), 400

    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400
    
    user = db.session.execute(
        select(User).where(User.email == email)
    ).scalar_one_or_none()
    
    if user is None:
        return jsonify({"error": "Invalid email or password"}), 401

    if user.check_password(password):
        access_token = create_access_token(identity=str(user.id))
        return jsonify({"msg": "Login successfully", "token": access_token}), 200
    else:
        return jsonify({"error": "Invalid email or password"}), 401

#ADDRESSES

@api.route("/addresses", methods=["POST"])
@jwt_required()
def new_address():
    data = request.get_json()
    if not data:
        return jsonify({"error": "Invalid or missing JSON body"}), 400

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
   
    user_id = int(get_jwt_identity())

    addresses = db.session.execute(
        select(Address).where(Address.user_id == user_id)
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
    data = request.get_json() or {}

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




@api.route('/orders', methods=['POST'])
@jwt_required()
def create_order():
    user_id = int(get_jwt_identity())
    data = request.get_json() or {}

    bags_count = data.get("bags_count")
    notes = data.get("notes")
    store_id = data.get("store_id")
    address_id = data.get("address_id")

    if store_id is None or address_id is None or bags_count is None:
        return jsonify({
            "error": "store_id, address_id and bags_count are required"
        }), 400

    if not isinstance(bags_count, int) or bags_count <= 0:
        return jsonify({"error": "bags_count must be a positive integer"}), 400

    user = db.session.execute(
        select(User).where(User.id == user_id)
    ).scalar_one_or_none()

    if user is None:
        return jsonify({"error": "User not found"}), 404

    store = db.session.execute(
        select(Store).where(Store.id == store_id)
    ).scalar_one_or_none()

    if store is None:
        return jsonify({"error": "Store not found"}), 404

    address = db.session.execute(
        select(Address).where(Address.id == address_id)
    ).scalar_one_or_none()

    if address is None:
        return jsonify({"error": "Address not found"}), 404

    if address.user_id != user_id:
        return jsonify({"error": "This address does not belong to you"}), 403

    if store.latitude is None or store.longitude is None:
        return jsonify({"error": "Store coordinates are missing"}), 400

    if address.latitude is None or address.longitude is None:
        return jsonify({"error": "Address coordinates are missing"}), 400

    distance_km = calculate_distance(
        store.latitude,
        store.longitude,
        address.latitude,
        address.longitude
    )

    price_eur = calculate_order_price(distance_km, bags_count)
    amount_cents = int(round(price_eur * 100))

    available_drivers = db.session.execute(
        select(User).where(
            User.role == UserRole.driver,
            User.is_available == True
        )
    ).scalars().all()

    assigned_driver = None
    if available_drivers:
        assigned_driver = random.choice(available_drivers)
        assigned_driver.is_available = False

    try:
        new_order = Order(
            bags_count=bags_count,
            notes=notes,
            amount_cents=amount_cents,
            status=OrderStatus.pending,
            user_id=user_id,
            store_id=store_id,
            address_id=address_id,
            driver_id=assigned_driver.id if assigned_driver else None
        )

        db.session.add(new_order)
        db.session.commit()

        return jsonify({
            "msg": "Order created successfully",
            "order": new_order.serialize(),
            "distance_km": round(distance_km, 2),
            "price_eur": round(price_eur, 2),
            "amount_cents": amount_cents,
            "driver_assigned": assigned_driver.name if assigned_driver else "No drivers available"
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@api.route('/orders', methods=['GET'])
@jwt_required()
def get_orders():

    user_id = int(get_jwt_identity())

    current_user = db.session.execute(
        select(User).where(User.id == user_id)
    ).scalar_one_or_none()

    if current_user is None:
        return jsonify({"error": "User not found"}), 404

    # ADMIN ve todos los pedidos
    if current_user.role == UserRole.admin:
        orders = db.session.execute(
            select(Order)
        ).scalars().all()

    # DRIVER solo ve los pedidos asignados a él
    elif current_user.role == UserRole.driver:
        orders = db.session.execute(
            select(Order).where(Order.driver_id == user_id)
        ).scalars().all()

    # USER solo ve sus propios pedidos
    else:
        orders = db.session.execute(
            select(Order).where(Order.user_id == user_id)
        ).scalars().all()

    return jsonify([order.serialize() for order in orders]), 200


@api.route('/orders/<int:order_id>', methods=['GET'])
@jwt_required()
def get_order(order_id):

    user_id = int(get_jwt_identity())

    current_user = db.session.execute(
        select(User).where(User.id == user_id)
    ).scalar_one_or_none()

    if current_user is None:
        return jsonify({"error": "User not found"}), 404

    order = db.session.execute(
        select(Order).where(Order.id == order_id)
    ).scalar_one_or_none()

    if order is None:
        return jsonify({"error": "Order not found"}), 404

    # ADMIN puede ver cualquier pedido
    if current_user.role == UserRole.admin:
        return jsonify(order.serialize()), 200

    # DRIVER solo puede ver pedidos asignados a él
    if current_user.role == UserRole.driver:
        if order.driver_id != user_id:
            return jsonify({"error": "Forbidden"}), 403
        return jsonify(order.serialize()), 200

    # USER solo puede ver sus propios pedidos
    if current_user.role == UserRole.user:
        if order.user_id != user_id:
            return jsonify({"error": "Forbidden"}), 403
        return jsonify(order.serialize()), 200

    return jsonify({"error": "Forbidden"}), 403


@api.route('/orders/<int:order_id>', methods=['PUT'])
@jwt_required()
def update_order(order_id):
    user_id = int(get_jwt_identity())
    data = request.get_json() or {}

    current_user = db.session.execute(
        select(User).where(User.id == user_id)
    ).scalar_one_or_none()

    if current_user is None:
        return jsonify({"error": "User not found"}), 404

    order = db.session.execute(
        select(Order).where(Order.id == order_id)
    ).scalar_one_or_none()

    if order is None:
        return jsonify({"error": "Order not found"}), 404

    if (
        current_user.role != UserRole.admin
        and order.user_id != user_id
        and order.driver_id != user_id
    ):
        return jsonify({"error": "Forbidden"}), 403

    try:
        if "status" in data:
            new_status = data["status"]
            valid_statuses = [s.value for s in OrderStatus]

            if new_status not in valid_statuses:
                return jsonify({
                    "error": f"Invalid status. Valid statuses: {valid_statuses}"
                }), 400

            if current_user.role == UserRole.user:
                if new_status != "cancelled":
                    return jsonify({"error": "Users can only cancel orders"}), 403
                if order.user_id != user_id:
                    return jsonify({"error": "Forbidden"}), 403
                if order.status != OrderStatus.pending:
                    return jsonify({"error": "Only pending orders can be cancelled"}), 400

            if current_user.role == UserRole.driver:
                if order.driver_id != user_id:
                    return jsonify({"error": "Forbidden"}), 403

            order.status = OrderStatus(new_status)

            if new_status in ["delivered", "cancelled"] and order.driver_id:
                driver = db.session.execute(
                    select(User).where(User.id == order.driver_id)
                ).scalar_one_or_none()

                if driver:
                    driver.is_available = True

        if "driver_id" in data:
            if current_user.role != UserRole.admin:
                return jsonify({"error": "Only admin can assign drivers"}), 403

            new_driver_id = data["driver_id"]

            if new_driver_id is None:
                if order.driver_id:
                    old_driver = db.session.execute(
                        select(User).where(User.id == order.driver_id)
                    ).scalar_one_or_none()

                    if old_driver:
                        old_driver.is_available = True

                order.driver_id = None

            else:
                new_driver = db.session.execute(
                    select(User).where(User.id == new_driver_id)
                ).scalar_one_or_none()

                if new_driver is None:
                    return jsonify({"error": "Driver not found"}), 404

                if new_driver.role != UserRole.driver:
                    return jsonify({"error": "Selected user is not a driver"}), 400

                if not new_driver.is_available and order.driver_id != new_driver_id:
                    return jsonify({"error": "Selected driver is not available"}), 400

                if order.driver_id and order.driver_id != new_driver_id:
                    old_driver = db.session.execute(
                        select(User).where(User.id == order.driver_id)
                    ).scalar_one_or_none()

                    if old_driver:
                        old_driver.is_available = True

                order.driver_id = new_driver_id
                new_driver.is_available = False

        if "notes" in data:
            if order.status != OrderStatus.pending:
                return jsonify({
                    "error": "Cannot edit notes after order is accepted"
                }), 400

            if current_user.role not in [UserRole.admin, UserRole.user]:
                return jsonify({"error": "Only admin or owner can edit notes"}), 403

            if current_user.role == UserRole.user and order.user_id != user_id:
                return jsonify({"error": "Forbidden"}), 403

            order.notes = data["notes"]

        if "bags_count" in data:
            if order.status != OrderStatus.pending:
                return jsonify({
                    "error": "Cannot edit bags_count after order is accepted"
                }), 400

            if current_user.role not in [UserRole.admin, UserRole.user]:
                return jsonify({"error": "Only admin or owner can edit bags_count"}), 403

            if current_user.role == UserRole.user and order.user_id != user_id:
                return jsonify({"error": "Forbidden"}), 403

            new_bags_count = data["bags_count"]

            if not isinstance(new_bags_count, int) or new_bags_count <= 0:
                return jsonify({"error": "bags_count must be a positive integer"}), 400

            order.bags_count = new_bags_count

            store = db.session.execute(
                select(Store).where(Store.id == order.store_id)
            ).scalar_one_or_none()

            address = db.session.execute(
                select(Address).where(Address.id == order.address_id)
            ).scalar_one_or_none()

            if store is None or address is None:
                return jsonify({
                    "error": "Could not recalculate amount because store or address was not found"
                }), 400

            if store.latitude is None or store.longitude is None:
                return jsonify({"error": "Store coordinates are missing"}), 400

            if address.latitude is None or address.longitude is None:
                return jsonify({"error": "Address coordinates are missing"}), 400

            distance_km = calculate_distance(
                store.latitude,
                store.longitude,
                address.latitude,
                address.longitude
            )

            new_price_eur = calculate_order_price(distance_km, new_bags_count)
            order.amount_cents = int(round(new_price_eur * 100))

        db.session.commit()

        return jsonify({
            "msg": "Order updated successfully",
            "order": order.serialize()
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

# POST STORE
@api.route('/stores', methods=['POST'])
@jwt_required()
def create_store():
    user_id = int(get_jwt_identity())

    current_user = db.session.execute(
        select(User).where(User.id == user_id)
    ).scalar_one_or_none()

    if current_user is None or current_user.role != UserRole.admin:
        return jsonify({"error": "Forbidden, admin only"}), 403

    data = request.get_json()
    if not data:
        return jsonify({"error": "Invalid or missing JSON body"}), 400

    name = data.get("name")
    qr_code = data.get("qr_code")
    street = data.get("street")
    city = data.get("city")
    postal_code = data.get("postal_code")

    if not name or not qr_code or not street or not city or not postal_code:
        return jsonify({
            "error": "name, qr_code, street, city and postal_code are required"
        }), 400

    try:
        geo_data = geoapify_forward_geocode(
            street=street,
            city=city,
            postal_code=str(postal_code)
        )

        if geo_data is None:
            return jsonify({"error": "Address could not be geocoded"}), 400

        new_store = Store(
            name=name,
            qr_code=qr_code,
            street=street,
            city=city,
            postal_code=postal_code,
            latitude=geo_data["lat"],
            longitude=geo_data["lon"]
        )

        db.session.add(new_store)
        db.session.commit()

        return jsonify({
            "msg": "Store created successfully",
            "store": new_store.serialize()
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({
            "error": "Internal server error",
            "details": str(e)
        }), 500
    
#TODAS LAS TIENDAS
@api.route('/stores', methods=['GET'])
@jwt_required()
def get_stores():
    user_id = int(get_jwt_identity())

    current_user = db.session.execute(
        select(User).where(User.id == user_id)
    ).scalar_one_or_none()

    if current_user is None:
        return jsonify({"error": "User not found"}), 404

    if current_user.role == UserRole.admin:
        stores = db.session.execute(
            select(Store)
        ).scalars().all()
    else:
        stores = db.session.execute(
            select(Store).where(Store.is_active == True)
        ).scalars().all()

    return jsonify([store.serialize() for store in stores]), 200

#TIENDA POR ID
@api.route('/stores/<int:store_id>', methods=['GET'])
@jwt_required()
def get_store(store_id):
    user_id = int(get_jwt_identity())

    current_user = db.session.execute(
        select(User).where(User.id == user_id)
    ).scalar_one_or_none()

    if current_user is None:
        return jsonify({"error": "User not found"}), 404

    store = db.session.execute(
        select(Store).where(Store.id == store_id)
    ).scalar_one_or_none()

    if store is None:
        return jsonify({"error": "Store not found"}), 404

    if current_user.role != UserRole.admin and not store.is_active:
        return jsonify({"error": "Store not found"}), 404

    return jsonify(store.serialize()), 200

#ACTUALIZAR TIENDA
@api.route('/stores/<int:store_id>', methods=['PUT'])
@jwt_required()
def update_store(store_id):

    user_id = int(get_jwt_identity())

    current_user = db.session.execute(
        select(User).where(User.id == user_id)
    ).scalar_one_or_none()

    if current_user is None or current_user.role != UserRole.admin:
        return jsonify({"error": "Forbidden, admin only"}), 403

    store = db.session.execute(
        select(Store).where(Store.id == store_id)
    ).scalar_one_or_none()

    if store is None:
        return jsonify({"error": "Store not found"}), 404

    data = request.get_json() or {}

    try:
        if "name" in data:
            if not data["name"]:
                return jsonify({"error": "name cannot be empty"}), 400
            store.name = data["name"]

        if "qr_code" in data:
            if not data["qr_code"]:
                return jsonify({"error": "qr_code cannot be empty"}), 400
            store.qr_code = data["qr_code"]

        if "street" in data:
            if not data["street"]:
                return jsonify({"error": "street cannot be empty"}), 400
            store.street = data["street"]

        if "city" in data:
            if not data["city"]:
                return jsonify({"error": "city cannot be empty"}), 400
            store.city = data["city"]

        if "postal_code" in data:
            if not data["postal_code"]:
                return jsonify({"error": "postal_code cannot be empty"}), 400
            store.postal_code = str(data["postal_code"])

        # Si cambia cualquier campo de dirección, recalculamos coordenadas
        if "street" in data or "city" in data or "postal_code" in data:
            geo_data = geoapify_forward_geocode(
                street=store.street,
                city=store.city,
                postal_code=str(store.postal_code)
            )

            if geo_data is None:
                return jsonify({"error": "Address could not be geocoded"}), 400

            store.latitude = geo_data["lat"]
            store.longitude = geo_data["lon"]

        db.session.commit()

        return jsonify({
            "msg": "Store updated successfully",
            "store": store.serialize()
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({
            "error": "Internal server error",
            "details": str(e)
        }), 500
    
#BORRAR TIENDA 
@api.route('/stores/<int:store_id>', methods=['DELETE'])
@jwt_required()
def delete_store(store_id):

    user_id = int(get_jwt_identity())

    current_user = db.session.execute(
        select(User).where(User.id == user_id)
    ).scalar_one_or_none()

    if current_user is None or current_user.role != UserRole.admin:
        return jsonify({"error": "Forbidden, admin only"}), 403

    store = db.session.execute(
        select(Store).where(Store.id == store_id)
    ).scalar_one_or_none()

    if store is None:
        return jsonify({"error": "Store not found"}), 404

    try:
        store.is_active = False
        db.session.commit()

        return jsonify({"msg": "Store deactivated successfully"}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({
            "error": "Internal server error",
            "details": str(e)
        }), 500