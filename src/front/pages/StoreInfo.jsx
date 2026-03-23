import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getToken } from "../Services/authService";

const BRANDS = [
  { name: "Zara", category: "Moda", description: "Ropa, calzado y accesorios de las últimas tendencias." },
  { name: "Gucci", category: "Moda", description: "Moda italiana de lujo con diseños icónicos y exclusivos." },
  { name: "Mango", category: "Moda", description: "Prendas modernas y sofisticadas para el día a día." },
  { name: "Carolina Herrera", category: "Moda", description: "Alta costura y elegancia atemporal con sello venezolano." },
  { name: "Massimo Dutti", category: "Moda", description: "Estilo sofisticado y elegante para hombre y mujer." },
  { name: "Nike", category: "Deportes", description: "Ropa y calzado deportivo de alto rendimiento." },
  { name: "Adidas", category: "Deportes", description: "Equipamiento deportivo y lifestyle de clase mundial." },
  { name: "Apple Store", category: "Tecnología", description: "Gran variedad de productos tecnológicos." },

 
];

const CATEGORY_COLORS = {
  "Moda": { bg: "#f5f3ff", color: "#7C3AED", border: "#e9d5ff" },
  "Lujo": { bg: "#fef3c7", color: "#92400e", border: "#fde68a" },
  "Gran Almacén": { bg: "#dbeafe", color: "#1e40af", border: "#bfdbfe" },
  "Deportes": { bg: "#d1fae5", color: "#065f46", border: "#a7f3d0" },
  "Belleza": { bg: "#fce7f3", color: "#9d174d", border: "#fbcfe8" },
  "Tecnología": { bg: "#f0f9ff", color: "#0369a1", border: "#bae6fd" },
  "Hogar": { bg: "#fff7ed", color: "#c2410c", border: "#fed7aa" },
  "Supermercado": { bg: "#f0fdf4", color: "#166534", border: "#bbf7d0" },
};

