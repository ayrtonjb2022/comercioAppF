import axios from "axios";

const API_URL = import.meta.env.VITE_BACKEND_URL;
// const API_URL = "http://localhost:4000/api"; //usar para localmente

const api = axios.create({
    baseURL: API_URL,
    timeout: 30000, // Aumentar timeout a 30 segundos
});

// Interceptor de request
api.interceptors.request.use(
    (config) => {
        const token = sessionStorage.getItem("token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        
        // Para operaciones que requieren BD, verificar inactividad
        const requiresDb = ['/productos', '/cajas', '/movimiento', '/ventas', '/user'].some(path => 
            config.url?.includes(path)
        );
        
        if (requiresDb) {
            const lastHealthCheck = localStorage.getItem('lastHealthCheck');
            const now = Date.now();
            
            // Si pasaron más de 30 minutos desde el último check
            if (!lastHealthCheck || (now - lastHealthCheck > 30 * 60 * 1000)) {
                // Precalentar conexión con un ping rápido (no bloqueante)
                fetch(`${API_URL}/health`, { 
                    method: 'GET',
                    headers: { 'Authorization': `Bearer ${token}` }
                }).catch(() => {
                    console.log('Precalentando conexión al backend...');
                });
                localStorage.setItem('lastHealthCheck', now);
            }
        }
        
        return config;
    },
    (error) => Promise.reject(error)
);

// Interceptor de response con reintentos
api.interceptors.response.use(
    response => response,
    async error => {
        const originalRequest = error.config;
        
        // Si es error de conexión/timeout y no hemos reintentado
        if ((!error.response || error.code === 'ECONNABORTED') && 
            !originalRequest._retry && 
            originalRequest.url !== '/health') {
            
            originalRequest._retry = true;
            console.log('Reintentando conexión después de timeout...');
            
            // Esperar 1.5 segundos y reintentar
            await new Promise(resolve => setTimeout(resolve, 1500));
            return api(originalRequest);
        }
        
        if (error.response?.status === 401) {
            window.location.href = '/';
        }
        
        return Promise.reject(error);
    }
);

// Función para iniciar health checks periódicos
const startHealthChecks = () => {
    // Solo en navegador
    if (typeof window === 'undefined') return;
    
    // Hacer check cada 4 minutos (menos que el idle timeout de BD)
    const healthCheckInterval = setInterval(async () => {
        // Solo si la pestaña está visible para no gastar recursos innecesarios
        if (document.visibilityState === 'visible') {
            try {
                const token = sessionStorage.getItem("token");
                await fetch(`${API_URL}/health`, {
                    method: 'GET',
                    headers: token ? { 'Authorization': `Bearer ${token}` } : {},
                    // Timeout corto, solo para mantener conexión
                    signal: AbortSignal.timeout(5000)
                });
                console.log('✅ Health check exitoso');
            } catch (error) {
                // Error silencioso, solo para mantener conexión
                console.log('🔄 Manteniendo conexión activa...');
            }
        }
    }, 4 * 60 * 1000); // 240000 ms = 4 minutos
    
    // Guardar el intervalo para poder limpiarlo si es necesario
    window._healthCheckInterval = healthCheckInterval;
};

// Función para monitorear actividad del usuario
const setupActivityWatcher = () => {
    let lastActivity = Date.now();
    const INACTIVITY_THRESHOLD = 30 * 60 * 1000; // 30 minutos
    
    // Actualizar actividad con eventos del usuario
    const updateActivity = () => {
        lastActivity = Date.now();
    };
    
    // Eventos que indican actividad del usuario
    const activityEvents = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart', 'mousedown'];
    activityEvents.forEach(event => {
        document.addEventListener(event, updateActivity, { passive: true });
    });
    
    // Verificar al volver a la pestaña
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
            const inactiveTime = Date.now() - lastActivity;
            
            // Si estuvo inactivo más del umbral, hacer precalentamiento
            if (inactiveTime > INACTIVITY_THRESHOLD) {
                console.log('Usuario regresa después de inactividad, precalentando...');
                const token = sessionStorage.getItem("token");
                fetch(`${API_URL}/health`, {
                    headers: token ? { 'Authorization': `Bearer ${token}` } : {}
                }).catch(() => {});
            }
            updateActivity();
        }
    });
    
    // También monitorear cambios de ruta
    if (window.location) {
        let lastPath = window.location.pathname;
        const observer = new MutationObserver(() => {
            if (window.location.pathname !== lastPath) {
                lastPath = window.location.pathname;
                const inactiveTime = Date.now() - lastActivity;
                
                // Si cambia de ruta después de mucha inactividad
                if (inactiveTime > INACTIVITY_THRESHOLD) {
                    console.log('Cambio de ruta después de inactividad');
                    updateActivity();
                }
            }
        });
        
        observer.observe(document.body, { childList: true, subtree: true });
    }
};

// Iniciar cuando la página cargue
if (typeof window !== 'undefined') {
    window.addEventListener('load', () => {
        // Esperar 5 segundos después de cargar para iniciar checks
        setTimeout(() => {
            startHealthChecks();
            setupActivityWatcher();
        }, 5000);
    });
    
    // Limpiar intervalo al descargar la página
    window.addEventListener('beforeunload', () => {
        if (window._healthCheckInterval) {
            clearInterval(window._healthCheckInterval);
        }
    });
}

// Funciones de utilidad para mantener conexión
export const checkBackendHealth = async () => {
    try {
        const token = sessionStorage.getItem("token");
        const response = await fetch(`${API_URL}/health`, {
            headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        });
        return response.ok;
    } catch (error) {
        console.warn('Health check falló:', error);
        return false;
    }
};

export const prewarmConnection = () => {
    const token = sessionStorage.getItem("token");
    fetch(`${API_URL}/health`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
    }).catch(() => {});
};

// Manejo de errores mejorado
const manejoErrores = (error) => {
    if (error.response) {
        console.error("Error del servidor:", error.response.data);
    } else if (error.request) {
        console.warn("No se recibió respuesta del servidor. Verifica la conexión.");
        // Si es error de red, intentar reconexión rápida
        if (error.code === 'ECONNABORTED' || !error.response) {
            console.log("Intentando reconectar...");
            prewarmConnection();
        }
    } else {
        console.warn("Error al configurar la petición:", error.message);
    }
    return error.response || null;
};

// Funciones API existentes (manteniendo tu estructura original)

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
};

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
};

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
};

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
};

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
};

export const postProductos = async (data) => {
    try {
        const response = await api.post(`/productos`, data,
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
};

export const postCaja = async (data) => {
    try {
        const response = await api.post(`/cajas`, data,
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
};

export const postVendas = async (data) => {
    try {
        const response = await api.post(`/ventas`, data,
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
};

export const postMovimiento = async (data) => {
    try {
        const response = await api.post(`/movimiento`, data,
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
};

export const putProductos = async (data) => {
    try {
        const response = await api.put(`/productos/${data.id}`, data,
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
};

export const putCajas = async (data) => {
    try {
        const response = await api.put(`/cajas/${data.id}`, data,
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
};

export const putUserData = async (data) => {
    try {
        const response = await api.put(`/user`, data,
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
};

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
};

// Exportar api por si necesitas usarla directamente
export { api };