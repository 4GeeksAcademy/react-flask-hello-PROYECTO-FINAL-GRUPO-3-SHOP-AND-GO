import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { getToken, getRole } from "../Services/authService";

export const PrivateRoute = ({ children, allowedRoles }) => {
    const [checking, setChecking] = useState(true);
    const token = getToken();
    const role = getRole();

    useEffect(() => {
        setChecking(false);
    }, []);

    if (checking) {
        return null;
    }

    if (!token) {
        return <Navigate to="/Login" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(role)) {
        return <Navigate to="/" replace />;
    }

    return children;
}