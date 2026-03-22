import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  logout,
  getProfile,
  getOrders,
  getAddresses,
  getPaymentMethods,
  createAddress,
  createPaymentMethod,
  getUsers
} from "../Services/authService";

export const Profileuser = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("orders");

  /* ---- Datos del backend ---- */
  const [orders, setOrders] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [adminFilter, setAdminFilter] = useState("all");

  /* ---- Modales / UI ---- */
  const [showEditModal, setShowEditModal] = useState(false);
  const [editedUser, setEditedUser] = useState({ name: "", email: "", phone: "" });
  const [showToast, setShowToast] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [editingPayment, setEditingPayment] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState(null);

  /* ==============================
     CARGAR DATOS
  ============================== */
  useEffect(() => {
    const loadData = async () => {
      try {
        const userData = await getProfile();
        setUser(userData);

        const ordersData = await getOrders();
        if (Array.isArray(ordersData)) setOrders(ordersData);

        const addressesData = await getAddresses();
        if (Array.isArray(addressesData)) setAddresses(addressesData);

        const paymentData = await getPaymentMethods();
        if (Array.isArray(paymentData)) setPaymentMethods(paymentData);

        if (userData.role === "admin") {
          const usersData = await getUsers();
          if (Array.isArray(usersData)) setAllUsers(usersData);
        }

        const savedPhoto = localStorage.getItem(`photo_${userData.id}`);
        if (savedPhoto) setProfilePhoto(savedPhoto);
      } catch (error) {
        console.error("Error cargando datos:", error);
      }
    };
    loadData();
  }, [navigate]);

  /* ==============================
     CÁLCULOS
  ============================== */
  const ordersSummary = {
    total: orders.length,
    lastOrderDate: orders.length > 0 ? orders[orders.length - 1].created_at : "Sin pedidos",
    totalSpent: orders.reduce((sum, order) => sum + (order.amount || 0), 0).toFixed(2)
  };

  const statusLabels = {
    pending: "⏳ Pendiente",
    accepted: "✅ Aceptado",
    in_transit: "🚴 En camino",
    delivered: "📦 Entregado",
    cancelled: "❌ Cancelado"
  };

  const isAdmin = user?.role === "admin";
  const totalUsers = allUsers.filter((u) => u.role === "user").length;
  const totalDrivers = allUsers.filter((u) => u.role === "driver").length;
  const deliveredOrders = orders.filter((o) => o.status === "delivered");
  const totalRevenue = deliveredOrders.reduce((sum, o) => sum + (o.amount || 0), 0).toFixed(2);
  const filteredOrders = adminFilter === "all" ? orders : orders.filter((o) => o.status === adminFilter);

  /* ==============================
     HANDLERS
  ============================== */
  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleOpenEditModal = () => {
    if (!user) return;
    setEditedUser({ name: user.name, email: user.email, phone: user.phone });
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => setShowEditModal(false);

  const handleInputChange = (e) => {
    setEditedUser({ ...editedUser, [e.target.name]: e.target.value });
  };

  const handleSaveChanges = () => {
    setUser({ ...user, ...editedUser });
    setShowEditModal(false);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  /* ---- Direcciones ---- */
  const handleAddAddress = () => {
    setEditingAddress(null);
    setShowAddressModal(true);
  };

  const handleEditAddress = (address) => {
    setEditingAddress(address);
    setShowAddressModal(true);
  };

  const handleDeleteAddress = async (addressId) => {
    if (window.confirm("¿Estás seguro de eliminar esta dirección?")) {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(
          import.meta.env.VITE_BACKEND_URL + `/api/addresses/${addressId}`,
          { method: "DELETE", headers: { Authorization: "Bearer " + token } }
        );
        if (response.ok) {
          setAddresses(addresses.filter((a) => a.id !== addressId));
          setShowToast(true);
          setTimeout(() => setShowToast(false), 3000);
        }
      } catch (error) {
        console.error("Error eliminando dirección:", error);
      }
    }
  };

  const handleSaveAddress = async (addressData) => {
    try {
      const { response, data } = await createAddress(addressData);
      if (response.ok) {
        const updated = await getAddresses();
        if (Array.isArray(updated)) setAddresses(updated);
        setShowAddressModal(false);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
      } else {
        alert(data.error || "Error al guardar dirección");
      }
    } catch (error) {
      console.error("Error guardando dirección:", error);
    }
  };

  /* ---- Pagos ---- */
  const handleAddPayment = () => {
    setEditingPayment(null);
    setShowPaymentModal(true);
  };

  const handleEditPayment = (payment) => {
    setEditingPayment(payment);
    setShowPaymentModal(true);
  };

  const handleDeletePayment = async (paymentId) => {
    if (window.confirm("¿Estás seguro de eliminar este método de pago?")) {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(
          import.meta.env.VITE_BACKEND_URL + `/api/payment-method/${paymentId}`,
          { method: "DELETE", headers: { Authorization: "Bearer " + token } }
        );
        if (response.ok) {
          setPaymentMethods(paymentMethods.filter((pm) => pm.id !== paymentId));
          setShowToast(true);
          setTimeout(() => setShowToast(false), 3000);
        }
      } catch (error) {
        console.error("Error eliminando método de pago:", error);
      }
    }
  };

  const handleSavePayment = async (paymentData) => {
    try {
      const { response, data } = await createPaymentMethod(paymentData);
      if (response.ok) {
        const updated = await getPaymentMethods();
        if (Array.isArray(updated)) setPaymentMethods(updated);
        setShowPaymentModal(false);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
      } else {
        alert(data.error || "Error al guardar método de pago");
      }
    } catch (error) {
      console.error("Error guardando método de pago:", error);
    }
  };

  /* ---- Foto ---- */
  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setProfilePhoto(reader.result);
      localStorage.setItem(`photo_${user.id}`, reader.result);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    };
    reader.readAsDataURL(file);
  };

  /* ---- Eliminar cuenta ---- */
  const handleDeleteAccount = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        import.meta.env.VITE_BACKEND_URL + `/api/users/${user.id}`,
        { method: "DELETE", headers: { Authorization: "Bearer " + token } }
      );
      if (response.ok) {
        logout();
        navigate("/login");
      }
    } catch (error) {
      console.error(error);
    }
  };

  /* ==============================
     LOADING
  ============================== */
  if (!user) return <div style={{ minHeight: "80vh" }}></div>;

  /* ==============================
     RENDER
  ============================== */
  return (
    <div className="profile-page">
      <div className="profile-wrapper">

        {/* ================================
            HEADER
        ================================ */}
        <div className="profile-header-card">
          <div className="header-content">

            {/* Avatar */}
            <div className="user-avatar-section">
              <div
                className="profile-avatar-user"
                onClick={() => document.getElementById("photoInput").click()}
                style={{ cursor: "pointer", overflow: "hidden", position: "relative" }}
              >
                {profilePhoto ? (
                  <img
                    src={profilePhoto}
                    alt="perfil"
                    style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "inherit" }}
                  />
                ) : (
                  user.name.charAt(0).toUpperCase()
                )}
                <div
                  style={{
                    position: "absolute", bottom: 0, left: 0, right: 0,
                    background: "rgba(0,0,0,0.4)", color: "white",
                    fontSize: "0.6rem", textAlign: "center",
                    padding: "0.2rem", fontWeight: "700"
                  }}
                >
                  📷
                </div>
              </div>
              <input
                id="photoInput"
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={handlePhotoUpload}
              />
            </div>

            {/* Info */}
            <div className="user-info-section">
              <h1 className="user-name">
                {user.name}
                {isAdmin && (
                  <span
                    style={{
                      fontSize: "0.8rem", background: "#FDE047",
                      color: "#7C3AED", padding: "0.2rem 0.6rem",
                      borderRadius: "8px", marginLeft: "0.5rem"
                    }}
                  >
                    ADMIN
                  </span>
                )}
              </h1>

              {/* Datos de contacto del user */}
              {!isAdmin ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.2rem", marginTop: "0.25rem", marginBottom: "0.5rem" }}>
                  <span style={{ color: "rgba(255,255,255,0.8)", fontSize: "0.9rem" }}>✉️ {user.email}</span>
                  <span style={{ color: "rgba(255,255,255,0.8)", fontSize: "0.9rem" }}>📱 {user.phone}</span>
                  {addresses.length > 0 && (
                    <span style={{ color: "rgba(255,255,255,0.8)", fontSize: "0.9rem" }}>
                      📍 {addresses[0].street}, {addresses[0].city}
                    </span>
                  )}
                </div>
              ) : (
                <p className="user-email">{user.email}</p>
              )}

              {/* Stats */}
              <div className="user-stats">
                {isAdmin ? (
                  <>
                    <div className="stat-box">
                      <div className="stat-number">{totalUsers}</div>
                      <div className="stat-label">Usuarios</div>
                    </div>
                    <div className="stat-box">
                      <div className="stat-number">{totalDrivers}</div>
                      <div className="stat-label">Riders</div>
                    </div>
                    <div className="stat-box">
                      <div className="stat-number">{orders.length}</div>
                      <div className="stat-label">Pedidos</div>
                    </div>
                    <div className="stat-box">
                      <div className="stat-number">€{totalRevenue}</div>
                      <div className="stat-label">Ingresos</div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="stat-box">
                      <div className="stat-number">{ordersSummary.total}</div>
                      <div className="stat-label">Entregas</div>
                    </div>
                    <div className="stat-box">
                      <div className="stat-number">€{ordersSummary.totalSpent}</div>
                      <div className="stat-label">Total Gastado</div>
                    </div>
                    <div className="stat-box">
                      <div className="stat-label">Último pedido</div>
                      <div className="stat-value">{ordersSummary.lastOrderDate}</div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Botón editar (solo user) */}
            {!isAdmin && (
              <button className="btn-edit-header" onClick={handleOpenEditModal}>
                ✏️ Editar Perfil
              </button>
            )}
          </div>
        </div>

        {/* ================================
            TABS
        ================================ */}
        <div className="tabs-container">
          {isAdmin ? (
            <>
              <button
                className={`tab-button ${activeTab === "orders" ? "active" : ""}`}
                onClick={() => setActiveTab("orders")}
              >
                📦 Todos los Pedidos
              </button>
              <button
                className={`tab-button ${activeTab === "users" ? "active" : ""}`}
                onClick={() => setActiveTab("users")}
              >
                👥 Usuarios
              </button>
              <button
                className={`tab-button ${activeTab === "settings" ? "active" : ""}`}
                onClick={() => setActiveTab("settings")}
              >
                ⚙️ Ajustes
              </button>
            </>
          ) : (
            <>
              <button
                className={`tab-button ${activeTab === "orders" ? "active" : ""}`}
                onClick={() => setActiveTab("orders")}
              >
                📦 Mis Pedidos
              </button>
              <button
                className={`tab-button ${activeTab === "addresses" ? "active" : ""}`}
                onClick={() => setActiveTab("addresses")}
              >
                📍 Direcciones
              </button>
              <button
                className={`tab-button ${activeTab === "payment" ? "active" : ""}`}
                onClick={() => setActiveTab("payment")}
              >
                💳 Pagos
              </button>
              <button
                className={`tab-button ${activeTab === "settings" ? "active" : ""}`}
                onClick={() => setActiveTab("settings")}
              >
                ⚙️ Ajustes
              </button>
            </>
          )}
        </div>

        {/* ================================
            TAB CONTENT
        ================================ */}
        <div className="tab-content">

          {/* ---- PEDIDOS ---- */}
          {activeTab === "orders" && (
            <div className="orders-section">
              <div className="section-header">
                <h2>{isAdmin ? "Todos los Pedidos" : "Historial de Pedidos"}</h2>
                {isAdmin ? (
                  <select
                    value={adminFilter}
                    onChange={(e) => setAdminFilter(e.target.value)}
                    style={{
                      padding: "0.5rem 1rem", borderRadius: "10px",
                      border: "2px solid #e5e7eb", fontWeight: "600", color: "#374151"
                    }}
                  >
                    <option value="all">Todos</option>
                    <option value="pending">Pendientes</option>
                    <option value="accepted">Aceptados</option>
                    <option value="in_transit">En camino</option>
                    <option value="delivered">Entregados</option>
                    <option value="cancelled">Cancelados</option>
                  </select>
                ) : (
                  <button className="btn-hacer-pedido" onClick={() => navigate("/hacer-pedido")}>
                    🛍️ Hacer Pedido
                  </button>
                )}
              </div>

              {filteredOrders.length === 0 ? (
                <p>
                  {isAdmin
                    ? "No hay pedidos con ese filtro."
                    : "No tienes pedidos todavía. ¡Haz tu primer pedido!"}
                </p>
              ) : (
                filteredOrders.map((order) => (
                  <div key={order.id} className="order-card">
                    <div className="order-header">
                      <span className="order-id">SG-{order.id}</span>
                      <span className="order-status">
                        {statusLabels[order.status] || order.status}
                      </span>
                    </div>
                    <div className="order-details">
                      <p>🕒 {order.created_at}</p>
                      <p>🏪 {order.store_name || "Tienda"}</p>
                      <p>📍 {order.delivery_address || "Dirección"}</p>
                      <p>📦 {order.bags_count} bolsa{order.bags_count > 1 ? "s" : ""}</p>
                      {isAdmin && <p>👤 {order.client_name || "Cliente"}</p>}
                      <p>🚴 {order.driver_name}</p>
                    </div>
                    <div className="order-footer">
                      <span className="order-amount">€{order.amount?.toFixed(2)}</span>
                      <button
                        className="btn-view-order"
                        onClick={() => navigate(`/tracking/${order.id}`)}
                      >
                        Ver Seguimiento
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* ---- USUARIOS (solo admin) ---- */}
          {activeTab === "users" && isAdmin && (
            <div className="orders-section">
              <h2 style={{ color: "#7C3AED", fontWeight: "800", marginBottom: "1.5rem" }}>
                Usuarios Registrados
              </h2>
              {allUsers.map((u) => (
                <div key={u.id} className="order-card">
                  <div className="order-header">
                    <span className="order-id">{u.name}</span>
                    <span
                      style={{
                        background: u.role === "driver" ? "#10b981" : u.role === "admin" ? "#FDE047" : "#8B5CF6",
                        color: u.role === "admin" ? "#7C3AED" : "white",
                        padding: "0.25rem 0.75rem",
                        borderRadius: "8px",
                        fontWeight: "700",
                        fontSize: "0.8rem"
                      }}
                    >
                      {u.role.toUpperCase()}
                    </span>
                  </div>
                  <div className="order-details">
                    <p>✉️ {u.email}</p>
                    <p>📱 {u.phone}</p>
                    {u.role === "driver" && (
                      <p>{u.is_available ? "🟢 Disponible" : "🔴 No disponible"}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ---- DIRECCIONES (solo user) ---- */}
          {activeTab === "addresses" && !isAdmin && (
            <div className="addresses-section">
              <div className="section-header">
                <h2>Mis Direcciones</h2>
                <button className="btn-add" onClick={handleAddAddress}>
                  + Añadir Dirección
                </button>
              </div>

              {addresses.length === 0 ? (
                <p>No tienes direcciones guardadas.</p>
              ) : (
                addresses.map((address) => (
                  <div key={address.id} className="address-card">
                    <div className="address-icon">📍</div>
                    <div className="address-info">
                      <h3>{address.label || "Dirección"}</h3>
                      <p>{address.street}</p>
                      <p className="address-city">
                        {address.city}, {address.postal_code}
                      </p>
                    </div>
                    <div className="address-actions">
                      <button className="btn-icon" onClick={() => handleEditAddress(address)}>
                        ✏️
                      </button>
                      <button className="btn-icon" onClick={() => handleDeleteAddress(address.id)}>
                        🗑️
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* ---- PAGOS (solo user) ---- */}
          {activeTab === "payment" && !isAdmin && (
            <div className="payment-section">
              <div className="section-header">
                <h2>Métodos de Pago</h2>
                <button className="btn-add" onClick={handleAddPayment}>
                  + Añadir Tarjeta
                </button>
              </div>

              {paymentMethods.length === 0 ? (
                <p>No tienes métodos de pago guardados.</p>
              ) : (
                paymentMethods.map((method) => (
                  <div key={method.id} className="payment-card">
                    <div className="payment-icon">💳</div>
                    <div className="payment-info">
                      <h3>
                        {(method.brand || "Tarjeta").toUpperCase()} •••• {method.last4}
                      </h3>
                      {method.is_default && (
                        <span className="badge-default">Predeterminada</span>
                      )}
                      <p>Expira: {method.exp_month}/{method.exp_year}</p>
                    </div>
                    <div className="payment-actions">
                      <button className="btn-icon" onClick={() => handleEditPayment(method)}>
                        ✏️
                      </button>
                      <button className="btn-icon" onClick={() => handleDeletePayment(method.id)}>
                        🗑️
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* ---- AJUSTES ---- */}
          {activeTab === "settings" && (
            <div className="settings-section">
              <h2>Configuración</h2>

              {!isAdmin && (
                <div className="settings-card">
                  <h3>Notificaciones</h3>

                  <div className="notification-item">
                    <div className="notification-info">
                      <div className="notification-title">Actualizaciones de pedidos</div>
                      <div className="notification-desc">
                        Recibe notificaciones sobre el estado de tus entregas
                      </div>
                    </div>
                    <label className="toggle-switch">
                      <input type="checkbox" defaultChecked />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>

                  <div className="notification-item">
                    <div className="notification-info">
                      <div className="notification-title">Ofertas y promociones</div>
                      <div className="notification-desc">
                        Entérate de las mejores ofertas en entregas
                      </div>
                    </div>
                    <label className="toggle-switch">
                      <input type="checkbox" defaultChecked />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>

                  <div className="notification-item">
                    <div className="notification-info">
                      <div className="notification-title">Recordatorios</div>
                      <div className="notification-desc">
                        Avisos sobre pedidos programados
                      </div>
                    </div>
                    <label className="toggle-switch">
                      <input type="checkbox" />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                </div>
              )}

              <div className="settings-card">
                <h3>Sesión</h3>
                <button className="btn-logout" onClick={handleLogout}>
                  🚪 Cerrar Sesión
                </button>
                {!isAdmin && (
                  <button
                    className="btn-logout"
                    onClick={() => setShowDeleteModal(true)}
                    style={{
                      background: "white", color: "#dc2626",
                      border: "2px solid #dc2626", marginTop: "1rem"
                    }}
                  >
                    🗑️ Eliminar Cuenta
                  </button>
                )}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* ================================
          MODAL: EDITAR PERFIL
      ================================ */}
      {showEditModal && (
        <div className="modal-overlay" onClick={handleCloseEditModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Editar Perfil</h2>
              <button className="modal-close" onClick={handleCloseEditModal}>✕</button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); handleSaveChanges(); }}>
              <div className="modal-input-group">
                <label>Nombre</label>
                <input type="text" name="name" value={editedUser.name} onChange={handleInputChange} />
              </div>
              <div className="modal-input-group">
                <label>Email</label>
                <input type="email" name="email" value={editedUser.email} onChange={handleInputChange} />
              </div>
              <div className="modal-input-group">
                <label>Teléfono</label>
                <input type="tel" name="phone" value={editedUser.phone} onChange={handleInputChange} />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={handleCloseEditModal}>
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

      {/* ================================
          MODAL: DIRECCIÓN
      ================================ */}
      {showAddressModal && (
        <div className="modal-overlay" onClick={() => setShowAddressModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingAddress ? "Editar Dirección" : "Nueva Dirección"}</h2>
              <button className="modal-close" onClick={() => setShowAddressModal(false)}>✕</button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const f = new FormData(e.target);
                handleSaveAddress({
                  label: f.get("label"),
                  street: f.get("street"),
                  city: f.get("city"),
                  postal_code: f.get("postal_code")
                });
              }}
            >
              <div className="modal-input-group">
                <label>Etiqueta</label>
                <input type="text" name="label" placeholder="Casa, Trabajo, etc." defaultValue={editingAddress?.label} required />
              </div>
              <div className="modal-input-group">
                <label>Calle</label>
                <input type="text" name="street" placeholder="Calle Mayor 45, 3°B" defaultValue={editingAddress?.street} required />
              </div>
              <div className="modal-input-group">
                <label>Ciudad</label>
                <input type="text" name="city" placeholder="Madrid" defaultValue={editingAddress?.city} required />
              </div>
              <div className="modal-input-group">
                <label>Código Postal</label>
                <input type="text" name="postal_code" placeholder="28013" defaultValue={editingAddress?.postal_code} required />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowAddressModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn-save">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================================
          MODAL: PAGO
      ================================ */}
      {showPaymentModal && (
        <div className="modal-overlay" onClick={() => setShowPaymentModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingPayment ? "Editar Tarjeta" : "Nueva Tarjeta"}</h2>
              <button className="modal-close" onClick={() => setShowPaymentModal(false)}>✕</button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const f = new FormData(e.target);
                const brand = f.get("brand").toLowerCase().trim();
                const ids = {
                  visa: "pm_card_visa",
                  mastercard: "pm_card_mastercard",
                  amex: "pm_card_amex"
                };
                if (!ids[brand]) {
                  alert("Marca no válida");
                  return;
                }
                handleSavePayment({
                  provider: brand,
                  brand,
                  last4: brand === "amex" ? "0005" : brand === "mastercard" ? "4444" : "4242",
                  exp_month: Number(f.get("exp_month")),
                  exp_year: Number(f.get("exp_year")),
                  is_default: false,
                  stripe_payment_method_id: ids[brand]
                });
              }}
            >
              <div className="modal-input-group">
                <label>Tipo de Tarjeta</label>
                <select name="brand" defaultValue="visa" required>
                  <option value="visa">Visa</option>
                  <option value="mastercard">Mastercard</option>
                  <option value="amex">American Express</option>
                </select>
              </div>
              <div className="modal-input-group">
                <label>Mes de Expiración</label>
                <input type="number" name="exp_month" placeholder="MM" min="1" max="12" required />
              </div>
              <div className="modal-input-group">
                <label>Año de Expiración</label>
                <input type="number" name="exp_year" placeholder="YYYY" min="2026" required />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowPaymentModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn-save">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================================
          MODAL: ELIMINAR CUENTA
      ================================ */}
      {showDeleteModal && (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ textAlign: "center" }}>
            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>⚠️</div>
            <h2>¿Eliminar cuenta?</h2>
            <p style={{ color: "#6b7280", marginBottom: "2rem" }}>
              Esta acción es irreversible. Se eliminarán todos tus datos.
            </p>
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setShowDeleteModal(false)}>
                Cancelar
              </button>
              <button
                className="btn-save"
                onClick={handleDeleteAccount}
                style={{ background: "#dc2626" }}
              >
                Sí, eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================================
          TOAST
      ================================ */}
      {showToast && (
        <div className="toast-notification">
          ✅ Cambios guardados correctamente
        </div>
      )}

    </div>
  );
};