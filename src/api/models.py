from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import String, Boolean
from sqlalchemy.orm import Mapped, mapped_column

db = SQLAlchemy()

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

    bags_count: Mapped[int] = mapped_column(nullable=False)
    notes: Mapped[str] = mapped_column(String(255), nullable=True)
    status: Mapped[str] = mapped_column(String(50), nullable=False)
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
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

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