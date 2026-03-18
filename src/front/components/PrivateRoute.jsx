import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { getToken } from "../Services/authService";

export const PrivateRoute = ({ children }) => {
    const [checking, setChecking] = useState(true);
    const token = getToken();

    useEffect(() => {
        setChecking(false);
    }, []);

    if (checking) {
        return null;
    }

    if (!token) {
        return <Navigate to="/Login" replace />;
    }

    return children;
}