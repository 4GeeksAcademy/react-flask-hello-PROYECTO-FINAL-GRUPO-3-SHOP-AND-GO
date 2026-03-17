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

    return (
        <div className="hacerpedido-layout">
            <aside className="stores-sidebar">
                <h3>Tiendas</h3>

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

                {addresses.map(address => (
                    <div key={address.id}>
                        <input
                            type="radio"
                            name="address"
                            checked={selectedAddress === address.id}
                            onChange={() => {
                                setSelectedAddress(address.id);
                                setUseNewAddress(false);
                            }}
                        />
                        {" "}
                        {address.street}, {address.city}
                    </div>
                ))}

                <div>
                    <input
                        type="radio"
                        name="address"
                        checked={useNewAddress}
                        onChange={() => {
                            setUseNewAddress(true);
                            setSelectedAddress(null);
                        }}
                    />
                    {" "}
                    Añadir nueva dirección
                </div>

                <h4>Detalles del pedido</h4>

                <textarea
                    placeholder="Ej: 1 camiseta blanca talla M..."
                    value={orderDetails}
                    onChange={(e) => setOrderDetails(e.target.value)}
                />

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

                <p>Coste entrega: €12.50</p>
                <p>Tarifa servicio: €2.50</p>
                <h4>Total: €15.00</h4>

                <button>
                    Confirmar Pedido
                </button>
            </aside>
        </div>
    );
};

export default HacerPedido;