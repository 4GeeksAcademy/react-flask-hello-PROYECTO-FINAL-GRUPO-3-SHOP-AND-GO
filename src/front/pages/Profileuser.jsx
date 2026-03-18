import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { logout, getProfile } from "../Services/authService";


export const Profileuser = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('orders');
  
  // Modales
  const [showEditModal, setShowEditModal] = useState(false);
  const [editedUser, setEditedUser] = useState({
    name: "",
    email: "",
    phone: ""
  });
  const [showToast, setShowToast] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [editingPayment, setEditingPayment] = useState(null);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const userData = await getProfile();
        setUser(userData);
      } catch (error) {
        console.error("Error cargando perfil:", error);
        navigate("/login");
      }
    };
    loadProfile();
  }, [navigate]);

  // TODO: Conectar con backend - GET /api/orders
  const ordersSummary = {
    total: 12,
    lastOrderDate: "Hace 2 días",
    totalSpent: "127.50"
  };

  const orders = [
    {
      id: "SG-2401",
      date: "24 Feb 2026",
      store: "Zara Centro Comercial",
      status: "delivered",
      amount: "12.50",
      items: 3
    }
  ];

  // TODO: Conectar con backend - GET /api/addresses
  const addresses = [
    {
      id: 1,
      label: "Casa",
      address: "Calle Mayor 45, 3°B",
      city: "Madrid, 28013",
      isDefault: true
    }
  ];

  // TODO: Conectar con backend - GET /api/payment-methods
  const paymentMethods = [
    {
      id: 1,
      type: "Visa",
      last4: "4242",
      expiry: "12/27",
      isDefault: true
    }
  ];

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleOpenEditModal = () => {
    if (!user) return;
    setEditedUser({
      name: user.name,
      email: user.email,
      phone: user.phone
    });
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
  };

  const handleInputChange = (e) => {
    setEditedUser({
      ...editedUser,
      [e.target.name]: e.target.value
    });
  };

  const handleSaveChanges = () => {
    setUser({
      ...user,
      ...editedUser
    });
    setShowEditModal(false);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  // DIRECCIONES
  const handleAddAddress = () => {
    setEditingAddress(null);
    setShowAddressModal(true);
  };

  const handleEditAddress = (address) => {
    setEditingAddress(address);
    setShowAddressModal(true);
  };

  const handleDeleteAddress = (addressId) => {
    if (window.confirm("¿Estás seguro de eliminar esta dirección?")) {
      // TODO: Llamar al backend DELETE /api/addresses/{id}
      alert("Dirección eliminada");
    }
  };

  const handleSaveAddress = (addressData) => {
    // TODO: Llamar al backend POST o PUT /api/addresses
    console.log("Guardando dirección:", addressData);
    setShowAddressModal(false);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  // PAGOS
  const handleAddPayment = () => {
    setEditingPayment(null);
    setShowPaymentModal(true);
  };

  const handleEditPayment = (payment) => {
    setEditingPayment(payment);
    setShowPaymentModal(true);
  };

  const handleDeletePayment = (paymentId) => {
    if (window.confirm("¿Estás seguro de eliminar este método de pago?")) {
      // TODO: Llamar al backend DELETE /api/payment-methods/{id}
      alert("Método de pago eliminado");
    }
  };

  const handleSavePayment = (paymentData) => {
    // TODO: Llamar al backend POST o PUT /api/payment-methods
    console.log("Guardando pago:", paymentData);
    setShowPaymentModal(false);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  if (!user) {
    return <div className="loading">Cargando perfil...</div>;
  }

  return (
    <div className="profile-page">
      <div className="profile-wrapper">
        
        {/* HEADER CON INFO DEL USUARIO */}
        <div className="profile-header-card">
          <div className="header-content">
            <div className="user-avatar-section">
              <div className="profile-avatar-large">
                {user.name.charAt(0).toUpperCase()}
              </div>
            </div>

            <div className="user-info-section">
              <h1 className="user-name">{user.name}</h1>
              <p className="user-email">{user.email}</p>
              
              <div className="user-stats">
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
              </div>
            </div>

            <button className="btn-edit-header" onClick={handleOpenEditModal}>
              ✏️ Editar Perfil
            </button>
          </div>
        </div>

        {/* TABS NAVIGATION */}
        <div className="tabs-container">
          <button
            className={`tab-button ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            📦 Mis Pedidos
          </button>
          <button
            className={`tab-button ${activeTab === 'addresses' ? 'active' : ''}`}
            onClick={() => setActiveTab('addresses')}
          >
            📍 Direcciones
          </button>
          <button
            className={`tab-button ${activeTab === 'payment' ? 'active' : ''}`}
            onClick={() => setActiveTab('payment')}
          >
            💳 Pagos
          </button>
          <button
            className={`tab-button ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            ⚙️ Ajustes
          </button>
        </div>

        {/* TAB CONTENT */}
        <div className="tab-content">
          
          {/* TAB: MIS PEDIDOS */}
          {activeTab === 'orders' && (
            <div className="orders-section">
              <h2>Historial de Pedidos</h2>
              {orders.map((order) => (
                <div key={order.id} className="order-card">
                  <div className="order-header">
                    <span className="order-id">{order.id}</span>
                    <span className="order-status">✅ Entregado</span>
                  </div>
                  <div className="order-details">
                    <p>🕒 {order.date}</p>
                    <p>📍 {order.store}</p>
                    <p>📦 {order.items} artículos</p>
                  </div>
                  <div className="order-footer">
                    <span className="order-amount">€{order.amount}</span>
                    <button className="btn-view-order">Ver Detalles</button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB: DIRECCIONES */}
          {activeTab === 'addresses' && (
            <div className="addresses-section">
              <div className="section-header">
                <h2>Mis Direcciones</h2>
                <button className="btn-add" onClick={handleAddAddress}>+ Añadir Dirección</button>
              </div>
              {addresses.map((address) => (
                <div key={address.id} className="address-card">
                  <div className="address-icon">📍</div>
                  <div className="address-info">
                    <h3>{address.label}</h3>
                    {address.isDefault && <span className="badge-default">Predeterminada</span>}
                    <p>{address.address}</p>
                    <p className="address-city">{address.city}</p>
                  </div>
                  <div className="address-actions">
                    <button className="btn-icon" onClick={() => handleEditAddress(address)}>✏️</button>
                    <button className="btn-icon" onClick={() => handleDeleteAddress(address.id)}>🗑️</button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB: MÉTODOS DE PAGO */}
          {activeTab === 'payment' && (
            <div className="payment-section">
              <div className="section-header">
                <h2>Métodos de Pago</h2>
                <button className="btn-add" onClick={handleAddPayment}>+ Añadir Tarjeta</button>
              </div>
              {paymentMethods.map((method) => (
                <div key={method.id} className="payment-card">
                  <div className="payment-icon">💳</div>
                  <div className="payment-info">
                    <h3>{method.type} •••• {method.last4}</h3>
                    {method.isDefault && <span className="badge-default">Predeterminada</span>}
                    <p>Expira: {method.expiry}</p>
                  </div>
                  <div className="payment-actions">
                    <button className="btn-icon" onClick={() => handleEditPayment(method)}>✏️</button>
                    <button className="btn-icon" onClick={() => handleDeletePayment(method.id)}>🗑️</button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB: AJUSTES */}
          {activeTab === 'settings' && (
            <div className="settings-section">
              <h2>Configuración</h2>
              
              <div className="settings-card">
                <h3>Notificaciones</h3>
                <div className="notification-item">
                  <div className="notification-info">
                    <div className="notification-title">Actualizaciones de pedidos</div>
                    <div className="notification-desc">Recibe notificaciones sobre el estado de tus entregas</div>
                  </div>
                  <label className="toggle-switch">
                    <input type="checkbox" defaultChecked />
                    <span className="toggle-slider"></span>
                  </label>
                </div>

                <div className="notification-item">
                  <div className="notification-info">
                    <div className="notification-title">Ofertas y promociones</div>
                    <div className="notification-desc">Entérate de las mejores ofertas en entregas</div>
                  </div>
                  <label className="toggle-switch">
                    <input type="checkbox" defaultChecked />
                    <span className="toggle-slider"></span>
                  </label>
                </div>

                <div className="notification-item">
                  <div className="notification-info">
                    <div className="notification-title">Recordatorios</div>
                    <div className="notification-desc">Avisos sobre pedidos programados</div>
                  </div>
                  <label className="toggle-switch">
                    <input type="checkbox" />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
              </div>

              <div className="settings-card">
                <h3>Sesión</h3>
                <button className="btn-logout" onClick={handleLogout}>
                  🚪 Cerrar Sesión
                </button>
              </div>
            </div>
          )}

        </div>

      </div>

      {/* MODAL EDITAR PERFIL */}
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

      {/* MODAL DIRECCIÓN */}
      {showAddressModal && (
        <div className="modal-overlay" onClick={() => setShowAddressModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingAddress ? 'Editar Dirección' : 'Nueva Dirección'}</h2>
              <button className="modal-close" onClick={() => setShowAddressModal(false)}>✕</button>
            </div>
            <form onSubmit={(e) => { 
              e.preventDefault(); 
              const formData = new FormData(e.target);
              handleSaveAddress({
                label: formData.get('label'),
                address: formData.get('address'),
                city: formData.get('city'),
                isDefault: formData.get('isDefault') === 'on'
              });
            }}>
              <div className="modal-input-group">
                <label>Etiqueta</label>
                <input
                  type="text"
                  name="label"
                  placeholder="Casa, Trabajo, etc."
                  defaultValue={editingAddress?.label}
                  required
                />
              </div>
              <div className="modal-input-group">
                <label>Dirección</label>
                <input
                  type="text"
                  name="address"
                  placeholder="Calle, número, piso..."
                  defaultValue={editingAddress?.address}
                  required
                />
              </div>
              <div className="modal-input-group">
                <label>Ciudad y código postal</label>
                <input
                  type="text"
                  name="city"
                  placeholder="Madrid, 28013"
                  defaultValue={editingAddress?.city}
                  required
                />
              </div>
              <div className="modal-checkbox-group">
                <input
                  type="checkbox"
                  name="isDefault"
                  id="isDefault"
                  defaultChecked={editingAddress?.isDefault}
                />
                <label htmlFor="isDefault">Establecer como predeterminada</label>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowAddressModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn-save">
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL PAGO */}
      {showPaymentModal && (
        <div className="modal-overlay" onClick={() => setShowPaymentModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingPayment ? 'Editar Tarjeta' : 'Nueva Tarjeta'}</h2>
              <button className="modal-close" onClick={() => setShowPaymentModal(false)}>✕</button>
            </div>
            <form onSubmit={(e) => { 
              e.preventDefault(); 
              const formData = new FormData(e.target);
              handleSavePayment({
                type: formData.get('type'),
                last4: formData.get('cardNumber').slice(-4),
                expiry: formData.get('expiry'),
                isDefault: formData.get('isDefault') === 'on'
              });
            }}>
              <div className="modal-input-group">
                <label>Tipo de Tarjeta</label>
                <select name="type" defaultValue={editingPayment?.type || "Visa"} required>
                  <option value="Visa">Visa</option>
                  <option value="Mastercard">Mastercard</option>
                  <option value="American Express">American Express</option>
                </select>
              </div>
              <div className="modal-input-group">
                <label>Número de Tarjeta</label>
                <input
                  type="text"
                  name="cardNumber"
                  placeholder="1234 5678 9012 3456"
                  maxLength="19"
                  required
                />
              </div>
              <div className="modal-input-group">
                <label>Fecha de Expiración</label>
                <input
                  type="text"
                  name="expiry"
                  placeholder="MM/AA"
                  maxLength="5"
                  defaultValue={editingPayment?.expiry}
                  required
                />
              </div>
              <div className="modal-input-group">
                <label>CVV</label>
                <input
                  type="text"
                  name="cvv"
                  placeholder="123"
                  maxLength="3"
                  required
                />
              </div>
              <div className="modal-checkbox-group">
                <input
                  type="checkbox"
                  name="isDefault"
                  id="isDefaultPayment"
                  defaultChecked={editingPayment?.isDefault}
                />
                <label htmlFor="isDefaultPayment">Establecer como predeterminada</label>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowPaymentModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn-save">
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TOAST */}
      {showToast && (
        <div className="toast-notification">
          ✅ Cambios guardados correctamente
        </div>
      )}

    </div>
  );
};