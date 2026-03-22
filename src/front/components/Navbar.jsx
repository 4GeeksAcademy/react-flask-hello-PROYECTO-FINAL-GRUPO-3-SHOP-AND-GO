import { Link } from "react-router-dom";
import { getToken, logout } from "../Services/authService";
import { useNavigate } from "react-router-dom";
import logoImg from "/workspaces/react-flask-hello-PROYECTO-FINAL-GRUPO-3-SHOP-AND-GO/src/front/assets/logo.png";

export const Navbar = () => {
	const token = getToken();
	const navigate = useNavigate();

	const handleLogout = () => {
		logout();
		navigate("/Login");
	};

	return (
		<nav className="navbar navbar-expand-md navbar-custom">
			<div className="navbar-container">

				<Link to="/" className="navbar-logo">
					<img src={logoImg} alt="Shop&Go" className="navbar-logo-img" />
					<span>SHOP&GO</span>
				</Link>

				<button
					className="navbar-toggler"
					type="button"
					data-bs-toggle="collapse"
					data-bs-target="#navbarNavAltMarkup"
					aria-controls="navbarNavAltMarkup"
					aria-expanded="false"
					aria-label="Toggle navigation"
				>
					<span className="navbar-toggler-icon"></span>
				</button>

				<div className="collapse navbar-collapse" id="navbarNavAltMarkup">
					<div className="navbar-nav navbar-links">
						<Link className="nav-link" to="/">Inicio</Link>
						<Link className="nav-link" to="/Howorks">Cómo funciona</Link>
						<Link className="nav-link" to="/Foriders">Para Riders</Link>
						<a className="nav-link" href="/Stores">Tiendas</a>
						<Link className="nav-link" to="/Help">Ayuda</Link>

						{token ? (
							<>
								{localStorage.getItem("role") === "admin" ? (
									<Link className="nav-link" to="/Profileuser">Panel Admin</Link>
								) : (
									<Link className="nav-link" to={localStorage.getItem("role") === "driver" ? "/driver/profile" : "/Profileuser"}>Mi Perfil</Link>
								)}
								<button className="btn-register" onClick={handleLogout}>Cerrar sesión</button>
							</>
						) : (
							<>
								<Link className="nav-link" to="/Login">Iniciar sesión</Link>
								<Link className="btn-register" to="/register">Registrarse</Link>
							</>
						)}
					</div>
				</div>

			</div>
		</nav>
	);
};