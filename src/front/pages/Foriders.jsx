import { Link } from "react-router-dom";

export const Foriders = () => {
    const riderSteps = [
        {
            number: 1,
            emoji: "📱",
            title: "Descarga la app",
            description: "Instala SHOP&GO Rider y crea tu cuenta en minutos"
        },
        {
            number: 2,
            emoji: "🛡️",
            title: "Verificación",
            description: "Valida tu identidad y documentación. Proceso rápido y seguro"
        },
        {
            number: 3,
            emoji: "📅",
            title: "Trabaja cuando quieras",
            description: "Activa tu disponibilidad y empieza a recibir solicitudes"
        },
        {
            number: 4,
            emoji: "💰",
            title: "Gana dinero",
            description: "Recibe pagos semanales más propinas de los clientes"
        }
    ];

    const benefits = [
        {
            emoji: "🏃",
            title: "Sin jefes",
            description: "Tú decides cuándo, dónde y cuánto trabajas. Total libertad."
        },
        {
            emoji: "📍",
            title: "Tu zona",
            description: "Trabaja en tu barrio o ciudad. Sin desplazamientos largos."
        },
        {
            emoji: "🔒",
            title: "Seguro incluido",
            description: "Todos los riders cuentan con seguro durante las entregas."
        },
        {
            emoji: "⭐",
            title: "Propinas",
            description: "Recibe propinas directas de los clientes satisfechos."
        }
    ];

    return (
        <div className="foriders-page">

            {/* HERO */}
            <div className="foriders-hero">
                <h1 className="foriders-hero-title">
                    Conviértete en <span className="highlight">Rider</span>
                </h1>
                <p className="foriders-hero-subtitle">
                    Gana dinero con flexibilidad total. Trabaja cuando quieras, donde quieras.
                </p>
                <Link to="/register" className="btn-join-hero">Únete como Rider</Link>
            </div>

            {/* STATS */}
            <div className="foriders-stats">
                <div className="stat-card">
                    <span className="stat-emoji">💰</span>
                    <h3 className="stat-value">20-30€/hora</h3>
                    <p className="stat-label">Ganancias promedio</p>
                </div>
                <div className="stat-card">
                    <span className="stat-emoji">📅</span>
                    <h3 className="stat-value">100%</h3>
                    <p className="stat-label">Flexibilidad horaria</p>
                </div>
                <div className="stat-card">
                    <span className="stat-emoji">⚡</span>
                    <h3 className="stat-value">Semanal</h3>
                    <p className="stat-label">Pagos garantizados</p>
                </div>
            </div>

            {/* CÓMO EMPEZAR */}
            <div className="foriders-steps-section">
                <h2 className="foriders-section-title">¿Cómo empezar?</h2>
                <p className="foriders-section-subtitle">En 4 sencillos pasos estarás listo para ganar dinero</p>

                <div className="rider-steps-grid">
                    {riderSteps.map((step, index) => (
                        <div key={index} className="rider-step-card">
                            <div className="rider-step-number">{step.number}</div>
                            <div className="rider-step-icon">{step.emoji}</div>
                            <h3 className="rider-step-title">{step.title}</h3>
                            <p className="rider-step-desc">{step.description}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* BENEFICIOS */}
            <div className="foriders-benefits-section">
                <h2 className="foriders-section-title-white">¿Por qué ser rider en SHOP&GO?</h2>

                <div className="rider-benefits-grid">
                    {benefits.map((benefit, index) => (
                        <div key={index} className="rider-benefit-card">
                            <span className="rider-benefit-emoji">{benefit.emoji}</span>
                            <h3 className="rider-benefit-title">{benefit.title}</h3>
                            <p className="rider-benefit-desc">{benefit.description}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* CTA FINAL */}
            <div className="foriders-cta">
                <h2>¿Listo para empezar a ganar?</h2>
                <p>Regístrate hoy y haz tu primera entrega mañana</p>
                <Link to="/register" className="btn-cta-rider">Crear Cuenta de Rider</Link>
            </div>

        </div>
    );
};