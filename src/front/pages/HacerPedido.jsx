import { useEffect, useState } from "react";
import "../hacerpedido.css";

const HacerPedido = () => {
    const [addresses, setAddresses] = useState([]);
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [useNewAddress, setUseNewAddress] = useState(false);

    const [stores, setStores] = useState([]);
    const [selectedStore, setSelectedStore] = useState(null);

    const [orderDetails, setOrderDetails] = useState("");
    const [paymentMethod, setPaymentMethod] = useState("");

    const [bagsCount, setBagsCount] = useState(1);
    const [distanceKm, setDistanceKm] = useState(0);
    const [deliveryPrice, setDeliveryPrice] = useState(0);

    useEffect(() => {
        const token = localStorage.getItem("token");

        fetch(import.meta.env.VITE_BACKEND_URL + "/api/addresses", {
            method: "GET",
            headers: {
                "Authorization": "Bearer " + token,
                "Content-Type": "application/json"
            }
        })
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setAddresses(data);
                } else {
                    setAddresses([]);
                    console.log("Error addresses:", data);
                }
            })
            .catch(err => console.log(err));

        fetch(import.meta.env.VITE_BACKEND_URL + "/api/stores", {
            method: "GET",
            headers: {
                "Authorization": "Bearer " + token,
                "Content-Type": "application/json"
            }
        })
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setStores(data);
                } else {
                    setStores([]);
                    console.log("Error stores:", data);
                }
            })
            .catch(err => console.log(err));
    }, []);

    useEffect(() => {
        const token = localStorage.getItem("token");

        if (!selectedStore || !selectedAddress) return;

        fetch(import.meta.env.VITE_BACKEND_URL + "/api/calculate-price", {
            method: "POST",
            headers: {
                "Authorization": "Bearer " + token,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                store_id: selectedStore.id,
                address_id: selectedAddress,
                bags_count: bagsCount
            })
        })
            .then(res => res.json())
            .then(data => {
                console.log("PRICE DATA:", data);

                setDistanceKm(data.distance_km || 0);
                setDeliveryPrice(data.price || 0);
            })
            .catch(err => console.log(err));

    }, [selectedStore, selectedAddress, bagsCount]);

    return (
        <div className="hacerpedido-layout">
            <aside className="stores-sidebar">
                <h3>Tiendas</h3>
                <p>Total tiendas: {stores.length}</p>

                {stores.map(store => (
                    <div
                        key={store.id}
                        className={`store-item ${selectedStore?.id === store.id ? "active" : ""}`}
                        onClick={() => setSelectedStore(store)}
                    >
                        <h5>{store.name}</h5>
                        <p>{store.street}, {store.city}</p>
                    </div>
                ))}
            </aside>

            <main className="pedido-main">
                <h1>Hacer Pedido</h1>

                <h4>Selecciona una dirección</h4>
                <div className="addresses-container">

                    {addresses.map(address => (
                        <div
                            key={address.id}
                            className={`address-card ${selectedAddress === address.id ? "active" : ""}`}
                            onClick={() => {
                                setSelectedAddress(address.id);
                                setUseNewAddress(false);
                            }}
                        >
                            <input
                                className="address-radio"
                                type="radio"
                                checked={selectedAddress === address.id}
                                onChange={() => { }}
                            />

                            <div className="address-text">
                                <span className="address-main">{address.street}</span>
                                <span className="address-secondary">{address.city}</span>
                            </div>
                        </div>
                    ))}

                    <div
                        className="new-address"
                        onClick={() => {
                            setUseNewAddress(true);
                            setSelectedAddress(null);
                        }}
                    >
                        + Añadir nueva dirección
                    </div>

                </div>

                <h4>Detalles del pedido</h4>

                <textarea
                    placeholder="Ej: 1 camiseta blanca talla M..."
                    value={orderDetails}
                    onChange={(e) => setOrderDetails(e.target.value)}
                />
                <div className="bags-container">
                    <h4 className="bags-title">Número de bolsas</h4>

                    <input
                        className="bags-input"
                        type="number"
                        min="1"
                        value={bagsCount}
                        onChange={(e) => setBagsCount(Number(e.target.value))}
                    />
                </div>

                <h4>Método de pago</h4>

                <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                >
                    <option value="">Selecciona método</option>
                    <option value="card">Tarjeta</option>
                    <option value="cash">Efectivo</option>
                </select>
            </main>

            <aside className="pedido-summary">
                <h3>Resumen</h3>

                <p><strong>Tienda:</strong> {selectedStore?.name || "No seleccionada"}</p>
                <p>
                    <strong>Dirección:</strong>{" "}
                    {selectedAddress
                        ? addresses.find(address => address.id === selectedAddress)?.street || "No seleccionada"
                        : useNewAddress
                            ? "Nueva dirección"
                            : "No seleccionada"}
                </p>
                <p><strong>Pago:</strong> {paymentMethod || "No seleccionado"}</p>

                <hr />

                <p>Distancia: {distanceKm.toFixed(2)} km</p>
                <p>Coste entrega: €{deliveryPrice.toFixed(2)}</p>
                <h4>Total: €{deliveryPrice.toFixed(2)}</h4>

                <button>
                    Confirmar Pedido
                </button>
            </aside>
        </div>
    );
};

export default HacerPedido;