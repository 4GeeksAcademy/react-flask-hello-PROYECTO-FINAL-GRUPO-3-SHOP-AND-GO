import { Link } from "react-router-dom";
export const Foriders = () => {
    return (
        <div className="foriders-page">
            <h1 className="foriders-title">Para Riders</h1>
            <p className="foriders-subtitle">
                Gana dinero con flexibilidad total. Trabaja cuando quieras, donde quieras.
            </p>

            <div className="benefits-grid">
                <div className="benefit-card">
                    <div className="benefit-icon">💰</div>
                    <h3>20-30€/hora</h3>
                    <p>Ganancias promedio</p>
                </div>

                <div className="benefit-card">
                    <div className="benefit-icon">📅</div>
                    <h3>100%</h3>
                    <p>Flexibilidad horaria</p>
                </div>

                <div className="benefit-card">
                    <div className="benefit-icon">⚡</div>
                    <h3>Semanal</h3>
                    <p>Pagos garantizados</p>
                </div>
            </div>

            <button className="join-btn">Únete como Rider</button>
        </div>
    );
};