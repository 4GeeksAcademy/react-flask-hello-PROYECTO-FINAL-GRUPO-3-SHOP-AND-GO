from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import String, Integer, Boolean, ForeignKey, Float, Enum, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from flask_bcrypt import Bcrypt, generate_password_hash, check_password_hash
from datetime import datetime
import enum

db = SQLAlchemy()

# =========================
# ENUMS
# =========================

class UserRole(enum.Enum):
    user = "user"
    driver = "driver"


class OrderStatus(enum.Enum):
    pending = "pending"
    accepted = "accepted"
    in_transit = "in_transit"
    delivered = "delivered"
    cancelled = "cancelled"


class PaymentStatus(enum.Enum):
    pending = "pending"
    paid = "paid"
    failed = "failed"


# =========================
# MODELS
# =========================

class User(db.Model):
    __tablename__ = "user"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    email: Mapped[str] = mapped_column(String(120), unique=True, nullable=False)
    phone: Mapped[int] = mapped_column(nullable=False)
    password_hash: Mapped[str] = mapped_column(nullable=False)
    role: Mapped[UserRole] = mapped_column(Enum(UserRole), nullable=False)
    is_available: Mapped[bool] = mapped_column(Boolean, default=False)

    # Relaciones
    addresses: Mapped[list["Address"]] = relationship(
        back_populates="user"
    )

    orders: Mapped[list["Order"]] = relationship(
        back_populates="user",
        foreign_keys="Order.user_id"
    )

    deliveries: Mapped[list["Order"]] = relationship(
        back_populates="driver",
        foreign_keys="Order.driver_id"
    )

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
            "role": self.role.value
        }


# -----------------------------------

class Address(db.Model):
    __tablename__ = "address"

    id: Mapped[int] = mapped_column(primary_key=True)
    street: Mapped[str] = mapped_column(String(200), nullable=False)
    city: Mapped[str] = mapped_column(String(100), nullable=False)
    postal_code: Mapped[int] = mapped_column(nullable=False)
    latitude: Mapped[float] = mapped_column(Float)
    longitude: Mapped[float] = mapped_column(Float)
    label: Mapped[str] = mapped_column(String(100))

    user_id: Mapped[int] = mapped_column(ForeignKey("user.id"))
    user: Mapped["User"] = relationship(
        back_populates="addresses"
    )

    orders: Mapped[list["Order"]] = relationship(
        back_populates="address"
    )
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

# -----------------------------------

class Store(db.Model):
    __tablename__ = "store"

    id: Mapped[int] = mapped_column(primary_key=True)

    name: Mapped[str] = mapped_column(String(120), nullable=False)

    qr_code: Mapped[str] = mapped_column(
        String(120),
        unique=True,
        nullable=False
    )

    is_active: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False
    )

    # Relaciones
    orders: Mapped[list["Order"]] = relationship(
        "Order",
        back_populates="store"
    )

    def serialize(self):
        return {
            "id": self.id,
            "name": self.name,
            "qr_code": self.qr_code,
            "is_active": self.is_active
        }

# -----------------------------------

class Order(db.Model):
    __tablename__ = "order"

    id: Mapped[int] = mapped_column(primary_key=True)
    bags_count: Mapped[int] = mapped_column(Integer)
    notes: Mapped[str] = mapped_column(String(500))
    status: Mapped[OrderStatus] = mapped_column(Enum(OrderStatus), default=OrderStatus.pending)
    amount_cents: Mapped[int] = mapped_column(Integer)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    # Foreign Keys
    user_id: Mapped[int] = mapped_column(ForeignKey("user.id"))
    driver_id: Mapped[int] = mapped_column(ForeignKey("user.id"))
    store_id: Mapped[int] = mapped_column(ForeignKey("store.id"))
    address_id: Mapped[int] = mapped_column(ForeignKey("address.id"))

    # Relaciones
    user: Mapped["User"] = relationship(
        back_populates="orders",
        foreign_keys=[user_id]
    )

    driver: Mapped["User"] = relationship(
        back_populates="deliveries",
        foreign_keys=[driver_id]
    )

    store: Mapped["Store"] = relationship(
        back_populates="orders"
    )

    address: Mapped["Address"] = relationship(
        back_populates="orders"
    )

    payment: Mapped["Payment"] = relationship(
        back_populates="order",
        uselist=False
    )
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

# -----------------------------------

class Payment(db.Model):
    __tablename__ = "payment"

    id: Mapped[int] = mapped_column(primary_key=True)
    amount_cents: Mapped[int] = mapped_column(Integer)
    currency: Mapped[str] = mapped_column(String(10))
    status: Mapped[PaymentStatus] = mapped_column(Enum(PaymentStatus), default=PaymentStatus.pending)
    stripe_session_id: Mapped[str] = mapped_column(String(200))
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    order_id: Mapped[int] = mapped_column(ForeignKey("order.id"), unique=True)

    order: Mapped["Order"] = relationship(
        back_populates="payment"
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