const API_URL = import.meta.env.VITE_BACKEND_URL;

//========================================
//REGISTER
//========================================
export const register = async (newUser) => {
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
        return false;
    }

    return true;
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
        navigate("/driver/profile");
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
//GET ORDERS
//========================================
export const getOrders = async () => {
    const token = localStorage.getItem("token");

    const response = await fetch(import.meta.env.VITE_BACKEND_URL + "/api/orders", {
        method: "GET",
        headers: {
            "Authorization": "Bearer " + token,
            "Content-Type": "application/json"
        }
    });

    const data = await response.json();
    return data;
};

//========================================
//GET USERS (admin)
//========================================
export const getUsers = async () => {
    const token = localStorage.getItem("token");

    const response = await fetch(import.meta.env.VITE_BACKEND_URL + "/api/users", {
        method: "GET",
        headers: {
            "Authorization": "Bearer " + token,
            "Content-Type": "application/json"
        }
    });

    const data = await response.json();
    return data;
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

export const getAddresses = async () => {
    const token = localStorage.getItem("token");

    const response = await fetch(import.meta.env.VITE_BACKEND_URL + "/api/addresses", {
        method: "GET",
        headers: {
            "Authorization": "Bearer " + token,
            "Content-Type": "application/json"
        }
    });

    const data = await response.json();
    return data;
};

export const createAddress = async (addressData) => {
    const token = localStorage.getItem("token");

    const response = await fetch(import.meta.env.VITE_BACKEND_URL + "/api/addresses", {
        method: "POST",
        headers: {
            "Authorization": "Bearer " + token,
            "Content-Type": "application/json"
        },
        body: JSON.stringify(addressData)
    });

    const data = await response.json();
    return { response, data };
};

export const getPaymentMethods = async () => {
    const token = localStorage.getItem("token");

    const response = await fetch(import.meta.env.VITE_BACKEND_URL + "/api/payment-methods", {
        method: "GET",
        headers: {
            "Authorization": "Bearer " + token,
            "Content-Type": "application/json"
        }
    });

    const data = await response.json();
    return data;
};

export const createPaymentMethod = async (paymentMethodData) => {
    const token = localStorage.getItem("token");

    const response = await fetch(import.meta.env.VITE_BACKEND_URL + "/api/payment-method", {
        method: "POST",
        headers: {
            "Authorization": "Bearer " + token,
            "Content-Type": "application/json"
        },
        body: JSON.stringify(paymentMethodData)
    });

    const data = await response.json();
    return { response, data };
};

export const createOrder = async (orderData) => {
    const token = localStorage.getItem("token");

    const response = await fetch(import.meta.env.VITE_BACKEND_URL + "/api/orders", {
        method: "POST",
        headers: {
            "Authorization": "Bearer " + token,
            "Content-Type": "application/json"
        },
        body: JSON.stringify(orderData)
    });

    const data = await response.json();
    return { response, data };
};