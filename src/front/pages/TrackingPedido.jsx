import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "../TrackingPedido.css";

export const TrackingPedido = () => {
    const { orderId } = useParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    const steps = ["pending", "accepted", "in_transit", "delivered"];

    const stepLabels = {
        pending: "Pedido recibido",
        accepted: "Preparando pedido",
        in_transit: "En camino",
        delivered: "Entregado"
    };

    const getStepIndex = (status) => {
        return steps.indexOf(status);
    };

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
            console.error("Error cargando pedido:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getOrder();

        const interval = setInterval(() => {
            getOrder();
        }, 5000);

        return () => clearInterval(interval);
    }, [orderId]);

    const currentStep = order ? getStepIndex(order.status) : -1;

    if (loading) return <p className="tracking-loading">Cargando seguimiento...</p>;
    if (!order) return <p className="tracking-loading">No se pudo cargar el pedido.</p>;

    return (
        <div className="tracking-container">
            <div className="tracking-card">
                <h1 className="tracking-title">Seguimiento del pedido #{order.id}</h1>
                <p className="tracking-subtitle">Estado actualizado automáticamente</p>

                <div className="tracking-status-box">
                    <span className="tracking-status-label">Estado actual</span>
                    <span className={`tracking-status-badge ${order.status}`}>
                        {stepLabels[order.status] || order.status}
                    </span>
                </div>

                <div className="tracking-steps">
                    {steps.map((step, index) => (
                        <div key={step} className="tracking-step-wrapper">
                            <div className={`tracking-step ${index <= currentStep ? "active" : ""}`}>
                                {index + 1}
                            </div>
                            <span className={`tracking-step-label ${index <= currentStep ? "active" : ""}`}>
                                {stepLabels[step]}
                            </span>
                        </div>
                    ))}
                </div>

                <div className="tracking-details">
                    <div className="tracking-detail-box">
                        <span className="tracking-detail-label">Tienda</span>
                        <span className="tracking-detail-value">{order.store_name}</span>
                    </div>

                    <div className="tracking-detail-box">
                        <span className="tracking-detail-label">Dirección</span>
                        <span className="tracking-detail-value">{order.delivery_address}</span>
                    </div>

                    <div className="tracking-detail-box">
                        <span className="tracking-detail-label">Cliente</span>
                        <span className="tracking-detail-value">{order.client_name}</span>
                    </div>

                    <div className="tracking-detail-box">
                        <span className="tracking-detail-label">Rider</span>
                        <span className="tracking-detail-value">{order.driver_name}</span>
                    </div>

                    <div className="tracking-detail-box">
                        <span className="tracking-detail-label">Pago</span>
                        <span className="tracking-detail-value">{order.payment_status}</span>
                    </div>

                    <div className="tracking-detail-box">
                        <span className="tracking-detail-label">Creado</span>
                        <span className="tracking-detail-value">{order.created_at}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};