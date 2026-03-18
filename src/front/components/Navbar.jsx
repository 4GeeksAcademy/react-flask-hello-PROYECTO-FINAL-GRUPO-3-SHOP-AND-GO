import { Link } from "react-router-dom";
import { getToken, logout } from "../Services/authService";
import { useNavigate } from "react-router-dom";

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
					<div className="navbar-logo-icon">
						<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
							<circle cx="18.5" cy="17.5" r="3.5"/>
							<circle cx="5.5" cy="17.5" r="3.5"/>
							<circle cx="15" cy="5" r="1"/>
							<path d="M12 17.5V14l-3-3 4-3 2 3h2"/>
						</svg>
					</div>
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
						<a className="nav-link" href="#">Tiendas</a>
						<Link className="nav-link" to="/Help">Ayuda</Link>

						{token ? (
							<>
								<Link className="nav-link" to="/Profileuser">Mi Perfil</Link>
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