export const StoreInfo = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = getToken();
    if (token) navigate("/Stores");
  }, [navigate]);

  return (
    <div style={{ background: "#f9fafb", minHeight: "100vh", padding: "2rem 1rem" }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>

        {/* HEADER */}
        <div style={{
          background: "linear-gradient(135deg, #8B5CF6 0%, #7C3AED 50%, #6D28D9 100%)",
          borderRadius: "24px", padding: "3rem 2rem", marginBottom: "2rem",
          boxShadow: "0 20px 60px rgba(139, 92, 246, 0.4)", textAlign: "center",
          position: "relative", overflow: "hidden"
        }}>
          <div style={{
            position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
            background: "radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(255,255,255,0.1) 0%, transparent 50%)",
            pointerEvents: "none"
          }} />
          <h1 style={{ color: "white", fontSize: "2.5rem", fontWeight: "800", margin: "0 0 1rem", textShadow: "0 2px 8px rgba(0,0,0,0.2)" }}>
            🏪 Nuestras Tiendas Asociadas
          </h1>
          <p style={{ color: "rgba(255,255,255,0.85)", fontSize: "1.1rem", margin: "0 0 2rem", maxWidth: "600px", marginLeft: "auto", marginRight: "auto" }}>
            Trabajamos con las mejores marcas para que puedas recibir tus compras en minutos. Inicia sesión para ver las tiendas disponibles y hacer tu pedido.
          </p>
          <button
            onClick={() => navigate("/login")}
            style={{
              background: "white", color: "#7C3AED", border: "none",
              padding: "1rem 2.5rem", borderRadius: "50px", fontWeight: "700",
              fontSize: "1.1rem", cursor: "pointer", transition: "all 0.3s",
              boxShadow: "0 4px 16px rgba(0,0,0,0.15)"
            }}
            onMouseEnter={e => e.target.style.background = "#FDE047"}
            onMouseLeave={e => e.target.style.background = "white"}
          >
            🚀 Iniciar Sesión para Ver Tiendas
          </button>
        </div>

        {/* STATS */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
          {[
            { icon: "🏪", number: "50+", label: "Tiendas asociadas" },
            { icon: "🚴", number: "500+", label: "Riders disponibles" },
            { icon: "⚡", number: "15min", label: "Tiempo promedio" },
            { icon: "⭐", number: "98%", label: "Satisfacción" },
          ].map((stat, i) => (
            <div key={i} style={{
              background: "white", borderRadius: "20px", padding: "1.5rem",
              textAlign: "center", boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
              border: "2px solid #f3f4f6"
            }}>
              <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>{stat.icon}</div>
              <div style={{ fontSize: "1.75rem", fontWeight: "800", color: "#7C3AED" }}>{stat.number}</div>
              <div style={{ color: "#6b7280", fontSize: "0.9rem", fontWeight: "600" }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* TITULO */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
          <h2 style={{ color: "#1f2937", fontWeight: "800", fontSize: "1.75rem", margin: 0 }}>
            Colaboradores destacados
          </h2>
          <span style={{ color: "#6b7280", fontWeight: "600" }}>
            {BRANDS.length} marcas disponibles
          </span>
        </div>

        {/* LISTA DE MARCAS */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "3rem" }}>
          {BRANDS.map((brand, i) => {
            const catColor = CATEGORY_COLORS[brand.category] || { bg: "#f3f4f6", color: "#374151", border: "#e5e7eb" };
            return (
              <div key={i} style={{
                background: "white", borderRadius: "16px", padding: "1.25rem 1.5rem",
                display: "flex", alignItems: "center", gap: "1.25rem",
                boxShadow: "0 2px 8px rgba(0,0,0,0.06)", border: "2px solid #f3f4f6",
                transition: "all 0.3s"
              }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = "#8B5CF6";
                  e.currentTarget.style.boxShadow = "0 8px 24px rgba(139,92,246,0.15)";
                  e.currentTarget.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = "#f3f4f6";
                  e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.06)";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                <div style={{
                  width: "50px", height: "50px", borderRadius: "14px",
                  background: "linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "white", fontSize: "1.25rem", fontWeight: "800", flexShrink: 0
                }}>
                  {brand.name.charAt(0)}
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.25rem", flexWrap: "wrap" }}>
                    <h3 style={{ color: "#1f2937", fontWeight: "800", margin: 0, fontSize: "1.1rem" }}>
                      {brand.name}
                    </h3>
                    <span style={{
                      background: catColor.bg, color: catColor.color,
                      border: `1px solid ${catColor.border}`,
                      padding: "0.2rem 0.75rem", borderRadius: "20px",
                      fontSize: "0.75rem", fontWeight: "700"
                    }}>
                      {brand.category}
                    </span>
                  </div>
                  <p style={{ color: "#6b7280", margin: 0, fontSize: "0.9rem" }}>
                    {brand.description}
                  </p>
                </div>

                <div style={{
                  background: "#f5f3ff", borderRadius: "12px", padding: "0.75rem",
                  color: "#7C3AED", fontSize: "1.25rem", flexShrink: 0
                }}>
                  🔒
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA FINAL */}
        <div style={{
          background: "linear-gradient(135deg, #8B5CF6 0%, #7C3AED 50%, #6D28D9 100%)",
          borderRadius: "24px", padding: "2.5rem", textAlign: "center",
          boxShadow: "0 20px 60px rgba(139, 92, 246, 0.4)"
        }}>
          <h2 style={{ color: "white", fontWeight: "800", fontSize: "1.75rem", margin: "0 0 1rem" }}>
            ¿Listo para empezar?
          </h2>
          <p style={{ color: "rgba(255,255,255,0.85)", margin: "0 0 2rem" }}>
            Inicia sesión o crea tu cuenta para acceder a todas nuestras tiendas asociadas.
          </p>
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
            <button
              onClick={() => navigate("/login")}
              style={{
                background: "white", color: "#7C3AED", border: "none",
                padding: "1rem 2rem", borderRadius: "50px", fontWeight: "700",
                fontSize: "1rem", cursor: "pointer", transition: "all 0.3s"
              }}
              onMouseEnter={e => e.target.style.background = "#FDE047"}
              onMouseLeave={e => e.target.style.background = "white"}
            >
              🔑 Iniciar Sesión
            </button>
            <button
              onClick={() => navigate("/register")}
              style={{
                background: "transparent", color: "white",
                border: "2px solid rgba(255,255,255,0.5)",
                padding: "1rem 2rem", borderRadius: "50px", fontWeight: "700",
                fontSize: "1rem", cursor: "pointer"
              }}
              onMouseEnter={e => {
                e.target.style.background = "rgba(255,255,255,0.15)";
                e.target.style.borderColor = "white";
              }}
              onMouseLeave={e => {
                e.target.style.background = "transparent";
                e.target.style.borderColor = "rgba(255,255,255,0.5)";
              }}
            >
              ✨ Crear Cuenta Gratis
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};