import { Link } from "react-router-dom";
import logoImg from "/workspaces/react-flask-hello-PROYECTO-FINAL-GRUPO-3-SHOP-AND-GO/src/front/assets/logo.png";


export const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-grid">

          {/* Brand */}
          <div className="footer-brand">
            <Link to="/" className="footer-logo-row">
              <img src={logoImg} alt="Shop&Go" className="footer-logo-img" />
              <span className="footer-logo-text">SHOP&GO</span>
            </Link>
            <p className="footer-description">
              Conectando compradores con riders para entregas ultrarrápidas.
            </p>
          </div>

          {/* Producto */}
          <div className="footer-column">
            <h3 className="footer-column-title">Producto</h3>
            <ul className="footer-links">
              <li><Link to="/Howorks">Cómo funciona</Link></li>
            </ul>
          </div>

          {/* Riders */}
          <div className="footer-column">
            <h3 className="footer-column-title">Riders</h3>
            <ul className="footer-links">
              <li><Link to="/Foriders">Conviértete en rider</Link></li>
            </ul>
          </div>

          {/* Soporte */}
          <div className="footer-column">
            <h3 className="footer-column-title">Soporte</h3>
            <ul className="footer-links">
              <li><Link to="/Help">Ayuda y contacto</Link></li>
            </ul>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="footer-bottom">
          <p className="footer-copyright">
            © 2026 SHOP&GO. Todos los derechos reservados.
          </p>
          <div className="footer-socials">
            <a href="#" aria-label="Facebook">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
              </svg>
            </a>
            <a href="#" aria-label="Twitter">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
              </svg>
            </a>
            <a href="#" aria-label="Instagram">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};