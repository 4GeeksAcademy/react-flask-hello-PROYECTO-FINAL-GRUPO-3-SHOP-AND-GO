import React, { useEffect, useState } from "react";

export const Hacer_Pedido = () => {

    const [addresses, setAddresses] = useState([]);
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [useNewAddress, setUseNewAddress] = useState(false);

    const token = localStorage.getItem("token");

    useEffect(() => {
        fetch(process.env.BACKEND_URL + "/api/addresses", {
            method: "GET",
            headers: {
                "Authorization": "Bearer " + token,
                "Content-Type": "application/json"
            }
        })
        .then(res => res.json())
        .then(data => setAddresses(data))
        .catch(err => console.log(err));
    }, []);

    return (
        <div className="container">

            <h1>Hacer Pedido</h1>

            <h3>Selecciona una dirección</h3>

            {addresses.map(address => (
                <div key={address.id}>
                    <input
                        type="radio"
                        name="address"
                        value={address.id}
                        onChange={() => setSelectedAddress(address.id)}
                    />

                    {address.street}, {address.city}
                </div>
            ))}

            <div>
                <input
                    type="radio"
                    name="address"
                    onChange={() => setUseNewAddress(true)}
                />

                Añadir nueva dirección
            </div>

        </div>
    );
};
