import { useEffect, useState } from "react";
import "../mispedidos.css";
import { useNavigate } from "react-router-dom";

export const MisPedidos = () => {
    const [orders, setOrders] = useState([]);
    const navigate = useNavigate();

    const getOrders = async () => {
        try {
            const token = localStorage.getItem("token");

            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/orders`, {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (!response.ok) {
                console.log(data);
                return;
            }

            setOrders(data);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        getOrders();
    }, []);

    return (
        <div className="mis-pedidos-container">
            <div className="mis-pedidos-wrapper">
                <h1 className="mis-pedidos-title">Mis pedidos</h1>
                <p className="mis-pedidos-subtitle">Consulta el estado de tus pedidos recientes</p>

                {orders.length === 0 ? (
                    <div className="empty-orders">
                        <h3>No tienes pedidos aún</h3>
                        <p>Cuando hagas uno, aparecerá aquí.</p>
                    </div>
                ) : (
                    <div className="orders-grid">
                        {orders.map((order) => (
                            <div key={order.id} className="order-card">
                                <div className="order-card-top">
                                    <h3 className="order-id">Pedido #{order.id}</h3>
                                    <span className={`order-status ${order.status}`}>
                                        {order.status}
                                    </span>
                                </div>

                                <div className="order-details">

                                    <div className="order-detail-box">
                                        <span className="order-detail-label">Tienda</span>
                                        <span className="order-detail-value">{order.store_name}</span>
                                    </div>

                                    <div className="order-detail-box">
                                        <span className="order-detail-label">Dirección</span>
                                        <span className="order-detail-value">{order.delivery_address}</span>
                                    </div>

                                    <div className="order-detail-box">
                                        <span className="order-detail-label">Pago</span>
                                        <span className="order-detail-value">{order.payment_status}</span>
                                    </div>

                                    <div className="order-detail-box">
                                        <span className="order-detail-label">Repartidor</span>
                                        <span className="order-detail-value">{order.driver_name}</span>
                                    </div>
                                </div>
                                <button
                                    className="tracking-btn"
                                    onClick={() => navigate(`/tracking/${order.id}`)}
                                >
                                    Ver seguimiento
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};