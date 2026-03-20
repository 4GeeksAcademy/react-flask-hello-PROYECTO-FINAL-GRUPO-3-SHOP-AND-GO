import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";


export const PedidoFinalizado = () => {
    const { orderId } = useParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    const getOrder = async () => {
        try {
            const token = localStorage.getItem("token");

            const response = await fetch(
                `${import.meta.env.VITE_BACKEND_URL}/api/orders/${orderId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const data = await response.json();

            if (!response.ok) {
                console.log(data);
                return;
            }

            setOrder(data);
        } catch (error) {
            console.error("Error cargando pedido finalizado:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getOrder();
    }, [orderId]);

    if (loading) return <p className="final-loading">Cargando pedido...</p>;
    if (!order) return <p className="final-loading">No se pudo cargar el pedido.</p>;

    return (
        <div className="final-container">
            <div className="final-card">
                <div className="final-header">
                    <div>
                        <h1 className="final-title">Pedido entregado #{order.id}</h1>
                        <p className="final-subtitle">
                            Tu pedido ha sido entregado correctamente
                        </p>
                    </div>

                    <div className="final-status-box">
                        <span className="final-label">Estado</span>
                        <strong className="final-status-value">Entregado</strong>
                    </div>
                </div>

                <div className="final-grid">
                    <div className="final-box">
                        <span className="final-label">Tienda</span>
                        <span className="final-value">{order.store_name}</span>
                        <p className="final-subvalue">{order.store_address}</p>
                    </div>

                    <div className="final-box">
                        <span className="final-label">Dirección de entrega</span>
                        <span className="final-value">{order.client_name}</span>
                        <p className="final-subvalue">{order.client_address}</p>
                    </div>

                    <div className="final-box">
                        <span className="final-label">Rider</span>
                        <span className="final-value">
                            {order.driver_name || "No asignado"}
                        </span>
                    </div>

                    <div className="final-box">
                        <span className="final-label">Pago</span>
                        <span className="final-value">{order.payment_status}</span>
                    </div>

                    <div className="final-box">
                        <span className="final-label">Fecha</span>
                        <span className="final-value">{order.created_at}</span>
                    </div>

                    <div className="final-box">
                        <span className="final-label">Estado final</span>
                        <span className="final-value">{order.status}</span>
                    </div>
                </div>

                <div className="final-actions">
                    <Link to="/mis-pedidos" className="btn btn-dark">
                        Ver mis pedidos
                    </Link>

                    <Link to="/hacer-pedido" className="btn btn-outline-dark">
                        Hacer otro pedido
                    </Link>
                </div>
            </div>
        </div>
    );
};