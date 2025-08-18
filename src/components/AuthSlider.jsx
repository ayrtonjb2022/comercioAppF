import { useState } from 'react';
import { postLogin, postRegister } from '../api/authLogin';
import { useNavigate } from "react-router-dom";
import { 
  FaUser, 
  FaLock, 
  FaEnvelope,
  FaSignInAlt,
  FaUserPlus,
  FaArrowLeft,
  FaChartLine
} from "react-icons/fa";

export default function AuthSlider() {
  const navigate = useNavigate();
  const [showRegister, setShowRegister] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  const [dataLogin, setDataLogin] = useState({
    email: "", 
    password: "" 
  });

  const [dataRegister, setDataRegister] = useState({
    email: "", 
    password: "",
    nombre: "",
    apellido: "",
    confirmPassword: ""
  });

  const entrarPantallaCompleta = () => {
    const elem = document.documentElement;
    if (elem.requestFullscreen) {
      elem.requestFullscreen();
    } else if (elem.webkitRequestFullscreen) {
      elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) {
      elem.msRequestFullscreen();
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDataLogin({ ...dataLogin, [name]: value });
  };

  const handleChangeR = (e) => {
    const { name, value } = e.target;
    setDataRegister({ ...dataRegister, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCargando(true);
    setError("");

    try {
      const response = await postLogin(dataLogin);
      entrarPantallaCompleta();
      navigate("/dashboard");
    } catch (error) {
      console.error("Error al iniciar sesión:", error);
      setError("Error al iniciar sesión. Verifica tus credenciales.");
      setTimeout(() => setError(""), 3000);
    } finally {
      setCargando(false);
    }
  };

  const handleSubmitR = async (e) => {
    e.preventDefault();
    setCargando(true);
    setError("");

    if (dataRegister.password !== dataRegister.confirmPassword) {
      setError("Las contraseñas no coinciden.");
      setTimeout(() => setError(""), 3000);
      setCargando(false);
      return;
    }

    try {
      const response = await postRegister(dataRegister);
      alert("Registro exitoso. Inicia sesión.");
      setShowRegister(false);
      setDataRegister({
        email: "", password: "", nombre: "", apellido: "", confirmPassword: ""
      });
    } catch (error) {
      console.error("Error al registrarse:", error);
      setError("Error al registrarse. Intenta más tarde.");
      setTimeout(() => setError(""), 3000);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 to-indigo-800 p-4">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row">
        {/* Lado izquierdo decorativo */}
        <div className="w-full md:w-1/2 bg-gradient-to-br from-blue-700 to-indigo-900 text-white p-8 flex flex-col justify-center items-center">
          <div className="text-center mb-8">
            <div className="bg-white bg-opacity-20 backdrop-blur-sm w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaUser className="text-3xl text-black" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Sistema de Ventas</h1>
            <p className="text-blue-200">Gestión comercial avanzada</p>
          </div>
          
          <div className="space-y-4 max-w-xs">
            <div className="flex items-center gap-3">
              <div className="bg-white bg-opacity-20 rounded-full w-10 h-10 flex items-center justify-center">
                <FaUser className="text-black" />
              </div>
              <p>Control total de inventario</p>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="bg-white bg-opacity-20 rounded-full w-10 h-10 flex items-center justify-center">
                <FaChartLine className="text-black" />
              </div>
              <p>Reportes y análisis avanzados</p>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="bg-white bg-opacity-20 rounded-full w-10 h-10 flex items-center justify-center">
                <FaLock className="text-black" />
              </div>
              <p>Seguridad garantizada</p>
            </div>
          </div>
        </div>

        {/* Contenedor de formularios - CORREGIDO */}
        <div className="w-full md:w-1/2 relative p-8 overflow-hidden" style={{ minHeight: '500px' }}>
          {/* Botón para volver al login desde registro */}
          {showRegister && (
            <button 
              onClick={() => setShowRegister(false)}
              className="absolute top-4 left-4 text-gray-500 hover:text-blue-600 transition-colors z-10"
            >
              <FaArrowLeft className="mr-1" /> Volver
            </button>
          )}
          
          {/* Login - CORREGIDO */}
          <div 
            className={`absolute top-0 left-0 w-full h-full p-8 transition-all duration-500 ease-in-out ${
              showRegister ? 'opacity-0 translate-x-full' : 'opacity-100 translate-x-0'
            }`}
          >
            <div className="h-full flex flex-col justify-center">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-800">Iniciar Sesión</h2>
                <p className="text-gray-500">Accede a tu cuenta para continuar</p>
              </div>
              
              <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                      <FaEnvelope />
                    </div>
                    <input 
                      type="email" 
                      placeholder="Correo electrónico" 
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      name="email"
                      value={dataLogin.email}
                      onChange={handleChange}
                      required 
                    />
                  </div>
                  
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                      <FaLock />
                    </div>
                    <input 
                      type="password" 
                      placeholder="Contraseña" 
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      name="password"
                      value={dataLogin.password}
                      onChange={handleChange}
                      required 
                    />
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <input 
                      type="checkbox" 
                      id="remember" 
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="remember" className="ml-2 text-sm text-gray-600">Recuérdame</label>
                  </div>
                  <a href="#" className="text-sm text-blue-600 hover:underline">¿Olvidaste tu contraseña?</a>
                </div>
                
                <button 
                  type="submit"
                  className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition flex items-center justify-center gap-2"
                >
                  <FaSignInAlt /> Ingresar
                </button>
                
                <div className="text-center text-sm mt-4">
                  <p className="text-gray-600">
                    ¿No tienes cuenta?{" "}
                    <button
                      type="button"
                      className="text-blue-600 font-semibold hover:underline"
                      onClick={() => setShowRegister(true)}
                    >
                      Regístrate aquí
                    </button>
                  </p>
                </div>
              </form>
            </div>
          </div>

          {/* Registro - CORREGIDO */}
          <div 
            className={`absolute top-0 left-0 w-full h-full p-8 transition-all duration-500 ease-in-out ${
              showRegister ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-full'
            }`}
          >
            <div className="h-full flex flex-col justify-center">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-800">Crear Cuenta</h2>
                <p className="text-gray-500">Comienza a gestionar tu negocio</p>
              </div>
              
              <form className="space-y-6" onSubmit={handleSubmitR}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                      <FaUser />
                    </div>
                    <input 
                      type="text" 
                      placeholder="Nombre" 
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      name="nombre"
                      value={dataRegister.nombre}
                      onChange={handleChangeR}
                      required
                    />
                  </div>
                  
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                      <FaUser />
                    </div>
                    <input 
                      type="text" 
                      placeholder="Apellido" 
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      name="apellido"
                      value={dataRegister.apellido}
                      onChange={handleChangeR}
                      required
                    />
                  </div>
                </div>
                
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                    <FaEnvelope />
                  </div>
                  <input 
                    type="email" 
                    placeholder="Correo electrónico" 
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    name="email"
                    value={dataRegister.email}
                    onChange={handleChangeR}
                    required
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                      <FaLock />
                    </div>
                    <input 
                      type="password" 
                      placeholder="Contraseña" 
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      name="password"
                      value={dataRegister.password}
                      onChange={handleChangeR}
                      required
                    />
                  </div>
                  
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                      <FaLock />
                    </div>
                    <input 
                      type="password" 
                      placeholder="Confirmar contraseña" 
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      name="confirmPassword"
                      value={dataRegister.confirmPassword}
                      onChange={handleChangeR}
                      required
                    />
                  </div>
                </div>
                
                <div className="flex items-center">
                  <input 
                    type="checkbox" 
                    id="terms" 
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    required
                  />
                  <label htmlFor="terms" className="ml-2 text-sm text-gray-600">
                    Acepto los <a href="#" className="text-blue-600 hover:underline">Términos y Condiciones</a>
                  </label>
                </div>
                
                <button 
                  type="submit"
                  className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition flex items-center justify-center gap-2"
                >
                  <FaUserPlus /> Registrarse
                </button>
                
                <div className="text-center text-sm mt-4">
                  <p className="text-gray-600">
                    ¿Ya tienes cuenta?{" "}
                    <button
                      type="button"
                      className="text-blue-600 font-semibold hover:underline"
                      onClick={() => setShowRegister(false)}
                    >
                      Inicia sesión
                    </button>
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Overlay de carga */}
      {cargando && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-xl shadow-xl flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-500 mb-4"></div>
            <p className="text-gray-700">
              {showRegister ? "Creando tu cuenta..." : "Iniciando sesión..."}
            </p>
          </div>
        </div>
      )}

      {/* Mensaje de error */}
      {error && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </div>
      )}
    </div>
  );
}