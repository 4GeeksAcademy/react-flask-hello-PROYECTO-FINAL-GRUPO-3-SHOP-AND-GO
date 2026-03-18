import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { register, login } from "../Services/authService";

export const Authpage = () => {
    const navigate = useNavigate();
 
    const [showLogin, setShowLogin] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [showToast, setShowToast] = useState(false);
 
    const [newUser, setNewUser] = useState({
        name: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
        role: "user"
    });
 
    const [loginUser, setLoginUser] = useState({
        email: "",
        password: "",
        role: "user"
    });
 
    const handleChange = (e) => {
        setNewUser({ ...newUser, [e.target.name]: e.target.value });
    };
 
    const handleLoginChange = (e) => {
        setLoginUser({ ...loginUser, [e.target.name]: e.target.value });
    };
 
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newUser.name || !newUser.email || !newUser.phone || !newUser.password || !newUser.confirmPassword) {
            alert("Todos los campos son obligatorios");
            return;
        }
        if (newUser.password !== newUser.confirmPassword) {
            alert("Las contraseñas no coinciden");
            return;
        }
        const success = await register(newUser);
        if (success) {
            setShowToast(true);
            setTimeout(() => {
                setShowToast(false);
                setShowLogin(true);
            }, 2000);
        }
    };
 
    const handleLoginSubmit = (e) => {
        e.preventDefault();
        if (!loginUser.email || !loginUser.password) {
            alert("Todos los campos son obligatorios");
            return;
        }
        login(loginUser, navigate);
    };
 
    return (
        <div className="auth-page">
 
            <div className="auth-wrapper">
                <div className={`auth-slider ${showLogin ? "show-login" : "show-register"}`}>
 
                    {/* ================================
                        PANEL LOGIN
                    ================================ */}
                    <div className="auth-panel login-panel">
 
                        <div className="auth-logo">
                            <div className="auth-logo-icon">🚴</div>
                        </div>
                        <h1>INICIAR SESIÓN 🚀</h1>
                        <p className="auth-subtitle">Bienvenido de nuevo</p>
 
                        {/* ROLE SELECTOR LOGIN */}
                        <div className="role-selector">
                            <button
                                type="button"
                                className={`role-btn ${loginUser.role === "user" ? "active" : ""}`}
                                onClick={() => setLoginUser({ ...loginUser, role: "user" })}
                            >
                                {loginUser.role === "user" && <span className="role-check">✓</span>}
                                <span className="role-icon">🛍️</span>
                                <span className="role-title">Soy Usuario</span>
                                <span className="role-desc">Quiero recibir entregas</span>
                            </button>
                            <button
                                type="button"
                                className={`role-btn ${loginUser.role === "driver" ? "active" : ""}`}
                                onClick={() => setLoginUser({ ...loginUser, role: "driver" })}
                            >
                                {loginUser.role === "driver" && <span className="role-check">✓</span>}
                                <span className="role-icon">🚴</span>
                                <span className="role-title">Soy Rider</span>
                                <span className="role-desc">Quiero hacer entregas</span>
                            </button>
                        </div>
 
                        <form onSubmit={handleLoginSubmit}>
                            <div className="input-group">
                                <label>Correo Electrónico</label>
                                <div className="input-wrapper">
                                    <span className="input-icon">✉️</span>
                                    <input
                                        type="email"
                                        name="email"
                                        placeholder="tu@email.com"
                                        value={loginUser.email}
                                        onChange={handleLoginChange}
                                    />
                                </div>
                            </div>
 
                            <div className="input-group">
                                <label>Contraseña</label>
                                <div className="input-wrapper">
                                    <span className="input-icon">🔒</span>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        placeholder="••••••••"
                                        value={loginUser.password}
                                        onChange={handleLoginChange}
                                    />
                                    <button type="button" className="toggle-password" onClick={() => setShowPassword(!showPassword)}>
                                        {showPassword ? "🙈" : "👁️"}
                                    </button>
                                </div>
                            </div>
 
                            <button type="submit">INICIAR SESIÓN</button>
                        </form>
 
                        <p className="auth-toggle-text">
                            ¿No tienes cuenta?
                            <button type="button" onClick={() => setShowLogin(false)}>
                                Crea tu cuenta aquí
                            </button>
                        </p>
                    </div>
 
                    {/* ================================
                        PANEL REGISTER
                    ================================ */}
                    <div className="auth-panel register-panel">
 
                        <div className="auth-logo">
                            <div className="auth-logo-icon">🚴</div>
                        </div>
                        <h1>CREAR CUENTA 🚀</h1>
                        <p className="auth-subtitle">Únete a SHOP&GO</p>
 
                        {/* ROLE SELECTOR REGISTER */}
                        <div className="role-selector">
                            <button
                                type="button"
                                className={`role-btn ${newUser.role === "user" ? "active" : ""}`}
                                onClick={() => setNewUser({ ...newUser, role: "user" })}
                            >
                                {newUser.role === "user" && <span className="role-check">✓</span>}
                                <span className="role-icon">🛍️</span>
                                <span className="role-title">Soy Usuario</span>
                                <span className="role-desc">Quiero recibir entregas</span>
                            </button>
                            <button
                                type="button"
                                className={`role-btn ${newUser.role === "driver" ? "active" : ""}`}
                                onClick={() => setNewUser({ ...newUser, role: "driver" })}
                            >
                                {newUser.role === "driver" && <span className="role-check">✓</span>}
                                <span className="role-icon">🚴</span>
                                <span className="role-title">Soy Rider</span>
                                <span className="role-desc">Quiero hacer entregas</span>
                            </button>
                        </div>
 
                        <form onSubmit={handleSubmit}>
                            <div className="input-group">
                                <label>Nombre Completo</label>
                                <div className="input-wrapper">
                                    <span className="input-icon">👤</span>
                                    <input
                                        type="text"
                                        name="name"
                                        placeholder="Juan Pérez"
                                        value={newUser.name}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
 
                            <div className="input-grid">
                                <div className="input-group">
                                    <label>Correo Electrónico</label>
                                    <div className="input-wrapper">
                                        <span className="input-icon">✉️</span>
                                        <input
                                            type="email"
                                            name="email"
                                            placeholder="tu@email.com"
                                            value={newUser.email}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>
                                <div className="input-group">
                                    <label>Teléfono</label>
                                    <div className="input-wrapper">
                                        <span className="input-icon">📱</span>
                                        <input
                                            type="tel"
                                            name="phone"
                                            placeholder="+34 612 345 678"
                                            value={newUser.phone}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>
                            </div>
 
                            <div className="input-grid">
                                <div className="input-group">
                                    <label>Contraseña</label>
                                    <div className="input-wrapper">
                                        <span className="input-icon">🔒</span>
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            name="password"
                                            placeholder="••••••••"
                                            value={newUser.password}
                                            onChange={handleChange}
                                        />
                                        <button type="button" className="toggle-password" onClick={() => setShowPassword(!showPassword)}>
                                            {showPassword ? "🙈" : "👁️"}
                                        </button>
                                    </div>
                                </div>
                                <div className="input-group">
                                    <label>Confirmar Contraseña</label>
                                    <div className="input-wrapper">
                                        <span className="input-icon">🔒</span>
                                        <input
                                            type={showConfirmPassword ? "text" : "password"}
                                            name="confirmPassword"
                                            placeholder="••••••••"
                                            value={newUser.confirmPassword}
                                            onChange={handleChange}
                                        />
                                        <button type="button" className="toggle-password" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                                            {showConfirmPassword ? "🙈" : "👁️"}
                                        </button>
                                    </div>
                                </div>
                            </div>
 
                            <div className="terms-box">
                                <input type="checkbox" id="terms" required />
                                <label htmlFor="terms">
                                    Acepto los <a href="#">Términos y Condiciones</a> y la <a href="#">Política de Privacidad</a>
                                </label>
                            </div>
 
                            <button type="submit">CREAR CUENTA</button>
                        </form>
 
                        <p className="auth-toggle-text">
                            ¿Ya tienes cuenta?
                            <button type="button" onClick={() => setShowLogin(true)}>
                                Volver al Login
                            </button>
                        </p>
                    </div>
 
                </div>
            </div>
 
            {/* Benefits */}
            <div className="auth-benefits">
                <div className="benefit-item">
                    <span>📦</span>
                    <span>Entregas rápidas</span>
                </div>
                <div className="benefit-item">
                    <span>🔒</span>
                    <span>100% Seguro</span>
                </div>
                <div className="benefit-item">
                    <span>⭐</span>
                    <span>Mejor calidad</span>
                </div>
            </div>
 
            {/* Toast de éxito */}
            {showToast && (
                <div className="auth-toast">
                    ✅ ¡Cuenta creada! Redirigiendo al login...
                </div>
            )}
        </div>
    );
};
