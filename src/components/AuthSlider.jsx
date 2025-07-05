import { useState } from 'react';
import { postLogin, postRegister } from '../api/authLogin';
import { useNavigate } from "react-router-dom";

export default function AuthSlider() {
  const navigate = useNavigate();
  const [showRegister, setShowRegister] = useState(false);

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDataLogin({ ...dataLogin, [name]: value });
  };

  const handleChangeR = (e) => {
    const { name, value } = e.target;
    setDataRegister({ ...dataRegister, [name]: value });
  };

  const handleSubmit = async (e) => { // LOGIN
    e.preventDefault();
    try {
      const response = await postLogin(dataLogin);
      console.log("Respuesta login:", response);
      navigate("/dashboard"); // Reemplazar con tu ruta
    } catch (error) {
      console.error("Error al iniciar sesión:", error);
      alert("Error al iniciar sesión. Verifica tus credenciales.");
    }
  };

  const handleSubmitR = async (e) => { // REGISTRO
    e.preventDefault();
    if (dataRegister.password !== dataRegister.confirmPassword) {
      alert("Las contraseñas no coinciden");
      return;
    }
    try {
      const response = await postRegister(dataRegister);
      console.log("Respuesta registro:", response);
      alert("Registro exitoso. Inicia sesión.");
      setShowRegister(false);
      setDataRegister({
        email: "", password: "", nombre: "", apellido: "", confirmPassword: ""
      });
    } catch (error) {
      console.error("Error al registrarse:", error);
      alert("Hubo un error al registrarse.");
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-gray-100">
      <div className="relative w-full max-w-4xl h-[500px] overflow-hidden shadow-2xl rounded-2xl bg-white flex">

        {/* Lado izquierdo decorativo */}
        <div className="w-1/2 bg-blue-600 text-white hidden md:flex items-center justify-center text-3xl font-bold px-6">
          Sistema de Ventas
        </div>

        {/* Contenedor de formularios */}
        <div className="w-full md:w-1/2 relative overflow-hidden">

          {/* Login */}
          <div
            className={`absolute top-0 left-0 w-full h-full transition-transform duration-500 ease-in-out ${
              showRegister ? '-translate-x-full' : 'translate-x-0'
            }`}
          >
            <div className="w-full h-full p-8 flex flex-col justify-center">
              <h2 className="text-2xl font-bold mb-6 text-center">Iniciar Sesión</h2>
              <form className="flex flex-col space-y-4" onSubmit={handleSubmit}>
                <input 
                  type="email" 
                  placeholder="Email" 
                  className="p-2 border rounded"
                  name="email"
                  value={dataLogin.email}
                  onChange={handleChange}
                  required 
                />
                <input 
                  type="password" 
                  placeholder="Contraseña" 
                  className="p-2 border rounded"
                  name="password"
                  value={dataLogin.password}
                  onChange={handleChange}
                  required 
                />
                <button className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
                  Ingresar
                </button>
                <p className="text-sm text-center">
                  ¿No tienes cuenta?{" "}
                  <button
                    type="button"
                    className="text-blue-600 underline"
                    onClick={() => setShowRegister(true)}
                  >
                    Registrarse
                  </button>
                </p>
              </form>
            </div>
          </div>

          {/* Registro */}
          <div
            className={`absolute top-0 left-full w-full h-full transition-transform duration-500 ease-in-out ${
              showRegister ? '-translate-x-full' : 'translate-x-0'
            }`}
          >
            <div className="w-full h-full p-8 flex flex-col justify-center">
              <h2 className="text-2xl font-bold mb-6 text-center">Crear Cuenta</h2>
              <form className="flex flex-col space-y-4" onSubmit={handleSubmitR}>
                <input 
                  type="text" 
                  placeholder="Nombre" 
                  className="p-2 border rounded"
                  name="nombre"
                  value={dataRegister.nombre}
                  onChange={handleChangeR}
                  required
                />
                <input 
                  type="text" 
                  placeholder="Apellido" 
                  className="p-2 border rounded"
                  name="apellido"
                  value={dataRegister.apellido}
                  onChange={handleChangeR}
                  required
                />
                <input 
                  type="email" 
                  placeholder="Email" 
                  className="p-2 border rounded"
                  name="email"
                  value={dataRegister.email}
                  onChange={handleChangeR}
                  required
                />
                <input 
                  type="password" 
                  placeholder="Contraseña" 
                  className="p-2 border rounded"
                  name="password"
                  value={dataRegister.password}
                  onChange={handleChangeR}
                  required
                />
                <input 
                  type="password" 
                  placeholder="Confirmar Contraseña" 
                  className="p-2 border rounded"
                  name="confirmPassword"
                  value={dataRegister.confirmPassword}
                  onChange={handleChangeR}
                  required
                />
                <button className="bg-green-600 text-white py-2 rounded hover:bg-green-700">
                  Registrarse
                </button>
                <p className="text-sm text-center">
                  ¿Ya tienes cuenta?{" "}
                  <button
                    type="button"
                    className="text-green-600 underline"
                    onClick={() => setShowRegister(false)}
                  >
                    Iniciar sesión
                  </button>
                </p>
              </form>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
