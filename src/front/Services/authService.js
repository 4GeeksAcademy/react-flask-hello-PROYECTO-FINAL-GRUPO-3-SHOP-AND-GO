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

    // Guardar token
    localStorage.setItem("token", data.token);
    
    // Navegar a home
    navigate("/");
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

    // Guardar token
    localStorage.setItem("token", data.token);
    
    // Navegar a home
    navigate("/");
};

//========================================
//LOGOUT
//========================================
export const logout = () => {
    localStorage.removeItem("token");
};

//========================================
//GET TOKEN
//========================================
export const getToken = () => {
    return localStorage.getItem("token");
};
