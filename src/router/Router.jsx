import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

import PrivateRoute from './PrivateRouter'; // Asegúrate que el nombre del archivo esté bien escrito (mayúsculas/minúsculas)
import Login from "../pages/LoginRegister";
import Dashboard from "../pages/Dashboard";
// import Footer from '../components/Footer'; // Lo tienes importado pero no se usa

const RouterAP = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem("token"));

    useEffect(() => {
        const checkAuth = () => {
            setIsAuthenticated(!!localStorage.getItem("token"));
        };

        // Escucha cambios en otras pestañas (como cerrar sesión)
        window.addEventListener("storage", checkAuth);

        return () => {
            window.removeEventListener("storage", checkAuth);
        };
    }, []);

    return (
        <Router>
            <Routes>
                <Route path="/" element={<Login />} />

                {/* Rutas Privadas */}
                <Route
                    path="/dashboard/*"
                    element={
                        <PrivateRoute isAuthenticated={isAuthenticated}>
                            <Dashboard />
                        </PrivateRoute>
                    }
                />

                {/* Ruta por defecto si no se encuentra coincidencia */}
                <Route
                    path="*"
                    element={<Navigate to={isAuthenticated ? "/dashboard" : "/"} replace />}
                />
            </Routes>
        </Router>
    );
};

export default RouterAP;
