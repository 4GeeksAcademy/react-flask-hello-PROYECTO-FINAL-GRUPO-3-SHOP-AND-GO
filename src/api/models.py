from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import String, Boolean, Integer
from sqlalchemy.orm import Mapped, mapped_column
from flask_bcrypt import Bcrypt, generate_password_hash, check_password_hash

db = SQLAlchemy()

class User(db.Model):

    __tablename__ = 'users'

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(120), unique=True, nullable=False)
    email: Mapped[str] = mapped_column(String(120), unique=True, nullable=False)
    phone: Mapped[str] = mapped_column(String(12), unique=True, nullable=False)
    
    role: Mapped[str] = mapped_column(
        nullable=False, 
        default='customer') #Enum = Lista cerrada de opciones válidas
    #valores permitidos: 'customer', 'driver', 'admin'
    password_hash: Mapped[str] = mapped_column(nullable=False)
    is_avaliable: Mapped[bool] = mapped_column(Boolean(), nullable=False)

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
            "is_avaliable": self.is_avaliable # se serializa por disponibilidad de los drivers
            # do not serialize the password, its a security breach
        }