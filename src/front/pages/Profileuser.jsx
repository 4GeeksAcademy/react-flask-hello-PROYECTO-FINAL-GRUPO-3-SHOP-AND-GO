// Import necessary components from react-router-dom and other parts of the application.
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { logout, getProfile } from "../Services/authService";


export const Profileuser = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [editedUser, setEditedUser] = useState({
        name: "",
        email: "",
        phone: ""
    })
    const [showToast, setShowToast] = useState(false);

    useEffect(() => {
  // DATOS REALES BACKEND
  const loadProfile = async () => {
    try {
      const userData = await getProfile();
      setUser(userData);
    } catch (error) {
      console.error("Error cargando perfil:", error);
      // Si falla, redirigir al login ✅
      navigate("/login");
    }
  };

  loadProfile();
}, [navigate]);

    // PENDIENTE: Conectar con backend - GET /api/orders
    const ordersSummary = {
        total: 12,
        lastOrderDate: "Hace 2 días",
        totalSpent: "€127.50"
    };

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    const handleOpenModal = () => {
        // Copia los datos actuales al formulario

        if (!user) return;

        setEditedUser({
            name: user.name,
            email: user.email,
            phone: user.phone
        });
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
    };

    const handleInputChange = (e) => {
        setEditedUser({
            ...editedUser,
            [e.target.name]: e.target.value
        });
    };

    const handleSaveChanges = () => {
        // Actualiza los datos del usuario
        setUser({
            ...user,
            ...editedUser
        });
        setShowModal(false);

        //mostrar el toast personalizado
        setShowToast(true);

        // Ocultar toast después de 3 segundos
        setTimeout(() => {
            setShowToast(false);
        }, 3000);


        // Aquí después llamarás al backend
    };


    if (!user) {
        return <div className="loading">Cargando perfil...</div>;
    }
    return (

        <div className="profile-page">
            <div className="profile-container">

                <div className="profile-header">
                    <div className="profile-avatar">
                        {user.name.charAt(0).toUpperCase()}
                    </div>
                    <h1>{user.name}</h1>
                    <p className="profile-role">
                        {user.role === "user" ? "Usuario" : "Rider"}
                    </p>
                </div>

                <div className="profile-info">
                    <div className="info-item">
                        <span className="info-label">📧 Email</span>
                        <span className="info-value">{user.email}</span>
                    </div>

                    <div className="info-item">
                        <span className="info-label">📱 Teléfono</span>
                        <span className="info-value">{user.phone}</span>
                    </div>
                </div>

                {/* RESUMEN DE PEDIDOS PDTE CONECTAR CON BACKEND */}

                <div className="orders-summary">
                    <h3>Mis Pedidos</h3>
                    <div className="summary-stats">

                        <div className="stat-item">
                            <span className="stat-number">{ordersSummary.total}</span>
                            <span className="stat-label">Total Pedidos</span>
                        </div>

                        <div className="stat-item">
                            <span className="stat-number">€{ordersSummary.totalSpent}</span>
                            <span className="stat-label">Total Gastado</span>
                        </div>

                        <div className="stat-item">
                            <span className="stat-number">{ordersSummary.lastOrderDate}</span>
                            <span className="stat-label">Último Pedido</span>
                        </div>

                    </div>

                    {/* TODO: Este link irá a la página de "Mis Pedidos" que hará tu compañero */}
                    {/* <button className="btn-view-orders" onClick={() => alert("Tu compañero creará esta página")}>
                        Ver Todos Mis Pedidos →
                    </button> */}
                </div>

                <div className="profile-actions">
                    <button className="btn-edit" onClick={handleOpenModal}>Editar Perfil</button>
                    <button className="btn-logout" onClick={handleLogout}>
                        Cerrar Sesión
                    </button>
                </div>

            </div>

            {/* MODAL PARA EDITAR PERFIL */}
            {showModal && (
                <div className="modal-overlay" onClick={handleCloseModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>

                        <div className="modal-header">
                            <h2>Editar Perfil</h2>
                            <button className="modal-close" onClick={handleCloseModal}>✕</button>
                        </div>

                        <form onSubmit={(e) => { e.preventDefault(); handleSaveChanges(); }}>

                            <div className="modal-input-group">
                                <label>Nombre</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={editedUser.name}
                                    onChange={handleInputChange}
                                />
                            </div>

                            <div className="modal-input-group">
                                <label>Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={editedUser.email}
                                    onChange={handleInputChange}
                                />
                            </div>

                            <div className="modal-input-group">
                                <label>Teléfono</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={editedUser.phone}
                                    onChange={handleInputChange}
                                />
                            </div>

                            <div className="modal-actions">
                                <button type="button" className="btn-cancel" onClick={handleCloseModal}>
                                    Cancelar
                                </button>
                                <button type="submit" className="btn-save">
                                    Guardar Cambios
                                </button>
                            </div>

                        </form>

                    </div>
                </div>
            )}

            {/* TOAST NOTIFICATION */}
            {showToast && (
                <div className="toast-notification">
                    ✅ Perfil actualizado correctamente
                </div>
            )}

        </div>

    );

};
