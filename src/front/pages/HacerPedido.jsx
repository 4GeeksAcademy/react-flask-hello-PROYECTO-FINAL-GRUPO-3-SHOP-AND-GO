import { useEffect, useState } from "react";
import "../hacerpedido.css";
import { getAddresses, createAddress, getPaymentMethods, createPaymentMethod } from "../Services/authService";


const HacerPedido = () => {
    const [addresses, setAddresses] = useState([]);
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [useNewAddress, setUseNewAddress] = useState(false);

    const [stores, setStores] = useState([]);
    const [selectedStore, setSelectedStore] = useState(null);

    const [paymentMethods, setPaymentMethods] = useState([]);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);

    const [orderDetails, setOrderDetails] = useState("");

    const [bagsCount, setBagsCount] = useState(1);
    const [distanceKm, setDistanceKm] = useState(0);
    const [deliveryPrice, setDeliveryPrice] = useState(0);

    const [showNewAddressForm, setShowNewAddressForm] = useState(false);
    const [newAddress, setNewAddress] = useState({
        street: "",
        city: "",
        postal_code: "",
        label: ""
    });

    const [showNewPaymentMethodForm, setShowNewPaymentMethodForm] = useState(false);
    const [newPaymentMethod, setNewPaymentMethod] = useState({
        provider: "stripe",
        stripe_payment_method_id: "",
        brand: "",
        last4: "",
        exp_month: "",
        exp_year: "",
        is_default: false
    });

    const handleCreateAddress = async () => {
        try {
            const { response, data } = await createAddress(newAddress);

            if (!response.ok) {
                console.log("Error:", data);
                alert(data.error || "Error al crear dirección");
                return;
            }

            // refrescar direcciones
            const updatedAddresses = await getAddresses();

            if (Array.isArray(updatedAddresses)) {
                setAddresses(updatedAddresses);
            }

            // seleccionar la nueva
            if (data.address?.id) {
                setSelectedAddress(data.address.id);
            }

            // resetear form
            setNewAddress({
                street: "",
                city: "",
                postal_code: "",
                label: ""
            });

            setShowNewAddressForm(false);
            setUseNewAddress(false);

        } catch (error) {
            console.log(error);
            alert("Error creando dirección");
        }
    };

    const handleCreatePaymentMethod = async () => {
        try {
            const payload = {
                ...newPaymentMethod,
                stripe_payment_method_id:
                    newPaymentMethod.stripe_payment_method_id || "pm_test_" + Date.now()
            };

            const { response, data } = await createPaymentMethod(payload);

            if (!response.ok) {
                console.log("Error:", data);
                alert(data.error || "Error al crear método de pago");
                return;
            }

            const updatedPaymentMethods = await getPaymentMethods();

            if (Array.isArray(updatedPaymentMethods)) {
                setPaymentMethods(updatedPaymentMethods);
            }

            if (data.payment_method?.id) {
                setSelectedPaymentMethod(data.payment_method.id);
            }

            setNewPaymentMethod({
                provider: "stripe",
                stripe_payment_method_id: "",
                brand: "",
                last4: "",
                exp_month: "",
                exp_year: "",
                is_default: false
            });

            setShowNewPaymentMethodForm(false);

        } catch (error) {
            console.log(error);
            alert("Error creando método de pago");
        }
    };

    useEffect(() => {
        const loadAddresses = async () => {
            const data = await getAddresses();

            if (Array.isArray(data)) {
                setAddresses(data);
            } else {
                setAddresses([]);
                console.log("Error addresses:", data);
            }
        };

        loadAddresses();

        const token = localStorage.getItem("token");


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


        const loadPaymentMethods = async () => {
            const data = await getPaymentMethods();

            if (Array.isArray(data)) {
                setPaymentMethods(data);

                const defaultMethod = data.find(pm => pm.is_default);
                if (defaultMethod) {
                    setSelectedPaymentMethod(defaultMethod.id);
                } else if (data.length > 0) {
                    setSelectedPaymentMethod(data[0].id);
                }
            } else {
                setPaymentMethods([]);
                console.log("Error payment methods:", data);
            }
        };

        loadPaymentMethods();
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

    const selectedAddressData = addresses.find(address => address.id === selectedAddress);
    const selectedPaymentMethodData = paymentMethods.find(pm => pm.id === selectedPaymentMethod);

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
                            setShowNewAddressForm(true);
                            setUseNewAddress(true);
                            setSelectedAddress(null);
                        }}
                    >
                        + Añadir nueva dirección
                    </div>
                    {showNewAddressForm && (
                        <form className="new-item-form">
                            <input
                                type="text"
                                placeholder="Calle"
                                value={newAddress.street}
                                onChange={(e) =>
                                    setNewAddress({ ...newAddress, street: e.target.value })
                                }
                            />

                            <input
                                type="text"
                                placeholder="Ciudad"
                                value={newAddress.city}
                                onChange={(e) =>
                                    setNewAddress({ ...newAddress, city: e.target.value })
                                }
                            />

                            <input
                                type="text"
                                placeholder="Código postal"
                                value={newAddress.postal_code}
                                onChange={(e) =>
                                    setNewAddress({ ...newAddress, postal_code: e.target.value })
                                }
                            />

                            <input
                                type="text"
                                placeholder="Etiqueta (Casa, Trabajo...)"
                                value={newAddress.label}
                                onChange={(e) =>
                                    setNewAddress({ ...newAddress, label: e.target.value })
                                }
                            />

                            <div className="new-item-form-actions">
                                <button type="button" onClick={handleCreateAddress}>
                                    Guardar dirección
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowNewAddressForm(false);
                                        setUseNewAddress(false);
                                    }}
                                >
                                    Cancelar
                                </button>
                            </div>
                        </form>
                    )}
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

                <div className="payment-methods-container">
                    {paymentMethods.length > 0 ? (
                        paymentMethods.map(pm => (
                            <div
                                key={pm.id}
                                className={`payment-method-card ${selectedPaymentMethod === pm.id ? "active" : ""}`}
                                onClick={() => setSelectedPaymentMethod(pm.id)}
                            >
                                <input
                                    className="payment-method-radio"
                                    type="radio"
                                    checked={selectedPaymentMethod === pm.id}
                                    onChange={() => { }}
                                />

                                <div className="payment-method-text">
                                    <span className="payment-method-main">
                                        {(pm.brand || "Tarjeta").toUpperCase()} **** {pm.last4}
                                    </span>
                                    <span className="payment-method-secondary">
                                        Expira {pm.exp_month}/{pm.exp_year}
                                        {pm.is_default ? " · Predeterminada" : ""}
                                    </span>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="no-payment-methods">No tienes métodos de pago guardados.</p>
                    )}

                    <div
                        className="new-payment-method"
                        onClick={() => setShowNewPaymentMethodForm(true)}
                    >
                        + Añadir nuevo método de pago
                    </div>
                    {showNewPaymentMethodForm && (
                        <form className="new-item-form">
                            <input
                                type="text"
                                placeholder="Marca (visa, mastercard...)"
                                value={newPaymentMethod.brand}
                                onChange={(e) =>
                                    setNewPaymentMethod({ ...newPaymentMethod, brand: e.target.value })
                                }
                            />

                            <input
                                type="text"
                                placeholder="Últimos 4 dígitos"
                                maxLength="4"
                                value={newPaymentMethod.last4}
                                onChange={(e) =>
                                    setNewPaymentMethod({ ...newPaymentMethod, last4: e.target.value })
                                }
                            />

                            <input
                                type="number"
                                placeholder="Mes expiración (MM)"
                                value={newPaymentMethod.exp_month}
                                onChange={(e) =>
                                    setNewPaymentMethod({ ...newPaymentMethod, exp_month: e.target.value })
                                }
                            />

                            <input
                                type="number"
                                placeholder="Año expiración (YYYY)"
                                value={newPaymentMethod.exp_year}
                                onChange={(e) =>
                                    setNewPaymentMethod({ ...newPaymentMethod, exp_year: e.target.value })
                                }
                            />

                            <div className="new-item-form-actions">
                                <button type="button" onClick={handleCreatePaymentMethod}>
                                    Guardar método
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setShowNewPaymentMethodForm(false)}
                                >
                                    Cancelar
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </main>

            <aside className="pedido-summary">
                <h3>Resumen</h3>

                <p><strong>Tienda:</strong> {selectedStore?.name || "No seleccionada"}</p>

                <p>
                    <strong>Dirección:</strong>{" "}
                    {selectedAddressData
                        ? selectedAddressData.street
                        : useNewAddress
                            ? "Nueva dirección"
                            : "No seleccionada"}
                </p>

                <p>
                    <strong>Pago:</strong>{" "}
                    {selectedPaymentMethodData
                        ? `${(selectedPaymentMethodData.brand || "Tarjeta").toUpperCase()} **** ${selectedPaymentMethodData.last4}`
                        : "No seleccionado"}
                </p>

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