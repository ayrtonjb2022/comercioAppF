import './App.css'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

import PrivateRoute from './components/PrivateRouter'; //
import Login from "./pages/LoginRegister";
import Dashboard from "./pages/Dashboard";
import Home from  "./pages/Home";
export default function App() {

  const [isAuthenticated, setIsAuthenticated] = useState(!!sessionStorage.getItem("token"));

  useEffect(() => {
    const checkAuth = () => {
      setIsAuthenticated(!!sessionStorage.getItem("token"));
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
        <Route path="/login" element={<Login />} />


        <Route path="/" element={<Home />} />


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

