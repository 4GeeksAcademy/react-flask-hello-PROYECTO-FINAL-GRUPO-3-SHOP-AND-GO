from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import String, ForeignKey, DateTime, Enum, Boolean
from sqlalchemy.orm import Mapped, mapped_column
from flask_bcrypt import  generate_password_hash, check_password_hash
from datetime import datetime, timezone


db = SQLAlchemy()

# -----------------------
# ENUMS 
# -----------------------
user_role = Enum(
    "customer",
    "driver",
    "admin",
    name="user_role"
)
payment_status = Enum(
    "pending",
    "paid",
    "failed",
    "refunded",
    name="payment_status"
)
order_status = Enum(
    "pending",
    "accepted",
    "picked_up",
    "delivered",
    "cancelled",
    name="order_status"
)

class User(db.Model):

    __tablename__ = 'users'

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(120), unique=True, nullable=False)
    email: Mapped[str] = mapped_column(String(120), unique=True, nullable=False)
    phone: Mapped[str] = mapped_column(String(20), unique=True, nullable=False)
    
    role: Mapped[str] = mapped_column(
        user_role,
        nullable=False, 
        default="customer") #Enum = Lista cerrada de opciones válidas
    #valores permitidos: 'customer', 'driver', 'admin'
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    is_available: Mapped[bool] = mapped_column(Boolean(), nullable=False, default=False)

# para setear la contraseña (guardarla codificada)
    def set_password(self, password):
        self.password_hash = generate_password_hash(password).decode("utf-8") #para que la contraseña no salga con caracteres anomalos

# Compara si lo que escribe la persona coincide con la anterior contraseña codificada
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)
    

    def serialize(self):
        return {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "phone": self.phone,
            "role": self.role,
            "is_available": self.is_available # se serializa por disponibilidad de los drivers
            # do not serialize the password, its a security breach
        }

class Addresses(db.Model):
    __tablename__ = "addresses"

    id: Mapped[int] = mapped_column(primary_key=True)

    user_id: Mapped[int] = mapped_column(
        db.ForeignKey("users.id"),
        nullable=False
    )

    street: Mapped[str] = mapped_column(String(120), nullable=False)
    city: Mapped[str] = mapped_column(String(80), nullable=False)
    postal_code: Mapped[int] = mapped_column(nullable=False)
    latitude: Mapped[float] = mapped_column(nullable=True)
    longitude: Mapped[float] = mapped_column(nullable=True)

    label: Mapped[str] = mapped_column(String(50), nullable=True)

    def serialize(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "street": self.street,
            "city": self.city,
            "postal_code": self.postal_code,
            "latitude": self.latitude,
            "longitude": self.longitude,
            "label": self.label
        }
    
class Orders(db.Model):
    __tablename__ = "orders"

    id: Mapped[int] = mapped_column(primary_key=True)

    user_id: Mapped[int] = mapped_column(
        db.ForeignKey("users.id"),
        nullable=False
    )

    driver_id: Mapped[int] = mapped_column(
        db.ForeignKey("users.id"),
        nullable=True
    )

    store_id: Mapped[int] = mapped_column(
        db.ForeignKey("stores.id"),
        nullable=False
    )

    address_id: Mapped[int] = mapped_column(
        db.ForeignKey("addresses.id"),
        nullable=False
    )

    bags_count: Mapped[int] = mapped_column(
        nullable=False,
        default=1
    )
    notes: Mapped[str] = mapped_column(String(255), nullable=True)
    status: Mapped[str] = mapped_column(
        order_status,
        nullable=False,
        default="pending"
    )
    amount_cents: Mapped[int] = mapped_column(nullable=False)

    def serialize(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "driver_id": self.driver_id,
            "store_id": self.store_id,
            "address_id": self.address_id,
            "bags_count": self.bags_count,
            "notes": self.notes,
            "status": self.status,
            "amount_cents": self.amount_cents
        }

class Stores(db.Model):
    __tablename__ = "stores"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    address: Mapped[str] = mapped_column(String(200), nullable=False)
    latitude: Mapped[float] = mapped_column(nullable=True)
    longitude: Mapped[float] = mapped_column(nullable=True)
    qr_code: Mapped[str] = mapped_column(String(255), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean(), default=True, nullable=False)

    def serialize(self):
        return {
            "id": self.id,
            "name": self.name,
            "address": self.address,
            "latitude": self.latitude,
            "longitude": self.longitude,
            "qr_code": self.qr_code,
            "is_active": self.is_active
        }



class Payments(db.Model):
    __tablename__ = "payments"

    id: Mapped[int] = mapped_column(primary_key=True)

    order_id: Mapped[int] = mapped_column(
        ForeignKey("orders.id"),
        nullable=False
    )

    amount_cents: Mapped[int] = mapped_column(nullable=False)

    currency: Mapped[str] = mapped_column(
        String(10),
        nullable=False,
        default="EUR"
    )

    status: Mapped[str] = mapped_column(
        payment_status,
        nullable=False,
        default="pending"
    )

    stripe_session_id: Mapped[str] = mapped_column(
        String(255),
        nullable=True
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False
    )

    def serialize(self):
        return {
            "id": self.id,
            "order_id": self.order_id,
            "amount_cents": self.amount_cents,
            "currency": self.currency,
            "status": self.status,
            "stripe_session_id": self.stripe_session_id,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }        