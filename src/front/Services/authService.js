const API_URL = import.meta.env.VITE_BACKEND_URL;

//========================================
//REGISTER
//========================================
export const register = async (newUser, navigate) => {
    const response = await fetch(`${API_URL}/api/register`, {
        method: "POST",
        body: JSON.stringify(newUser),
        headers: {
            "Content-Type": "application/json"
        }
    });

    const data = await response.json();

    if (!response.ok) {
        alert(data.error);
        return;
    }

    localStorage.setItem("token", data.token);
    navigate("/login");
};

//========================================
//LOGIN
//========================================
export const login = async (user, navigate) => {
    const response = await fetch(`${API_URL}/api/login`, {
        method: "POST",
        body: JSON.stringify(user),
        headers: {
            "Content-Type": "application/json"
        }
    });

    const data = await response.json();

    if (!response.ok) {
        alert(data.error);
        return;
    }

    // Guardamos token y role del formulario
    localStorage.setItem("token", data.token);
    localStorage.setItem("role", user.role);

    // Navegamos según el role seleccionado
    if (user.role === "driver") {
        navigate("/rider-profile"); //// //========================================
        // URGENTE EDITARRR!!
    } else {
        navigate("/Profileuser");
    }
};

//========================================
//LOGOUT
//========================================
export const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
};

//========================================
//GET TOKEN
//========================================
export const getToken = () => {
    return localStorage.getItem("token");
};

//========================================
//GET ROLE
//========================================
export const getRole = () => {
    return localStorage.getItem("role");
};

//========================================
//GET PROFILE
//========================================
export const getProfile = async () => {
    const token = getToken();

    if (!token) {
        throw new Error("No token found");
    }

    const response = await fetch(`${API_URL}/api/profile`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        }
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || "Error al obtener perfil");
    }

    return data;
};