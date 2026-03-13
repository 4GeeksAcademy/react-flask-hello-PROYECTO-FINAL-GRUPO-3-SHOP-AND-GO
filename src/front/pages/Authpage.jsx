// Import necessary components from react-router-dom and other parts of the application.
import { Link } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";  // Custom hook for accessing the global state.
import { useNavigate } from "react-router-dom"
import { useState } from "react";


export const Authpage = () => {
    // Access the global state and dispatch function using the useGlobalReducer hook.
    //   const { store, dispatch } = useGlobalReducer()
    //   const navigate = useNavigate();

    const [newUser, setNewUser] = useState({
        email: "",
        password: "",
        confirmPassword: "", //esto como las webs normales que validan dobles webs...

    });

    const [showLogin, setShowLogin] = useState(true); //toggle para mostrar el login, si es falso manda a register

    //   para loguearse si ya tiene usuario ya que se hará en la misma pagina
    const [loginUser, setLoginUser] = useState({
        email: "",
        password: ""
    });

    //formulario para crear usuario, actualiza Register
    const handleChange = (e) => {
        setNewUser({
            ...newUser,
            [e.target.name]: e.target.value
        });
    };

    //formulario para el login, actualiza Login
    const handleLoginChange = (e) => {
        setLoginUser({
            ...loginUser,
            [e.target.name]: e.target.value
        });
    }

    const handleSubmit = (e) => {
        e.preventDefault()  //esto evita que se recargue la pagina y, mis datos puedan enviarse al backend y 
        //que tampoco se muestren en la URL
        //para validaciones
        if (!newUser.email || !newUser.password || !newUser.confirmPassword) {
            alert("All fields are required")
            return;
        }

        if (newUser.password !== newUser.confirmPassword) {
            alert("The passwords do not match");
            return;
        }

        //llamo a mi función en el BACKEND
        register({
            email: newUser.email,
            password: newUser.password
        }, navigate);
    };

    const handleLoginSubmit = (e) => {
        e.preventDefault();


        // Validaciones
        if (!loginUser.email || !loginUser.password) {
            alert("All fields are required");
            return;
        }

        //AQUI LLAMO A LA FUNCIÓN LOGIN DEL BACKEND, PONDRÉ SÓLO UNA PRUEBA
        console.log("login con:", loginUser);
        alert("Logueado! Email: " + loginUser.email);
        //pdte conectar el BACKEND
    };


    return (
        <div className="auth-page">

            {/* WRAPPER */}
            <div className="auth-wrapper">


                {/* Container que se desliza */}
                <div className={`auth-slider ${showLogin ? 'show-login' : 'show-register'}`}>

                    {/* PANEL IZQUIERDO TOGGLE- LOGIN */}
                    <div className="auth-panel login-panel">
                        <h1>INICIAR SESIÓN 🚀</h1>

                        <form onSubmit={handleLoginSubmit}>
                            <input
                                type="email"
                                name="email"
                                placeholder="Email"
                                value={loginUser.email}
                                onChange={handleLoginChange}
                            />

                            <input
                                type="password"
                                name="password"
                                placeholder="Contraseña"
                                value={loginUser.password}
                                onChange={handleLoginChange}
                            />

                            <button type="submit">INICIAR SESIÓN</button>
                        </form>

                        <p>
                            ¿No tienes cuenta?
                            <button type="button" onClick={() => setShowLogin(false)}>
                                Crea tu cuenta aquí
                            </button>
                        </p>
                    </div>

                    {/* PANEL DERECHO TOGGLE- REGISTER */}
                    <div className="auth-panel register-panel">
                        <h1>CREAR CUENTA 🚀</h1>

                        <form onSubmit={handleSubmit}>
                            <input
                                type="email"
                                name="email"
                                placeholder="Email"
                                value={newUser.email}
                                onChange={handleChange}
                            />

                            <input
                                type="password"
                                name="password"
                                placeholder="Contraseña"
                                value={newUser.password}
                                onChange={handleChange}
                            />

                            <input
                                type="password"
                                name="confirmPassword"
                                placeholder="Confirmar Contraseña"
                                value={newUser.confirmPassword}
                                onChange={handleChange}
                            />

                            <button type="submit">REGISTRARSE</button>
                        </form>

                        <p>
                            ¿Ya tienes cuenta?
                            <button type="button" onClick={() => setShowLogin(true)}>
                                Volver al Login
                            </button>
                        </p>
                    </div>

                </div>
            </div>
        </div>
    );
};

