import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getToken } from "../Services/authService";
import { QRCodeSVG } from "qrcode.react";
import { Html5Qrcode } from "html5-qrcode";
import "../Stores.css";

const API_URL = import.meta.env.VITE_BACKEND_URL;

const CATEGORIES = ["Todas", "Moda", "Electrónica", "Supermercado", "Deportes", "Hogar", "Otros"];

export const Stores = () => {
  const navigate = useNavigate();
  const [stores, setStores] = useState([]);
  const [filteredStores, setFilteredStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("Todas");
  const [selectedStore, setSelectedStore] = useState(null);
  const [showQrModal, setShowQrModal] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showAddStoreModal, setShowAddStoreModal] = useState(false);
  const [showEditStoreModal, setShowEditStoreModal] = useState(false);
  const [editingStore, setEditingStore] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [orderData, setOrderData] = useState({ bags_count: 1, notes: "", address_id: "" });
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [newStore, setNewStore] = useState({ name: "", street: "", city: "", postal_code: "" });
  const [scanning, setScanning] = useState(false);
  const [qrError, setQrError] = useState("");

  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = getToken();
        if (!token) return;
        const response = await fetch(`${API_URL}/api/profile`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (response.ok) setCurrentUser(await response.json());
      } catch (error) {
        console.error(error);
      }
    };
    loadUser();
  }, []);

  useEffect(() => {
    const loadStores = async () => {
      try {
        const token = getToken();
        if (!token) { navigate("/store-info"); return; }

        const response = await fetch(`${API_URL}/api/stores`, {
          headers: { "Authorization": `Bearer ${token}` }
        });

        if (response.ok) {
          const data = await response.json();
          const storesList = Array.isArray(data) ? data : [];
          setStores(storesList);
          setFilteredStores(storesList);
        } else {
          navigate("/store-info");
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    loadStores();
  }, []);

  useEffect(() => {
    const loadAddresses = async () => {
      try {
        const token = getToken();
        if (!token) return;
        const response = await fetch(`${API_URL}/api/addresses`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        const data = await response.json();
        setAddresses(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error(error);
      }
    };
    loadAddresses();
  }, []);

  useEffect(() => {
    let result = stores;
    if (search) {
      result = result.filter(s =>
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.city.toLowerCase().includes(search.toLowerCase())
      );
    }
    setFilteredStores(result);
  }, [search, activeCategory, stores]);

  const triggerToast = (msg) => {
    setToastMsg(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const startQrScanner = () => {
    setScanning(true);
    setQrError("");
    setTimeout(() => {
      const html5QrCode = new Html5Qrcode("qr-reader");
      html5QrCode.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          html5QrCode.stop();
          setScanning(false);
          if (decodedText === selectedStore.qr_code) {
            setShowQrModal(false);
            setShowOrderModal(true);
          } else {
            setQrError("❌ El QR no corresponde a esta tienda. Inténtalo de nuevo.");
          }
        },
        () => {}
      ).catch(() => {
        setScanning(false);
        setQrError("❌ No se pudo acceder a la cámara.");
      });
    }, 500);
  };

  const stopQrScanner = () => {
    try {
      const html5QrCode = new Html5Qrcode("qr-reader");
      html5QrCode.stop();
    } catch {}
    setScanning(false);
    setShowQrModal(false);
  };

  const handleCreateOrder = async () => {
    try {
      const token = getToken();
      if (!token) { navigate("/login"); return; }
      if (!orderData.address_id) { triggerToast("❌ Selecciona una dirección de entrega"); return; }

      const response = await fetch(`${API_URL}/api/orders`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          store_id: selectedStore.id,
          address_id: parseInt(orderData.address_id),
          bags_count: parseInt(orderData.bags_count),
          notes: orderData.notes
        })
      });

      const data = await response.json();
      if (response.ok) {
        setShowOrderModal(false);
        triggerToast("✅ Pedido creado correctamente");
        setOrderData({ bags_count: 1, notes: "", address_id: "" });
      } else {
        triggerToast(`❌ ${data.error}`);
      }
    } catch (error) {
      triggerToast("❌ Error al crear el pedido");
    }
  };

  const handleCreateStore = async () => {
    try {
      const token = getToken();
      if (!newStore.name || !newStore.street || !newStore.city || !newStore.postal_code) {
        triggerToast("❌ Todos los campos son obligatorios");
        return;
      }
      const autoQrCode = `${newStore.name.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}`;
      const response = await fetch(`${API_URL}/api/stores`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ ...newStore, qr_code: autoQrCode })
      });
      const data = await response.json();
      if (response.ok) {
        setStores(prev => [...prev, data.store]);
        setFilteredStores(prev => [...prev, data.store]);
        setShowAddStoreModal(false);
        setNewStore({ name: "", street: "", city: "", postal_code: "" });
        triggerToast("✅ Tienda creada correctamente");
      } else {
        triggerToast(`❌ ${data.error}`);
      }
    } catch (error) {
      triggerToast("❌ Error al crear la tienda");
    }
  };

  const handleEditStore = async () => {
    try {
      const token = getToken();
      const response = await fetch(`${API_URL}/api/stores/${editingStore.id}`, {
        method: "PUT",
        headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(editingStore)
      });
      const data = await response.json();
      if (response.ok) {
        setStores(prev => prev.map(s => s.id === editingStore.id ? data.store : s));
        setFilteredStores(prev => prev.map(s => s.id === editingStore.id ? data.store : s));
        setShowEditStoreModal(false);
        triggerToast("✅ Tienda actualizada correctamente");
      } else {
        triggerToast(`❌ ${data.error}`);
      }
    } catch (error) {
      triggerToast("❌ Error al editar la tienda");
    }
  };

  const handleDeactivateStore = async (storeId) => {
    if (!window.confirm("¿Estás seguro de desactivar esta tienda?")) return;
    try {
      const token = getToken();
      const response = await fetch(`${API_URL}/api/stores/${storeId}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (response.ok) {
        setStores(prev => prev.map(s => s.id === storeId ? { ...s, is_active: false } : s));
        setFilteredStores(prev => prev.map(s => s.id === storeId ? { ...s, is_active: false } : s));
        triggerToast("✅ Tienda desactivada correctamente");
      } else {
        const data = await response.json();
        triggerToast(`❌ ${data.error}`);
      }
    } catch (error) {
      triggerToast("❌ Error al desactivar la tienda");
    }
  };

  if (loading) return <div className="loading">Cargando tiendas...</div>;

  return (
    <div className="stores-page">
      <div className="stores-wrapper">

        {/* HEADER */}
        <div className="stores-header-card">
          <div className="stores-header-top">
            <div>
              <h1>🏪 Tiendas Asociadas</h1>
              <p>Encuentra tu tienda favorita y realiza tu pedido</p>
            </div>
            {currentUser?.role === "admin" && (
              <button className="btn-add-store" onClick={() => setShowAddStoreModal(true)}>
                + Añadir Tienda
              </button>
            )}
          </div>
          <div className="stores-search-container">
            <span className="stores-search-icon">🔍</span>
            <input
              type="text"
              className="stores-search-input"
              placeholder="Buscar tienda o ciudad..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* FILTROS */}
        <div className="stores-filters">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              className={`filter-btn ${activeCategory === cat ? "active" : ""}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* CONTADOR */}
        <p className="stores-counter">
          {filteredStores.length} tienda{filteredStores.length !== 1 ? "s" : ""} encontrada{filteredStores.length !== 1 ? "s" : ""}
        </p>

        {/* LISTA DE TIENDAS */}
        {filteredStores.length === 0 ? (
          <div className="stores-empty">
            <div className="stores-empty-icon">🏪</div>
            <p>No se encontraron tiendas</p>
          </div>
        ) : (
          <div className="stores-grid">
            {filteredStores.map(store => (
              <div key={store.id} className="store-card">

                {/* QR */}
                <div style={{
                  display: "flex", justifyContent: "center", alignItems: "center",
                  padding: "1.5rem", background: "linear-gradient(135deg, #f5f3ff, #ede9fe)"
                }}>
                  <div style={{ background: "white", padding: "1rem", borderRadius: "16px", boxShadow: "0 4px 12px rgba(139,92,246,0.2)" }}>
                    <QRCodeSVG value={store.qr_code} size={120} fgColor="#7C3AED" bgColor="white" />
                  </div>
                </div>

                <div className="store-info">
                  <div className="store-info-header">
                    <h3 className="store-name">{store.name}</h3>
                    <span className={`store-status ${store.is_active ? "active" : "inactive"}`}>
                      {store.is_active ? "✅ Abierta" : "❌ Cerrada"}
                    </span>
                  </div>
                  <p className="store-address">📍 {store.street}, {store.city}</p>
                  <p className="store-postal">📮 {store.postal_code}</p>

                  {currentUser?.role === "admin" && (
                    <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
                      <button
                        onClick={() => { setEditingStore({ ...store }); setShowEditStoreModal(true); }}
                        style={{ flex: 1, padding: "0.5rem", background: "#f5f3ff", color: "#7C3AED", border: "2px solid #e9d5ff", borderRadius: "10px", fontWeight: "700", cursor: "pointer" }}
                      >
                        ✏️ Editar
                      </button>
                      {store.is_active && (
                        <button
                          onClick={() => handleDeactivateStore(store.id)}
                          style={{ flex: 1, padding: "0.5rem", background: "#fee2e2", color: "#991b1b", border: "2px solid #fca5a5", borderRadius: "10px", fontWeight: "700", cursor: "pointer" }}
                        >
                          🚫 Desactivar
                        </button>
                      )}
                    </div>
                  )}

                  <button
                    className="btn-order"
                    disabled={!store.is_active}
                    onClick={() => {
                      if (!getToken()) { navigate("/login"); return; }
                      setSelectedStore(store);
                      setQrError("");
                      setShowQrModal(true);
                    }}
                  >
                    {store.is_active ? "🛒 Solicitar Entrega" : "No disponible"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODAL ESCANEAR QR */}
      {showQrModal && selectedStore && (
        <div className="modal-overlay" onClick={stopQrScanner}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>📷 Escanear QR</h2>
              <button className="modal-close" onClick={stopQrScanner}>✕</button>
            </div>
            <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
              <p style={{ color: "#6b7280" }}>
                Escanea el código QR de <strong style={{ color: "#7C3AED" }}>{selectedStore.name}</strong> para continuar.
              </p>
            </div>
            <div id="qr-reader" style={{ width: "100%", borderRadius: "12px", overflow: "hidden" }}></div>
            {qrError && (
              <div style={{ background: "#fee2e2", border: "2px solid #fca5a5", borderRadius: "12px", padding: "1rem", color: "#991b1b", marginTop: "1rem", fontWeight: "600" }}>
                {qrError}
              </div>
            )}
            <div className="modal-actions">
              <button className="btn-cancel" onClick={stopQrScanner}>Cancelar</button>
              <button className="btn-save" onClick={startQrScanner} disabled={scanning}>
                {scanning ? "📷 Escaneando..." : "📷 Iniciar Cámara"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL CREAR PEDIDO */}
      {showOrderModal && selectedStore && (
        <div className="modal-overlay" onClick={() => setShowOrderModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>🛒 Nuevo Pedido</h2>
              <button className="modal-close" onClick={() => setShowOrderModal(false)}>✕</button>
            </div>
            <div className="store-selected-box">
              <div className="store-selected-name">🏪 {selectedStore.name}</div>
              <div className="store-selected-address">📍 {selectedStore.street}, {selectedStore.city}</div>
            </div>
            <div className="modal-input-group">
              <label>📍 Dirección de entrega</label>
              {addresses.length === 0 ? (
                <div style={{ background: "#fef3c7", border: "2px solid #fde68a", borderRadius: "12px", padding: "1rem", color: "#92400e" }}>
                  ⚠️ No tienes direcciones guardadas.
                  <a href="/Profileuser" style={{ color: "#7C3AED", fontWeight: "700", marginLeft: "0.5rem" }}>Añadir dirección</a>
                </div>
              ) : (
                <select value={orderData.address_id} onChange={(e) => setOrderData({ ...orderData, address_id: e.target.value })}>
                  <option value="">Selecciona una dirección</option>
                  {addresses.map(addr => (
                    <option key={addr.id} value={addr.id}>
                      {addr.label ? `${addr.label} - ` : ""}{addr.street}, {addr.city}
                    </option>
                  ))}
                </select>
              )}
            </div>
            <div className="modal-input-group">
              <label>🛍️ Número de bolsas</label>
              <input type="number" min="1" max="20" value={orderData.bags_count} onChange={(e) => setOrderData({ ...orderData, bags_count: e.target.value })} />
            </div>
            <div className="modal-input-group">
              <label>📝 Notas (opcional)</label>
              <textarea placeholder="Instrucciones especiales..." value={orderData.notes} onChange={(e) => setOrderData({ ...orderData, notes: e.target.value })} rows={3} style={{ resize: "none" }} />
            </div>
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setShowOrderModal(false)}>Cancelar</button>
              <button className="btn-save" onClick={handleCreateOrder}>🛒 Confirmar Pedido</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL CREAR TIENDA */}
      {showAddStoreModal && (
        <div className="modal-overlay" onClick={() => setShowAddStoreModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>🏪 Nueva Tienda</h2>
              <button className="modal-close" onClick={() => setShowAddStoreModal(false)}>✕</button>
            </div>
            {[
              { label: "Nombre de la tienda", name: "name", placeholder: "Ej: Zara Gran Vía" },
              { label: "Calle y número", name: "street", placeholder: "Ej: Calle Gran Vía 32" },
              { label: "Ciudad", name: "city", placeholder: "Ej: Madrid" },
              { label: "Código postal", name: "postal_code", placeholder: "Ej: 28013" },
            ].map(field => (
              <div key={field.name} className="modal-input-group">
                <label>{field.label}</label>
                <input type="text" placeholder={field.placeholder} value={newStore[field.name]} onChange={(e) => setNewStore({ ...newStore, [field.name]: e.target.value })} />
              </div>
            ))}
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setShowAddStoreModal(false)}>Cancelar</button>
              <button className="btn-save" onClick={handleCreateStore}>✅ Crear Tienda</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL EDITAR TIENDA */}
      {showEditStoreModal && editingStore && (
        <div className="modal-overlay" onClick={() => setShowEditStoreModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>✏️ Editar Tienda</h2>
              <button className="modal-close" onClick={() => setShowEditStoreModal(false)}>✕</button>
            </div>
            {[
              { label: "Nombre de la tienda", name: "name" },
              { label: "Calle y número", name: "street" },
              { label: "Ciudad", name: "city" },
              { label: "Código postal", name: "postal_code" },
            ].map(field => (
              <div key={field.name} className="modal-input-group">
                <label>{field.label}</label>
                <input type="text" value={editingStore[field.name]} onChange={(e) => setEditingStore({ ...editingStore, [field.name]: e.target.value })} />
              </div>
            ))}
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setShowEditStoreModal(false)}>Cancelar</button>
              <button className="btn-save" onClick={handleEditStore}>💾 Guardar Cambios</button>
            </div>
          </div>
        </div>
      )}

      {/* TOAST */}
      {showToast && (
        <div className="toast-notification">{toastMsg}</div>
      )}
    </div>
  );
};