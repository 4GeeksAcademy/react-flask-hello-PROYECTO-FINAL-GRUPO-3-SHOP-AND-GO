import { Link } from "react-router-dom";

export const Navbar = () => {

	return (
		<nav className="navbar navbar-expand-md navbar-custom">
			<div className="navbar-container">

				<div className="navbar-logo">
					<span>SHOP&GO</span>
				</div>

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
						<a className= "nav-link" href="/"> Inicio</a>
						<a className="nav-link" href="/Howorks"> Cómo funciona</a>
						<a className="nav-link" href="/Foriders"> Para Riders</a>
						<a className="nav-link" href="/Stores"> Tiendas</a>
						<a className="nav-link" href="/Help"> Ayuda </a>
						<a className="nav-link" href="/login">Iniciar sesión</a>
						{/* <a className="nav-link" href="/profile">Mi Perfil</a> esto queda pdte ver si va acá*/}
						<a className="btn-register" href="/register">Registrarse</a>
					</div>
				</div>

			</div>
		</nav>
	);
};