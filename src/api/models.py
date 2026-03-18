from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import String, Integer, Boolean, ForeignKey, Float, Enum, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from flask_bcrypt import generate_password_hash, check_password_hash  # ✅ eliminado Bcrypt
from datetime import datetime, timezone  # ✅ añadido timezone
import enum

db = SQLAlchemy()

# =========================
# ENUMS
# =========================

class UserRole(enum.Enum):
    user = "user"
    driver = "driver"
    admin = "admin"

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
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    email: Mapped[str] = mapped_column(String(120), unique=True, nullable=False)
    phone: Mapped[str] = mapped_column(String(20), nullable=False)
    password_hash: Mapped[str] = mapped_column(nullable=False)
    role: Mapped[UserRole] = mapped_column(Enum(UserRole), nullable=False)
    is_available: Mapped[bool] = mapped_column(Boolean, default=False)

    addresses: Mapped[list["Address"]] = relationship(back_populates="user")
    orders: Mapped[list["Order"]] = relationship(back_populates="user", foreign_keys="Order.user_id")
    deliveries: Mapped[list["Order"]] = relationship(back_populates="driver", foreign_keys="Order.driver_id")
    payment_methods: Mapped[list["PaymentMethod"]] = relationship(
        back_populates="user",
        cascade="all, delete-orphan"
    )

    def set_password(self, password):
        self.password_hash = generate_password_hash(password).decode("utf-8")

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def serialize(self):
        return {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "phone": self.phone,
            "role": self.role.value,
            "is_available": self.is_available,
            "addresses": [address.serialize() for address in self.addresses],
            "payment_methods": [payment_method.serialize() for payment_method in self.payment_methods]
        }


class Address(db.Model):
    __tablename__ = "addresses"

    id: Mapped[int] = mapped_column(primary_key=True)
    street: Mapped[str] = mapped_column(String(200), nullable=False)
    city: Mapped[str] = mapped_column(String(100), nullable=False)
    postal_code: Mapped[str] = mapped_column(String(10), nullable=False)
    latitude: Mapped[float] = mapped_column(Float, nullable=True)
    longitude: Mapped[float] = mapped_column(Float, nullable=True)
    label: Mapped[str] = mapped_column(String(100), nullable=True)

    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    user: Mapped["User"] = relationship(back_populates="addresses")
    orders: Mapped[list["Order"]] = relationship(back_populates="address")

    def serialize(self):
        return {
            "id": self.id,
            "street": self.street,
            "city": self.city,
            "postal_code": self.postal_code,
            "label": self.label,
            "latitude": self.latitude,
            "longitude": self.longitude
        }


class Store(db.Model):
    __tablename__ = "stores"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    qr_code: Mapped[str] = mapped_column(String(120), unique=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    street: Mapped[str] = mapped_column(String(200), nullable=False)
    city: Mapped[str] = mapped_column(String(100), nullable=False)
    postal_code: Mapped[str] = mapped_column(String(10), nullable=False)
    latitude: Mapped[float] = mapped_column(Float, nullable=True)
    longitude: Mapped[float] = mapped_column(Float, nullable=True)

    orders: Mapped[list["Order"]] = relationship(back_populates="store")

    def serialize(self):
        return {
            "id": self.id,
            "name": self.name,
            "is_active": self.is_active,
            "qr_code": self.qr_code,
            "street": self.street,
            "city": self.city,
            "postal_code": self.postal_code,
            "latitude": self.latitude,
            "longitude": self.longitude
        }


class Order(db.Model):
    __tablename__ = "orders"

    id: Mapped[int] = mapped_column(primary_key=True)
    bags_count: Mapped[int] = mapped_column(Integer, nullable=True)
    notes: Mapped[str] = mapped_column(String(500), nullable=True)
    status: Mapped[OrderStatus] = mapped_column(Enum(OrderStatus), default=OrderStatus.pending)
    amount_cents: Mapped[int] = mapped_column(Integer)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))

    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    driver_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=True)
    store_id: Mapped[int] = mapped_column(ForeignKey("stores.id"))
    address_id: Mapped[int] = mapped_column(ForeignKey("addresses.id"))

    user: Mapped["User"] = relationship(back_populates="orders", foreign_keys=[user_id])
    driver: Mapped["User"] = relationship(back_populates="deliveries", foreign_keys=[driver_id])
    store: Mapped["Store"] = relationship(back_populates="orders")
    address: Mapped["Address"] = relationship(back_populates="orders")
    payment: Mapped["Payment"] = relationship(back_populates="order", cascade="all, delete-orphan")

    def serialize(self):
        return {
            "id": self.id,
            "bags_count": self.bags_count,
            "notes": self.notes,
            "status": self.status.value,
            "amount": self.amount_cents / 100,
            "created_at": self.created_at.strftime("%Y-%m-%d %H:%M:%S"),
            "client_name": self.user.name,
            "driver_name": self.driver.name if self.driver else "Not assigned",
            "store_name": self.store.name if self.store else None,
            "delivery_address": self.address.street if self.address else None,
            "payment_status": self.payment.status.value if self.payment else "No payment"
        }


class PaymentMethod(db.Model):
    __tablename__ = "payment_methods"

    id: Mapped[int] = mapped_column(primary_key=True)
    provider: Mapped[str] = mapped_column(String(50), default="stripe")
    stripe_payment_method_id: Mapped[str] = mapped_column(String(200), unique=True, nullable=False)

    brand: Mapped[str] = mapped_column(String(50), nullable=True)
    last4: Mapped[str] = mapped_column(String(4), nullable=True)
    exp_month: Mapped[int] = mapped_column(Integer, nullable=True)
    exp_year: Mapped[int] = mapped_column(Integer, nullable=True)

    is_default: Mapped[bool] = mapped_column(Boolean, default=False)

    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    user: Mapped["User"] = relationship(back_populates="payment_methods")

    payments: Mapped[list["Payment"]] = relationship(back_populates="payment_method")

    def serialize(self):
        return {
            "id": self.id,
            "provider": self.provider,
            "brand": self.brand,
            "last4": self.last4,
            "exp_month": self.exp_month,
            "exp_year": self.exp_year,
            "is_default": self.is_default
        }


class Payment(db.Model):
    __tablename__ = "payments"

    id: Mapped[int] = mapped_column(primary_key=True)
    amount_cents: Mapped[int] = mapped_column(Integer)
    currency: Mapped[str] = mapped_column(String(10))
    status: Mapped[PaymentStatus] = mapped_column(Enum(PaymentStatus), default=PaymentStatus.pending)
    stripe_session_id: Mapped[str] = mapped_column(String(200), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))

    order_id: Mapped[int] = mapped_column(ForeignKey("orders.id"), nullable=False)
    payment_method_id: Mapped[int] = mapped_column(ForeignKey("payment_methods.id"), nullable=True)

    order: Mapped["Order"] = relationship(back_populates="payment")
    payment_method: Mapped["PaymentMethod"] = relationship(back_populates="payments")

    def serialize(self):
        return {
            "id": self.id,
            "amount": self.amount_cents / 100,
            "currency": self.currency,
            "status": self.status.value,
            "stripe_id": self.stripe_session_id,
            "order_id": self.order_id,
            "payment_method": self.payment_method.serialize() if self.payment_method else None
        }