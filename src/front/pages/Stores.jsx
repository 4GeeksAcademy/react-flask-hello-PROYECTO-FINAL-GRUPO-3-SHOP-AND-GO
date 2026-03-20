import { Link } from "react-router-dom";

export const Stores = () => {
    const brands = [
        { name: "Zara", emoji: "👗", category: "Moda", color: "linear-gradient(135deg, #1a1a1a, #333)" },
        { name: "Nike", emoji: "👟", category: "Deportes", color: "linear-gradient(135deg, #FA5400, #FF7A00)" },
        { name: "El Corte Inglés", emoji: "🏬", category: "Grandes Almacenes", color: "linear-gradient(135deg, #006633, #00994D)" },
        { name: "Sephora", emoji: "💄", category: "Belleza", color: "linear-gradient(135deg, #000000, #333)" },
        { name: "Adidas", emoji: "🏃", category: "Deportes", color: "linear-gradient(135deg, #000000, #555)" },
        { name: "Massimo Dutti", emoji: "🧥", category: "Moda", color: "linear-gradient(135deg, #2C2C54, #474787)" },
        { name: "GUESS", emoji: "👜", category: "Moda & Accesorios", color: "linear-gradient(135deg, #C0392B, #E74C3C)" },
        { name: "Guerlain", emoji: "🌸", category: "Perfumería", color: "linear-gradient(135deg, #C9A96E, #D4AF37)" },
        { name: "Primark", emoji: "🛍️", category: "Moda", color: "linear-gradient(135deg, #0074B7, #009FE3)" },
        { name: "MediaMarkt", emoji: "📺", category: "Electrónica", color: "linear-gradient(135deg, #E2001A, #FF3333)" },
        { name: "IKEA", emoji: "🏠", category: "Hogar", color: "linear-gradient(135deg, #0058A3, #007DC5)" },
        { name: "Mango", emoji: "👚", category: "Moda", color: "linear-gradient(135deg, #2D2D2D, #555)" }
    ];

    const stats = [
        { value: "50+", label: "Tiendas asociadas" },
        { value: "12", label: "Categorías" },
        { value: "6", label: "Ciudades" },
        { value: "24/7", label: "Disponibilidad" }
    ];

    return (
        <div className="stores-page">

            {/* HERO */}
            <div className="stores-hero">
                <h1 className="stores-hero-title">
                    Tiendas <span className="highlight">Asociadas</span>
                </h1>
                <p className="stores-hero-subtitle">
                    Las mejores marcas ya confían en SHOP&GO. Compra en tienda y recibe en casa en minutos.
                </p>
            </div>

            {/* STATS */}
            <div className="stores-stats">
                {stats.map((stat, index) => (
                    <div key={index} className="stores-stat-card">
                        <h3 className="stores-stat-value">{stat.value}</h3>
                        <p className="stores-stat-label">{stat.label}</p>
                    </div>
                ))}
            </div>

            {/* GRID DE MARCAS */}
            <div className="stores-section">
                <h2 className="stores-section-title">Nuestras Marcas</h2>
                <p className="stores-section-subtitle">Compra en cualquiera de estas tiendas y un rider te lo lleva a casa</p>

                <div className="stores-grid">
                    {brands.map((brand, index) => (
                        <div key={index} className="store-card">
                            <div className="store-card-image" style={{ background: brand.color }}>
                                <span className="store-card-emoji">{brand.emoji}</span>
                            </div>
                            <div className="store-card-info">
                                <h3 className="store-card-name">{brand.name}</h3>
                                <span className="store-card-category">{brand.category}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* CÓMO FUNCIONA MINI */}
            <div className="stores-how">
                <h2 className="stores-how-title">¿Cómo funciona?</h2>
                <div className="stores-how-steps">
                    <div className="stores-how-step">
                        <span className="stores-how-emoji">🛍️</span>
                        <h3>Compra en tienda</h3>
                        <p>Visita cualquier tienda asociada</p>
                    </div>
                    <div className="stores-how-arrow">→</div>
                    <div className="stores-how-step">
                        <span className="stores-how-emoji">📱</span>
                        <h3>Pide tu entrega</h3>
                        <p>Selecciona la tienda en la app</p>
                    </div>
                    <div className="stores-how-arrow">→</div>
                    <div className="stores-how-step">
                        <span className="stores-how-emoji">📦</span>
                        <h3>Recibe en casa</h3>
                        <p>Un rider te lo lleva en minutos</p>
                    </div>
                </div>
            </div>

            {/* CTA */}
            <div className="stores-cta">
                <h2>¿Quieres que tu tienda esté en SHOP&GO?</h2>
                <p>Únete a nuestra red de tiendas asociadas y llega a más clientes</p>
                <a href="mailto:partners@shopandgo.com" className="btn-stores-cta">Contactar para Asociarse</a>
            </div>

        </div>
    );
};