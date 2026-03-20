import { Link } from "react-router-dom";

export const Howorks = () => {
    const steps = [
        {
            number: 1,
            emoji: "🛍️",
            title: "Haz tu compra en tienda",
            description: "Visita las tiendas con el QR de SHO&GO y realiza tu compra como siempre. Puedes comprar ropa, electrónica, libros, o lo que necesites.",
            features: [
                "Compatible con tiendas ASOCIADAS a SHO&GO en todo España",
                "Sin restricciones de productos",
                "Compra como siempre lo haces"
            ],
            gradient: "linear-gradient(135deg, #A855F7, #8B5CF6)"
        },
        {
            number: 2,
            emoji: "📱",
            title: "Solicita tu entrega",
            description: "Abre la app de SHOP&GO, escanea el QR con tu perfil, introduce la tienda asociada y tu dirección de entrega. Es rápido y sencillo.",
            features: [
                "Interfaz intuitiva y fácil",
                "Precio transparente al instante",
                "Múltiples métodos de pago con tarjeta"
            ],
            gradient: "linear-gradient(135deg, #8B5CF6, #7C3AED)"
        },
        {
            number: 3,
            emoji: "🚴",
            title: "Rider asignado",
            description: "Nuestro sistema busca automáticamente el rider más cercano disponible. Recibirás una notificación inmediata.",
            features: [
                "Asignación automática",
                "Riders verificados",
                "Seguimiento en tiempo real"
            ],
            gradient: "linear-gradient(135deg, #7C3AED, #D946EF)"
        },
        {
            number: 4,
            emoji: "📦",
            title: "Recibe en tu puerta",
            description: "El rider recoge tu compra en la tienda y te la entrega directamente en la puerta de tu casa en minutos.",
            features: [
                "Entrega en menos de 60 min",
                "Notificación al llegar",
                "Valora tu experiencia"
            ],
            gradient: "linear-gradient(135deg, #D946EF, #EC4899)"
        }
    ];

    return (
        <div className="howorks-page">

            {/* HERO */}
            <div className="howorks-hero">
                <h1 className="howorks-hero-title">
                    ¿Cómo funciona <span className="highlight">SHOP&GO?</span>
                </h1>
                <p className="howorks-hero-subtitle">
                    Conectar tu compra con un rider es súper simple y rápido
                </p>
                <div className="howorks-hero-buttons">
                    <Link to="/hacer-pedido" className="btn-primary">📦 Solicitar Entrega</Link>
                    <Link to="/Foriders" className="btn-secondary">🚴 Conviértete en Rider</Link>
                </div>
            </div>

            {/* SECCIÓN PARA USUARIOS */}
            <div className="howorks-section">
                <h2 className="section-title">Para Usuarios</h2>
                <p className="section-subtitle">Cuatro pasos sencillos para recibir tus compras en casa</p>

                <div className="steps-alternating">
                    {steps.map((step, index) => (
                        <div key={index} className={`step-row ${index % 2 !== 0 ? "step-row-reverse" : ""}`}>
                            <div className="step-text-side">
                                <div className="step-number">{step.number}</div>
                                <div className="step-icon-small">{step.emoji}</div>
                                <h3 className="step-title">{step.title}</h3>
                                <p className="step-description">{step.description}</p>
                                <ul className="step-features">
                                    {step.features.map((feature, i) => (
                                        <li key={i}>✅ {feature}</li>
                                    ))}
                                </ul>
                            </div>
                            <div className="step-image-side" style={{ background: step.gradient }}>
                                <span className="step-image-emoji">{step.emoji}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* CTA FINAL */}
            <div className="howorks-cta">
                <h2>¿Listo para empezar?</h2>
                <p>Haz tu primera entrega en menos de 5 minutos</p>
                <Link to="/register" className="btn-cta">Crear Cuenta Gratis</Link>
            </div>

        </div>
    );
};