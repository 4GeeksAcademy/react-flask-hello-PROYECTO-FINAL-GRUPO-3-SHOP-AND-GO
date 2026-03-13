import { Link } from "react-router-dom";

export const Howorks = () => {
    return (
        <div className="howorks-page">

            <div className="howorks-hero">
                <h1 className="howorks-hero-title">
                    ¿Cómo funciona <span className="highlight">SHOP&GO?</span>
                </h1>
                <p className="howorks-hero-subtitle">
                    La forma más rápida y sencilla de recibir tus compras en casa
                </p>
                <div className="howorks-hero-buttons">
                    <button className="btn-primary">📦 Solicitar Entrega</button>
                    <button className="btn-secondary">🚴 Conviértete en Rider</button>
                </div>
            </div>

            {/* Pasos */}
            <div className="howorks-steps">
                <div className="step">
                    <h2>🛍️ Haz tu compra en tienda</h2>
                    <p>Visita cualquier tienda física y realiza tu compra como siempre</p>
                </div>

                <div className="step">
                    <h2>📱 Solicita tu entrega</h2>
                    <p>Abre la app de SHOP&GO e introduce la ubicación de la tienda y tu dirección</p>
                </div>

                <div className="step">
                    <h2>🚴 Rider asignado</h2>
                    <p>Nuestro sistema busca automáticamente el rider más cercano disponible</p>
                </div>

                <div className="step">
                    <h2>🏠 Recibe en tu puerta</h2>
                    <p>El rider recoge tu compra en la tienda y te la entrega directamente</p>
                </div>
            </div>
        </div>
    );

};