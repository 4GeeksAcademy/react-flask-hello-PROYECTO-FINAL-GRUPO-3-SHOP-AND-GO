import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { logout, getToken } from "../Services/authService";
import "../ProfileDriver.css";

const API_URL = import.meta.env.VITE_BACKEND_URL;

export const ProfileDriver = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('resumen');
  const [isAvailable, setIsAvailable] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [activeOrders, setActiveOrders] = useState([]);
  const [historyOrders, setHistoryOrders] = useState([]);
  const [editedUser, setEditedUser] = useState({ name: "", email: "", phone: "" });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [vehicleData, setVehicleData] = useState({ type: "Moto Scooter", plate: "M-1234-BC" });

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const token = getToken();
        if (!token) { navigate("/login"); return; }

        const response = await fetch(`${API_URL}/api/profile`, {
          headers: { "Authorization": `Bearer ${token}` }
        });

        if (!response.ok) { navigate("/login"); return; }

        const userData = await response.json();
        if (userData.role !== "driver") { navigate("/login"); return; }

        setUser(userData);
        setIsAvailable(userData.is_available);
        setEditedUser({ name: userData.name, email: userData.email, phone: userData.phone });

        // ✅ Cargar datos del vehículo desde localStorage
        const savedVehicle = localStorage.getItem(`vehicle_${userData.id}`);
        if (savedVehicle) setVehicleData(JSON.parse(savedVehicle));

      } catch (error) {
        navigate("/login");
      }
    };
    loadProfile();
  }, [navigate]);

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const token = getToken();
        const response = await fetch(`${API_URL}/api/orders`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        const data = await response.json();
        setActiveOrders(data.filter(o => ["pending", "accepted", "in_transit"].includes(o.status)));
        setHistoryOrders(data.filter(o => ["delivered", "cancelled"].includes(o.status)));
      } catch (error) {
        console.error("Error cargando pedidos:", error);
      }
    };
    if (user) loadOrders();
  }, [user]);

  const handleToggleAvailability = async () => {
    try {
      const token = getToken();
      const response = await fetch(`${API_URL}/api/users/${user.id}`, {
        method: "PUT",
        headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ is_available: !isAvailable })
      });
      if (response.ok) {
        setIsAvailable(!isAvailable);
        triggerToast(!isAvailable ? "🟢 Ahora estás disponible" : "🔴 Ahora estás no disponible");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const triggerToast = (msg) => {
    setToastMsg(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleSaveChanges = async () => {
    try {
      const token = getToken();
      const response = await fetch(`${API_URL}/api/users/${user.id}`, {
        method: "PUT",
        headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(editedUser)
      });
      if (response.ok) {
        const updated = await response.json();
        setUser(updated.user);
        triggerToast("✅ Perfil actualizado correctamente");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleSaveVehicle = () => {
    localStorage.setItem(`vehicle_${user.id}`, JSON.stringify(vehicleData));
    triggerToast("✅ Vehículo actualizado correctamente");
  };

  const handleDeleteAccount = async () => {
    try {
      const token = getToken();
      const response = await fetch(`${API_URL}/api/users/${user.id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (response.ok) {
        logout();
        navigate("/login");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      const token = getToken();
      const response = await fetch(`${API_URL}/api/orders/${orderId}`, {
        method: "PUT",
        headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });
      if (response.ok) {
        const updated = await response.json();
        if (["delivered", "cancelled"].includes(newStatus)) {
          setActiveOrders(prev => prev.filter(o => o.id !== orderId));
          setHistoryOrders(prev => [updated.order, ...prev]);
        } else {
          setActiveOrders(prev => prev.map(o => o.id === orderId ? updated.order : o));
        }
        triggerToast("✅ Estado actualizado");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const deliveredOrders = historyOrders.filter(o => o.status === "delivered");
  const totalEarnings = deliveredOrders.reduce((sum, o) => sum + (o.amount || 0), 0);
  const avgEarnings = deliveredOrders.length > 0 ? (totalEarnings / deliveredOrders.length).toFixed(2) : "0.00";
  const successRate = historyOrders.length > 0
    ? ((deliveredOrders.length / historyOrders.length) * 100).toFixed(1)
    : 0;

  const getWeeklyData = () => {
    const days = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
    const weeklyMap = { "Lun": 0, "Mar": 0, "Mié": 0, "Jue": 0, "Vie": 0, "Sáb": 0, "Dom": 0 };

    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay() + 1);
    startOfWeek.setHours(0, 0, 0, 0);

    deliveredOrders.forEach(order => {
      const orderDate = new Date(order.created_at);
      if (orderDate >= startOfWeek) {
        const dayName = days[orderDate.getDay()];
        weeklyMap[dayName] += order.amount || 0;
      }
    });

    return Object.entries(weeklyMap).map(([day, amount]) => ({ day, amount }));
  };

  const weeklyData = getWeeklyData();
  const maxWeekly = Math.max(...weeklyData.map(d => d.amount), 1);

  const getStatusLabel = (status) => ({
    pending: "⏳ Pendiente",
    accepted: "✅ Aceptado",
    in_transit: "🚴 En camino",
    delivered: "📦 Entregado",
    cancelled: "❌ Cancelado"
  })[status] || status;

  const getNextStatus = (status) => ({
    pending: "accepted",
    accepted: "in_transit",
    in_transit: "delivered"
  })[status];

  const getNextStatusLabel = (status) => ({
    pending: "Aceptar pedido",
    accepted: "Iniciar entrega",
    in_transit: "Marcar entregado"
  })[status];

  if (!user) return <div className="loading">Cargando perfil...</div>;

  return (
    <div style={{ background: "#f9fafb", minHeight: "100vh", padding: "2rem 1rem" }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>

        {/* VOLVER */}
        <a href="/" style={{ color: "#7C3AED", fontWeight: "600", textDecoration: "none", display: "inline-block", marginBottom: "1.5rem" }}>
          ← Volver al inicio
        </a>

        {/* HEADER CARD */}
        <div style={{
          background: "linear-gradient(135deg, #8B5CF6 0%, #7C3AED 50%, #6D28D9 100%)",
          borderRadius: "24px", padding: "2rem", marginBottom: "1.5rem",
          boxShadow: "0 20px 60px rgba(139, 92, 246, 0.4)",
          display: "flex", alignItems: "center", gap: "2rem", flexWrap: "wrap"
        }}>

          {/* AVATAR */}
          <div style={{ position: "relative", flexShrink: 0 }}>
            <div style={{
              width: "100px", height: "100px", borderRadius: "20px",
              background: "rgba(255,255,255,0.2)", border: "4px solid rgba(255,255,255,0.4)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "2.5rem", fontWeight: "800", color: "white"
            }}>
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div style={{
              position: "absolute", bottom: "-10px", left: "50%", transform: "translateX(-50%)",
              background: "#FDE047", color: "#92400e", fontSize: "0.7rem", fontWeight: "800",
              padding: "0.2rem 0.6rem", borderRadius: "20px", whiteSpace: "nowrap"
            }}>
              Rider Elite
            </div>
          </div>

          {/* INFO */}
          <div style={{ flex: 1 }}>
            <h1 style={{ color: "white", fontSize: "2rem", fontWeight: "800", margin: "0 0 0.5rem" }}>
              {user.name}
            </h1>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "0.75rem", flexWrap: "wrap" }}>
              <span style={{ color: "#FDE047", fontWeight: "700" }}>⭐ 4.8</span>
              <span style={{ color: "rgba(255,255,255,0.8)" }}>•</span>
              <span style={{ color: "rgba(255,255,255,0.9)" }}>{deliveredOrders.length} entregas</span>
              <span style={{ color: "rgba(255,255,255,0.8)" }}>•</span>
              <span style={{ color: "rgba(255,255,255,0.9)" }}>Desde Enero 2025</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
              <span style={{ color: "rgba(255,255,255,0.9)", fontSize: "0.95rem" }}>📞 {user.phone}</span>
              <span style={{ color: "rgba(255,255,255,0.9)", fontSize: "0.95rem" }}>✉️ {user.email}</span>
              <span style={{ color: "rgba(255,255,255,0.9)", fontSize: "0.95rem" }}>🛵 {vehicleData.type} - {vehicleData.plate}</span>
            </div>
          </div>

          {/* ESTADO */}
          <div style={{
            background: "rgba(255,255,255,0.15)", backdropFilter: "blur(10px)",
            border: "2px solid rgba(255,255,255,0.3)", borderRadius: "20px",
            padding: "1.25rem", textAlign: "center", minWidth: "160px"
          }}>
            <div style={{ color: "rgba(255,255,255,0.8)", fontSize: "0.85rem", marginBottom: "0.75rem", fontWeight: "600" }}>
              Estado
            </div>
            <div style={{
              background: isAvailable ? "#10b981" : "#6b7280",
              color: "white", borderRadius: "12px", padding: "0.5rem 1rem",
              fontWeight: "700", marginBottom: "0.75rem", display: "flex",
              alignItems: "center", justifyContent: "center", gap: "0.5rem"
            }}>
              <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "white", display: "inline-block" }}></span>
              {isAvailable ? "Disponible" : "No disponible"}
            </div>
            <button onClick={handleToggleAvailability} style={{
              background: "white", color: "#7C3AED", border: "none",
              padding: "0.5rem 1.25rem", borderRadius: "10px", fontWeight: "700",
              cursor: "pointer", width: "100%"
            }}>
              {isAvailable ? "Desconectar" : "Conectar"}
            </button>
          </div>
        </div>

        {/* TABS */}
        <div style={{
          background: "white", borderRadius: "16px", border: "1px solid #e5e7eb",
          padding: "0.4rem", marginBottom: "1.5rem", display: "flex", gap: "0.4rem",
          boxShadow: "0 2px 8px rgba(0,0,0,0.04)"
        }}>
          {[
            { key: "resumen", label: "📊 Resumen" },
            { key: "historial", label: "📦 Historial" },
            { key: "ganancias", label: "€ Ganancias" },
            { key: "perfil", label: "⚙️ Mi Perfil" }
          ].map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
              flex: 1, padding: "0.875rem 1rem", border: "none", borderRadius: "12px",
              fontWeight: "600", fontSize: "0.95rem", cursor: "pointer", transition: "all 0.3s",
              background: activeTab === tab.key ? "linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)" : "transparent",
              color: activeTab === tab.key ? "white" : "#6b7280",
              boxShadow: activeTab === tab.key ? "0 4px 16px rgba(139,92,246,0.4)" : "none"
            }}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* TAB CONTENT */}
        <div style={{
          background: "white", borderRadius: "24px", padding: "2rem",
          boxShadow: "0 8px 32px rgba(0,0,0,0.08)", border: "1px solid #f3f4f6"
        }}>

          {/* RESUMEN */}
          {activeTab === "resumen" && (
            <div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
                {[
                  { icon: "📦", label: "Activos", title: activeOrders.length, sub: "Pedidos activos" },
                  { icon: "€", label: "Total", title: `€${totalEarnings.toFixed(2)}`, sub: "Ganancias totales" },
                  { icon: "⏱️", label: "Promedio", title: "18min", sub: "Tiempo de entrega" },
                  { icon: "🏆", label: "Tasa", title: `${successRate}%`, sub: "Tasa de éxito" },
                ].map((card, i) => (
                  <div key={i} style={{ background: "white", border: "2px solid #f3f4f6", borderRadius: "20px", padding: "1.5rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                      <div style={{ width: "48px", height: "48px", borderRadius: "14px", background: "#f5f3ff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem" }}>
                        {card.icon}
                      </div>
                      <span style={{ color: "#9ca3af", fontSize: "0.85rem", fontWeight: "600" }}>{card.label}</span>
                    </div>
                    <div style={{ fontSize: "2rem", fontWeight: "800", color: "#1f2937", marginBottom: "0.25rem" }}>{card.title}</div>
                    <div style={{ color: "#6b7280", fontSize: "0.9rem" }}>{card.sub}</div>
                  </div>
                ))}
              </div>

              {/* GRÁFICA */}
              <h3 style={{ color: "#1f2937", fontWeight: "800", marginBottom: "1.5rem" }}>📈 Ganancias esta semana</h3>
              <div style={{ display: "flex", alignItems: "flex-end", gap: "0.75rem", height: "160px" }}>
                {weeklyData.map((d, i) => (
                  <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem" }}>
                    <span style={{ fontSize: "0.75rem", color: "#7C3AED", fontWeight: "700" }}>€{d.amount.toFixed(2)}</span>
                    <div style={{
                      width: "100%", borderRadius: "8px 8px 0 0",
                      background: "linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)",
                      height: `${(d.amount / maxWeekly) * 120}px`, opacity: 0.7
                    }}></div>
                    <span style={{ fontSize: "0.8rem", color: "#6b7280", fontWeight: "600" }}>{d.day}</span>
                  </div>
                ))}
              </div>

              {activeOrders.length > 0 && (
                <div style={{ marginTop: "2rem" }}>
                  <h3 style={{ color: "#1f2937", fontWeight: "800", marginBottom: "1rem" }}>🚴 Pedidos activos ahora</h3>
                  {activeOrders.map(order => (
                    <div key={order.id} style={{ border: "2px solid #f3f4f6", borderRadius: "16px", padding: "1.5rem", marginBottom: "1rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
                      <div>
                        <div style={{ fontWeight: "800", color: "#7C3AED", marginBottom: "0.5rem" }}>Pedido #{order.id}</div>
                        <div style={{ color: "#6b7280", fontSize: "0.9rem" }}>{getStatusLabel(order.status)}</div>
                        <div style={{ color: "#9ca3af", fontSize: "0.85rem" }}>🏪 {order.store_name}</div>
                      </div>
                      <div style={{ display: "flex", gap: "0.75rem" }}>
                        {getNextStatus(order.status) && (
                          <button onClick={() => handleUpdateOrderStatus(order.id, getNextStatus(order.status))} style={{ background: "linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)", color: "white", border: "none", padding: "0.75rem 1.25rem", borderRadius: "12px", fontWeight: "700", cursor: "pointer" }}>
                            {getNextStatusLabel(order.status)}
                          </button>
                        )}
                        <button onClick={() => handleUpdateOrderStatus(order.id, "cancelled")} style={{ background: "#fee2e2", color: "#991b1b", border: "none", padding: "0.75rem 1.25rem", borderRadius: "12px", fontWeight: "700", cursor: "pointer" }}>
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* HISTORIAL */}
          {activeTab === "historial" && (
            <div>
              <h2 style={{ color: "#7C3AED", fontWeight: "800", marginBottom: "1.5rem" }}>Historial de Entregas</h2>
              {historyOrders.length === 0 ? (
                <p style={{ color: "#9ca3af", textAlign: "center", padding: "2rem" }}>No tienes entregas completadas aún</p>
              ) : (
                historyOrders.map(order => (
                  <div key={order.id} style={{ border: "2px solid #f3f4f6", borderRadius: "16px", padding: "1.5rem", marginBottom: "1rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
                    <div>
                      <div style={{ fontWeight: "800", color: "#7C3AED", marginBottom: "0.25rem" }}>Pedido #{order.id}</div>
                      <div style={{ color: "#6b7280", fontSize: "0.9rem" }}>{getStatusLabel(order.status)}</div>
                      <div style={{ color: "#9ca3af", fontSize: "0.85rem" }}>🏪 {order.store_name} • 📅 {order.created_at}</div>
                    </div>
                    {order.status === "delivered" && (
                      <span style={{ fontSize: "1.5rem", fontWeight: "800", color: "#10b981" }}>+€{order.amount.toFixed(2)}</span>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* GANANCIAS */}
          {activeTab === "ganancias" && (
            <div>
              <h2 style={{ color: "#7C3AED", fontWeight: "800", marginBottom: "1.5rem" }}>Mis Ganancias</h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
                {[
                  { label: "Total acumulado", value: `€${totalEarnings.toFixed(2)}`, bg: "linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)" },
                  { label: "Entregas completadas", value: deliveredOrders.length, bg: "linear-gradient(135deg, #10b981 0%, #059669 100%)" },
                  { label: "Promedio por entrega", value: `€${avgEarnings}`, bg: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)" },
                ].map((card, i) => (
                  <div key={i} style={{ background: card.bg, borderRadius: "20px", padding: "1.5rem", color: "white", textAlign: "center" }}>
                    <div style={{ fontSize: "2.5rem", fontWeight: "800" }}>{card.value}</div>
                    <div style={{ opacity: 0.9, marginTop: "0.5rem" }}>{card.label}</div>
                  </div>
                ))}
              </div>

              <h3 style={{ color: "#1f2937", fontWeight: "800", marginBottom: "1rem" }}>Últimas ganancias</h3>
              {deliveredOrders.length === 0 ? (
                <p style={{ color: "#9ca3af", textAlign: "center", padding: "2rem" }}>No tienes ganancias aún</p>
              ) : (
                deliveredOrders.slice(0, 10).map(order => (
                  <div key={order.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1rem", borderBottom: "1px solid #f3f4f6" }}>
                    <div>
                      <div style={{ fontWeight: "700", color: "#374151" }}>Pedido #{order.id}</div>
                      <div style={{ color: "#9ca3af", fontSize: "0.85rem" }}>🏪 {order.store_name} • 📅 {order.created_at}</div>
                    </div>
                    <span style={{ color: "#10b981", fontWeight: "800", fontSize: "1.1rem" }}>+€{order.amount.toFixed(2)}</span>
                  </div>
                ))
              )}
            </div>
          )}

          {/* MI PERFIL */}
          {activeTab === "perfil" && (
            <div>
              <h2 style={{ color: "#7C3AED", fontWeight: "800", marginBottom: "1.5rem" }}>Mi Perfil</h2>

              {/* INFORMACIÓN PERSONAL */}
              <div style={{ border: "2px solid #f3f4f6", borderRadius: "16px", padding: "2rem", marginBottom: "1.5rem" }}>
                <h3 style={{ color: "#7C3AED", fontWeight: "700", marginBottom: "1.5rem" }}>⚙️ Información Personal</h3>
                <form onSubmit={(e) => { e.preventDefault(); handleSaveChanges(); }}>
                  <div style={{ marginBottom: "1.25rem" }}>
                    <label style={{ display: "block", color: "#6b7280", fontSize: "0.85rem", marginBottom: "0.5rem" }}>Nombre completo</label>
                    <input type="text" value={editedUser.name} onChange={(e) => setEditedUser({ ...editedUser, name: e.target.value })}
                      style={{ width: "100%", padding: "0.875rem 1rem", border: "2px solid #e5e7eb", borderRadius: "12px", fontSize: "1rem", boxSizing: "border-box", color: "#374151" }} />
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.25rem" }}>
                    <div>
                      <label style={{ display: "block", color: "#6b7280", fontSize: "0.85rem", marginBottom: "0.5rem" }}>Email</label>
                      <input type="email" value={editedUser.email} onChange={(e) => setEditedUser({ ...editedUser, email: e.target.value })}
                        style={{ width: "100%", padding: "0.875rem 1rem", border: "2px solid #e5e7eb", borderRadius: "12px", fontSize: "1rem", boxSizing: "border-box", color: "#374151" }} />
                    </div>
                    <div>
                      <label style={{ display: "block", color: "#6b7280", fontSize: "0.85rem", marginBottom: "0.5rem" }}>Teléfono</label>
                      <input type="tel" value={editedUser.phone} onChange={(e) => setEditedUser({ ...editedUser, phone: e.target.value })}
                        style={{ width: "100%", padding: "0.875rem 1rem", border: "2px solid #e5e7eb", borderRadius: "12px", fontSize: "1rem", boxSizing: "border-box", color: "#374151" }} />
                    </div>
                  </div>
                  <button type="submit" style={{ background: "linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)", color: "white", border: "none", padding: "0.875rem 2rem", borderRadius: "12px", fontWeight: "700", cursor: "pointer" }}>
                    Guardar Cambios
                  </button>
                </form>
              </div>

              {/* INFORMACIÓN DEL VEHÍCULO */}
              <div style={{ border: "2px solid #f3f4f6", borderRadius: "16px", padding: "2rem", marginBottom: "1.5rem" }}>
                <h3 style={{ color: "#7C3AED", fontWeight: "700", marginBottom: "1.5rem" }}>🛵 Información del Vehículo</h3>
                <form onSubmit={(e) => { e.preventDefault(); handleSaveVehicle(); }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.25rem" }}>
                    <div>
                      <label style={{ display: "block", color: "#6b7280", fontSize: "0.85rem", marginBottom: "0.5rem" }}>Tipo de vehículo</label>
                      <select
                        value={vehicleData.type}
                        onChange={(e) => setVehicleData({ ...vehicleData, type: e.target.value })}
                        style={{ width: "100%", padding: "0.875rem 1rem", border: "2px solid #e5e7eb", borderRadius: "12px", fontSize: "1rem", boxSizing: "border-box", color: "#374151", background: "white" }}
                      >
                        <option value="Moto Scooter">Moto Scooter</option>
                        <option value="Bicicleta">Bicicleta</option>
                        <option value="Coche">Coche</option>
                        <option value="Bicicleta eléctrica">Bicicleta eléctrica</option>
                        <option value="Moto">Moto</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ display: "block", color: "#6b7280", fontSize: "0.85rem", marginBottom: "0.5rem" }}>Matrícula</label>
                      <input
                        type="text"
                        value={vehicleData.plate}
                        onChange={(e) => setVehicleData({ ...vehicleData, plate: e.target.value })}
                        placeholder="Ej: M-1234-BC"
                        style={{ width: "100%", padding: "0.875rem 1rem", border: "2px solid #e5e7eb", borderRadius: "12px", fontSize: "1rem", boxSizing: "border-box", color: "#374151" }}
                      />
                    </div>
                  </div>
                  <button type="submit" style={{ background: "linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)", color: "white", border: "none", padding: "0.875rem 2rem", borderRadius: "12px", fontWeight: "700", cursor: "pointer" }}>
                    Guardar Vehículo
                  </button>
                </form>
              </div>

              {/* DOCUMENTACIÓN */}
              <div style={{ border: "2px solid #f3f4f6", borderRadius: "16px", padding: "2rem", marginBottom: "1.5rem" }}>
                <h3 style={{ color: "#374151", fontWeight: "700", marginBottom: "1.5rem" }}>📄 Documentación</h3>
                {[
                  { label: "Licencia de conducir", detail: "Verificada - Expira: 15/08/2028" },
                  { label: "Seguro del vehículo", detail: "Verificado - Expira: 22/12/2026" },
                  { label: "Antecedentes penales", detail: "Verificado" },
                ].map((doc, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: "1rem", background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "12px", padding: "1rem 1.25rem", marginBottom: "0.75rem" }}>
                    <span style={{ color: "#10b981", fontSize: "1.25rem" }}>✅</span>
                    <div>
                      <div style={{ fontWeight: "700", color: "#374151" }}>{doc.label}</div>
                      <div style={{ color: "#6b7280", fontSize: "0.85rem" }}>{doc.detail}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* CERRAR SESIÓN Y ELIMINAR CUENTA */}
              <div style={{ border: "2px solid #f3f4f6", borderRadius: "16px", padding: "2rem" }}>
                <h3 style={{ color: "#374151", fontWeight: "700", marginBottom: "1rem" }}>Sesión</h3>
                <button onClick={() => { logout(); navigate("/login"); }} style={{
                  background: "#fee2e2", color: "#991b1b", border: "2px solid #fca5a5",
                  padding: "1rem 2rem", borderRadius: "12px", fontWeight: "700",
                  cursor: "pointer", width: "100%", marginBottom: "1rem"
                }}>
                  🚪 Cerrar Sesión
                </button>
                <button onClick={() => setShowDeleteModal(true)} style={{
                  background: "white", color: "#dc2626", border: "2px solid #dc2626",
                  padding: "1rem 2rem", borderRadius: "12px", fontWeight: "700",
                  cursor: "pointer", width: "100%"
                }}>
                  🗑️ Eliminar Cuenta
                </button>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* MODAL ELIMINAR CUENTA */}
      {showDeleteModal && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)",
          display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000
        }}>
          <div style={{
            background: "white", borderRadius: "24px", padding: "2rem",
            maxWidth: "400px", width: "90%", textAlign: "center",
            boxShadow: "0 24px 48px rgba(0,0,0,0.3)"
          }}>
            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>⚠️</div>
            <h2 style={{ color: "#374151", fontWeight: "800", marginBottom: "0.75rem" }}>
              ¿Eliminar cuenta?
            </h2>
            <p style={{ color: "#6b7280", marginBottom: "2rem", lineHeight: "1.6" }}>
              Esta acción es irreversible. Se eliminarán todos tus datos permanentemente.
            </p>
            <div style={{ display: "flex", gap: "1rem" }}>
              <button onClick={() => setShowDeleteModal(false)} style={{
                flex: 1, padding: "1rem", borderRadius: "12px", border: "none",
                background: "#f3f4f6", color: "#6b7280", fontWeight: "700", cursor: "pointer"
              }}>
                Cancelar
              </button>
              <button onClick={handleDeleteAccount} style={{
                flex: 1, padding: "1rem", borderRadius: "12px", border: "none",
                background: "#dc2626", color: "white", fontWeight: "700", cursor: "pointer"
              }}>
                Sí, eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOAST */}
      {showToast && (
        <div style={{ position: "fixed", top: "2rem", right: "2rem", background: "linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)", color: "white", padding: "1rem 1.5rem", borderRadius: "16px", boxShadow: "0 8px 32px rgba(139,92,246,0.4)", fontWeight: "600", zIndex: 2000 }}>
          {toastMsg}
        </div>
      )}
    </div>
  );
}