"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
from flask import Flask, request, jsonify, url_for, Blueprint
from api.models import db, User, Address, UserRole, Store, Order, OrderStatus
from api.utils import generate_sitemap, APIException
from flask_cors import CORS
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from sqlalchemy import select
import random

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
        user.set_password(data["password"])  

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
    
    user_id = get_jwt_identity()

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

# ── PUT UPDATE STORE (solo admin) ─────────────────────────────
@api.route('/stores/<int:store_id>', methods=['PUT'])
@jwt_required()
def update_store(store_id):
    user_id = int(get_jwt_identity())

    current_user = db.session.execute(
        select(User).where(User.id == user_id)
    ).scalar_one_or_none()

    # solo el admin puede editar tiendas
    if current_user is None or current_user.role != UserRole.admin:
        return jsonify({"error": "Forbidden, admin only"}), 403

    store = db.session.execute(
        select(Store).where(Store.id == store_id)
    ).scalar_one_or_none()

    if store is None:
        return jsonify({"error": "Store not found"}), 404

    data = request.get_json() or {}

    # solo se actualizan los campos que lleguen
    if "name" in data:
        store.name = data["name"]

    if "qr_code" in data:
        store.qr_code = data["qr_code"]

    if "is_active" in data:
        store.is_active = data["is_active"]

    db.session.commit()

    return jsonify({
        "msg": "Store updated successfully",
        "store": store.serialize()
    }), 200

# ── DELETE STORE (solo admin) ──────────────────────────────────
@api.route('/stores/<int:store_id>', methods=['DELETE'])
@jwt_required()
def delete_store(store_id):
    user_id = int(get_jwt_identity())

    current_user = db.session.execute(
        select(User).where(User.id == user_id)
    ).scalar_one_or_none()

    # solo el admin puede eliminar tiendas
    if current_user is None or current_user.role != UserRole.admin:
        return jsonify({"error": "Forbidden, admin only"}), 403

    store = db.session.execute(
        select(Store).where(Store.id == store_id)
    ).scalar_one_or_none()

    if store is None:
        return jsonify({"error": "Store not found"}), 404

    # en vez de borrar físicamente, desactivamos la tienda
    # así no se pierden los pedidos asociados a ella
    store.is_active = False
    db.session.commit()

    return jsonify({"msg": "Store deactivated successfully"}), 200


@api.route('/orders', methods=['POST'])
@jwt_required()
def create_order():

    user_id = int(get_jwt_identity())
    data = request.get_json() or {}

    bags_count   = data.get("bags_count")
    notes        = data.get("notes")

    amount_cents = data.get("amount_cents")
    store_id     = data.get("store_id")
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
   
    # ── ASIGNAR DRIVER ALEATORIO ───────────────────────────────

    available_drivers = db.session.execute(
        select(User).where(
            User.role == UserRole.driver,
            User.is_available == True
        )
    ).scalars().all()

    # si hay drivers disponibles elegimos uno al azar
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

    if current_user.role == UserRole.admin:
        orders = db.session.execute(
            select(Order)  
        ).scalars().all()

    # si es DRIVER solo ve los pedidos que tiene asignados, por su id
    
    elif current_user.role == UserRole.driver:
        orders = db.session.execute(
            select(Order).where(Order.driver_id == user_id)
        ).scalars().all()

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

    order = db.session.execute(
        select(Order).where(Order.id == order_id)
    ).scalar_one_or_none()

    if order is None:
        return jsonify({"error": "Order not found"}), 404

    if (order.user_id != user_id and
        order.driver_id != user_id and
        current_user.role != UserRole.admin):
        return jsonify({"error": "Forbidden"}), 403

    return jsonify(order.serialize()), 200

@api.route('/orders/<int:order_id>', methods=['PUT'])
@jwt_required()
def update_order(order_id):

    user_id = int(get_jwt_identity())

    data = request.get_json() or {}

    # buscamos al usuario completo en la BD
    # lo necesitamos para verificar su rol
    current_user = db.session.execute(
        select(User).where(User.id == user_id)
    ).scalar_one_or_none()

    order = db.session.execute(
        select(Order).where(Order.id == order_id)
    ).scalar_one_or_none()

   
    if order is None:
        return jsonify({"error": "Order not found"}), 404

    # ── VERIFICAR PERMISOS GENERALES ───────────────────────────

    if (order.user_id != user_id and
        order.driver_id != user_id and
        current_user.role != UserRole.admin):
        return jsonify({"error": "Forbidden"}), 403

    # ── ACTUALIZAR STATUS ──────────────────────────────────────

    if "status" in data:
        new_status = data["status"]

        # ["pending", "accepted", "in_transit", "delivered", "cancelled"]
        valid_statuses = [s.value for s in OrderStatus]

        # si el status que mandó el cliente no existe en el Enum → 400
        if new_status not in valid_statuses:
            return jsonify({"error": f"Invalid status. Valid statuses: {valid_statuses}"}), 400

        if current_user.role == UserRole.user and new_status != "cancelled":
            return jsonify({"error": "Users can only cancel orders"}), 403

        # convertimos el string "cancelled" al Enum OrderStatus.cancelled
        order.status = OrderStatus(new_status)

        # si el pedido se entrega o cancela, el driver vuelve a estar disponible
        if new_status in ["delivered", "cancelled"] and order.driver_id:
            driver = db.session.execute(
                select(User).where(User.id == order.driver_id)
            ).scalar_one_or_none()
            if driver:
                driver.is_available = True

    # ── ACTUALIZAR DRIVER ──────────────────────────────────────

    # solo el admin puede asignar o cambiar el driver de un pedido
    if "driver_id" in data:
        if current_user.role != UserRole.admin:
            return jsonify({"error": "Only admin can assign drivers"}), 403

        # asignamos el nuevo driver al pedido
        order.driver_id = data["driver_id"]


    # si ya fue aceptado o está en tránsito no tiene sentido cambiarlas
    if "notes" in data:
        if order.status != OrderStatus.pending:
            return jsonify({"error": "Cannot edit notes after order is accepted"}), 400
        order.notes = data["notes"]

    # si el pedido ya fue aceptado el número de bolsas no puede cambiar
    if "bags_count" in data:
        if order.status != OrderStatus.pending:
            return jsonify({"error": "Cannot edit bags_count after order is accepted"}), 400
        order.bags_count = data["bags_count"]

    db.session.commit()

    return jsonify({
        "msg": "Order updated successfully",
        "order": order.serialize()
    }), 200
