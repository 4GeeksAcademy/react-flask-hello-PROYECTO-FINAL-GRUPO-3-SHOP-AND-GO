import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import L from "leaflet";


delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

export const TrackingPedido = () => {
    const { orderId } = useParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [routeCoords, setRouteCoords] = useState([]);
    const [eta, setEta] = useState(null);
    const navigate = useNavigate();

    const apiKey = import.meta.env.VITE_GEOAPIFY_API_KEY;

    const stepLabels = {
        pending: "Pedido recibido",
        accepted: "Preparando pedido",
        in_transit: "En camino",
        delivered: "Entregado",
        cancelled: "Cancelado"
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

    const getRoute = async (fromLat, fromLng, toLat, toLng) => {
        try {
            const url =
                `https://api.geoapify.com/v1/routing?` +
                `waypoints=${fromLat},${fromLng}|${toLat},${toLng}` +
                `&mode=drive&details=instruction_details&apiKey=${apiKey}`;

            const response = await fetch(url);
            const data = await response.json();

            console.log("Route data:", data);
            console.log("Feature:", data?.features?.[0]);
            console.log("Coords:", data?.features?.[0]?.geometry?.coordinates);
            console.log("Time:", data?.features?.[0]?.properties?.time);

            const feature = data?.features?.[0];
            const coords = feature?.geometry?.coordinates?.[0] || [];
            const seconds = feature?.properties?.time;

            if (coords.length) {
                setRouteCoords(coords.map(([lng, lat]) => [lat, lng]));
            }

            if (seconds) {
                setEta(Math.ceil(seconds / 60));
            }
        } catch (error) {
            console.error("Error cargando ruta:", error);
        }
    };

    useEffect(() => {
        getOrder();

        const interval = setInterval(() => {
            getOrder();
        }, 5000);

        return () => clearInterval(interval);
    }, [orderId]);

    useEffect(() => {
        if (order?.status === "delivered") {
            navigate(`/pedido-finalizado/${order.id}`);
        }
    }, [order, navigate]);

    useEffect(() => {
        console.log("store_latitude:", order?.store_latitude);
        console.log("store_longitude:", order?.store_longitude);
        console.log("client_latitude:", order?.client_latitude);
        console.log("client_longitude:", order?.client_longitude);
        console.log("apiKey:", apiKey);

        if (
            order?.store_latitude != null &&
            order?.store_longitude != null &&
            order?.client_latitude != null &&
            order?.client_longitude != null &&
            apiKey
        ) {
            getRoute(
                order.store_latitude,
                order.store_longitude,
                order.client_latitude,
                order.client_longitude
            );
        }
    }, [order, apiKey]);

    const mapCenter = useMemo(() => {
        if (order?.store_latitude && order?.store_longitude) {
            return [order.store_latitude, order.store_longitude];
        }
        return [40.4168, -3.7038];
    }, [order]);

    if (loading) return <p className="tracking-loading">Cargando seguimiento...</p>;
    if (!order) return <p className="tracking-loading">No se pudo cargar el pedido.</p>;
    console.log("routeCoords:", routeCoords);
   return (
    <div className="tracking-container">
        <div className="tracking-card">
            <div className="tracking-header-row">
                <div className="tracking-header-text">
                    <h1 className="tracking-title">Seguimiento del pedido #{order.id}</h1>
                    <p className="tracking-subtitle">
                        {stepLabels[order.status] || order.status}
                    </p>
                </div>

                <div className="tracking-eta-box">
                    <span className="tracking-detail-label">ETA</span>
                    <strong className="tracking-eta-value">
                        {order.status === "delivered"
                            ? "Entregado"
                            : order.status === "cancelled"
                                ? "Cancelado"
                                : eta
                                    ? `${eta} min`
                                    : "Calculando..."}
                    </strong>
                </div>
            </div>

            <div className="tracking-map-wrapper">
                <MapContainer
                    center={mapCenter}
                    zoom={13}
                    scrollWheelZoom={true}
                    className="tracking-map"
                >
                    <TileLayer
                        url={`https://maps.geoapify.com/v1/tile/osm-carto/{z}/{x}/{y}.png?apiKey=${apiKey}`}
                        attribution='&copy; OpenStreetMap contributors &copy; Geoapify'
                    />

                    {order?.store_latitude && order?.store_longitude && (
                        <Marker position={[order.store_latitude, order.store_longitude]}>
                            <Popup>
                                <strong>{order.store_name}</strong>
                                <br />
                                {order.store_address}
                            </Popup>
                        </Marker>
                    )}

                    {order?.client_latitude && order?.client_longitude && (
                        <Marker position={[order.client_latitude, order.client_longitude]}>
                            <Popup>
                                <strong>{order.client_name}</strong>
                                <br />
                                {order.client_address}
                            </Popup>
                        </Marker>
                    )}

                    {routeCoords.length > 0 && (
                        <Polyline
                            positions={routeCoords}
                            pathOptions={{ color: "blue", weight: 6, opacity: 1 }}
                        />
                    )}
                </MapContainer>
            </div>

            <div className="tracking-details-grid">
                <div className="tracking-detail-box tracking-detail-box-wide">
                    <span className="tracking-detail-label">Tienda</span>
                    <span className="tracking-detail-value">{order.store_name}</span>
                    <p className="tracking-detail-subvalue">{order.store_address}</p>
                </div>

                <div className="tracking-detail-box tracking-detail-box-wide">
                    <span className="tracking-detail-label">Cliente</span>
                    <span className="tracking-detail-value">{order.client_name}</span>
                    <p className="tracking-detail-subvalue">{order.client_address}</p>
                </div>

                <div className="tracking-detail-box">
                    <span className="tracking-detail-label">Rider</span>
                    <span className="tracking-detail-value">
                        {order.driver_name || "Sin asignar"}
                    </span>
                </div>

                <div className="tracking-detail-box">
                    <span className="tracking-detail-label">Pago</span>
                    <span className="tracking-detail-value">{order.payment_status}</span>
                </div>

                <div className="tracking-detail-box">
                    <span className="tracking-detail-label">Estado</span>
                    <span className="tracking-detail-value">
                        {stepLabels[order.status] || order.status}
                    </span>
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