import axios from "axios";

const API_URL = import.meta.env.VITE_BACKEND_URL;

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


export const getProductosall = async () => {
     try {
        const response = await api.get(`/productos`,
            {
                headers: {
                  Authorization: `Bearer ${sessionStorage.getItem("token")}`, 
                },
              }
        );

        return response;
    } catch (error) {
        return manejoErrores(error);
    }
}
export const getCajas = async () => {
     try {
        const response = await api.get(`/cajas`,
            {
                headers: {
                  Authorization: `Bearer ${sessionStorage.getItem("token")}`, 
                },
              }
        );

        return response.data;
    } catch (error) {
        return manejoErrores(error);
    }
}

export const getDataUs = async () => {
     try {
        const response = await api.get(`/user`,
            {
                headers: {
                  Authorization: `Bearer ${sessionStorage.getItem("token")}`, 
                },
              }
        );

        return response.data;
    } catch (error) {
        return manejoErrores(error);
    }
}
export const getMovimiento = async () => {
     try {
        const response = await api.get(`/movimientoall`,
            {
                headers: {
                  Authorization: `Bearer ${sessionStorage.getItem("token")}`, 
                },
              }
        );

        return response;
    } catch (error) {
        return manejoErrores(error);
    }
}
export const getDetalleVentas = async () => {
     try {
        const response = await api.get(`/ventasAll`,
            {
                headers: {
                  Authorization: `Bearer ${sessionStorage.getItem("token")}`, 
                },
              }
        );

        return response.data;
    } catch (error) {
        return manejoErrores(error);
    }
}
export const postProductos = async (data) => {
     try {
        const response = await api.post(`/productos`,data,
            {
                headers: {
                  Authorization: `Bearer ${sessionStorage.getItem("token")}`, 
                },
              }
        );

        return response;
    } catch (error) {
        return manejoErrores(error);
    }
}
export const postCaja = async (data) => {
     try {
        const response = await api.post(`/cajas`,data,
            {
                headers: {
                  Authorization: `Bearer ${sessionStorage.getItem("token")}`, 
                },
              }
        );

        return response;
    } catch (error) {
        return manejoErrores(error);
    }
}
export const postVendas = async (data) => {
     try {
        const response = await api.post(`/ventas`,data,
            {
                headers: {
                  Authorization: `Bearer ${sessionStorage.getItem("token")}`, 
                },
              }
        );

        return response;
    } catch (error) {
        return manejoErrores(error);
    }
}
export const postMovimiento = async (data) => {
     try {
        const response = await api.post(`/movimiento`,data,
            {
                headers: {
                  Authorization: `Bearer ${sessionStorage.getItem("token")}`, 
                },
              }
        );

        return response;
    } catch (error) {
        return manejoErrores(error);
    }
}
export const putProductos = async (data) => {
     try {
        const response = await api.put(`/productos/${data.id}`,data,
            {
                headers: {
                  Authorization: `Bearer ${sessionStorage.getItem("token")}`, 
                },
              }
        );

        return response;
    } catch (error) {
        return manejoErrores(error);
    }
}
export const putCajas = async (data) => {
     try {
        const response = await api.put(`/cajas/${data.id}`,data,
            {
                headers: {
                  Authorization: `Bearer ${sessionStorage.getItem("token")}`, 
                },
              }
        );

        return response;
    } catch (error) {
        return manejoErrores(error);
    }
}
export const putUserData = async (data) => {
     try {
        const response = await api.put(`/user`,data,
            {
                headers: {
                  Authorization: `Bearer ${sessionStorage.getItem("token")}`, 
                },
              }
        );

        return response;
    } catch (error) {
        return manejoErrores(error);
    }
}
export const deleteProductos = async (id) => {
     try {
        const response = await api.delete(`/productos/${id}`,
            {
                headers: {
                  Authorization: `Bearer ${sessionStorage.getItem("token")}`, 
                },
              }
        );

        return response;
    } catch (error) {
        return manejoErrores(error);
    }
}