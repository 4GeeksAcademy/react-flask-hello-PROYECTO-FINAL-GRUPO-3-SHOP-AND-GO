import { useEffect, useState } from "react";
import "../mispedidos.css";

export const MisPedidos = () => {
  const [orders, setOrders] = useState([]);

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
    <div className="container mt-4">
      <h2>Mis pedidos</h2>

      {orders.length === 0 ? (
        <p>No tienes pedidos aún</p>
      ) : (
        orders.map(order => (
          <div key={order.id} className="card mb-3 p-3">
            <p><strong>ID:</strong> {order.id}</p>
            <p><strong>Estado:</strong> {order.status}</p>
            <p><strong>Tienda:</strong> {order.store_id}</p>
            <p><strong>Dirección:</strong> {order.address_id}</p>
          </div>
        ))
      )}
    </div>
  );
};