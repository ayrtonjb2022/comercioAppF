import axios from "axios";

const API_URL = import.meta.env.VITE_BACKEND_URL;
// const API_URL = "http://localhost:4000/api"; usar para localmente

const api = axios.create({
    baseURL: API_URL,
});

api.interceptors.request.use(
    (config) => {
        const token = sessionStorage.getItem("token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    response => response,
    error => {
        if (error.response?.status === 401) {
            window.location.href = '/';
        }
        return Promise.reject(error);
    }
);

const manejoErrores = (error) => {
    if (error.response) {
        console.error("Error del servidor:", error.response.data);
    } else if (error.request) {
        console.warn("No se recibió respuesta del servidor.");
    } else {
        console.warn("Error al configurar la petición:", error.message);
    }
    return error.response || null;
};

export const postRegister = async (data) => {
    try {
        const response = await api.post('/auth/register', data, {
            headers: { "Content-Type": "application/json" },
        });
        return response;
    } catch (error) {
        return manejoErrores(error);
    }
};

export const postLogin = async (data) => {
    try {
        const response = await api.post('/auth/login', data, {
            headers: { "Content-Type": "application/json" },
        });
        sessionStorage.setItem("token", response.data.token);
        return response;
    } catch (error) {
        return manejoErrores(error);
    }
};
