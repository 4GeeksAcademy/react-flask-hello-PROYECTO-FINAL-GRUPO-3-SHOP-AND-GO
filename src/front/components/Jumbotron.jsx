import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";

export const Jumbotron = () => {

  const navigate = useNavigate();

  return (
    <div className="jumbotron-custom">

      {/*RIDERS DISPONIBLES AHORA */}
      {/* <div className="badge-disponible">
        <span className="dot-green"></span>
        Riders disponibles ahora
      </div> */}

      <div className="jumbotron-container">

        {/* Lado izquierdo - Texto y botones */}
        <div className="jumbotron-content">

          {/* TÍTULO */}
          <h1 className="jumbotron-title">
            Tu compra,<br />
            <span className="highlight">entregada</span><br />
            rápido
          </h1>

          {/* DESCRIPCIÓN */}
          <p className="jumbotron-text">
            Conectamos tu compra en tienda física con riders cercanos.
            Recibe tus productos en minutos, no en horas.
          </p>

          {/* BOTONES ACCION */}
          <div className="jumbotron-buttons">
            <Link to={localStorage.getItem("token") ? "/hacer-pedido" : "/register"} className="btn-primary-hero">
              Solicitar Entrega →
            </Link>
            <Link to="/Foriders" className="btn-secondary-hero">
              🚴 Soy Rider
            </Link>
          </div>

          {/* DATOS PROMEDIO */}
          <div className="jumbotron-stats">
            <div className="stat-item">
              <h3>15min</h3>
              <p>Tiempo promedio</p>
            </div>
            <div className="stat-item">
              <h3>500+</h3>
              <p>Riders activos</p>
            </div>
            <div className="stat-item">
              <h3>98%</h3>
              <p>Satisfacción</p>
            </div>
          </div>

        </div>

        {/* IMAGEN */}
        <div className="jumbotron-image">
          <img
            src="https://plus.unsplash.com/premium_photo-1661954429045-6ce747fdad2f?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            alt="Delivery rider"
          />
        </div>

      </div>
    </div>

  );
};

// https://unsplash.com/es para conseguir imagenes gratis
// antes de hacer el pr de esto tengo que mirar el .env que esté correctamente ingresado en el gitingore.
// https://www.youtube.com/watch?v=17UVejOw3zA