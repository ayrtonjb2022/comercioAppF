import { useState, useEffect } from "react";
import { FaSave, FaTrash, FaTimes, FaUserEdit, FaLock, FaUser } from "react-icons/fa";
import { getDataUs, putUserData } from '../api/webApi';

export default function ConfiguracionCuenta() {
  const [usuario, setUsuario] = useState({
    nombre: "",
    apellido: "",
    email: "",
  });

  const [form, setForm] = useState({
    nombre: "",
    apellido: "",
    email: "",
    password: "",
    confirmarPassword: "",
  });

  const [editando, setEditando] = useState(false);
  const [mostrarConfirmEliminar, setMostrarConfirmEliminar] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const datosUs = async () => {
      setCargando(true);
      try {
        const res = await getDataUs();
        setUsuario(res);
      } catch (error) {
        console.error("Error al obtener datos de usuario:", error);
        setError("Error al cargar datos del usuario");
      } finally {
        setCargando(false);
      }
    };
    datosUs();
  }, []);

  // Actualiza el formulario cuando llegan los datos del usuario
  useEffect(() => {
    setForm({
      nombre: usuario.nombre || "",
      apellido: usuario.apellido || "",
      email: usuario.email || "",
      password: "",
      confirmarPassword: "",
    });
  }, [usuario]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const guardarCambios = async (e) => {
    e.preventDefault();
    
    if (form.password && form.password !== form.confirmarPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    setCargando(true);
    try {
      await putUserData({
        nombre: form.nombre,
        apellido: form.apellido,
        email: form.email,
        password: form.password || undefined,
      });

      setUsuario({
        nombre: form.nombre,
        apellido: form.apellido,
        email: form.email,
      });

      setForm((prev) => ({
        ...prev,
        password: "",
        confirmarPassword: "",
      }));

      setEditando(false);
      setError("");
    } catch (error) {
      console.error("Error al actualizar datos:", error);
      setError("Error al actualizar los datos");
    } finally {
      setCargando(false);
    }
  };

  const eliminarCuenta = () => {
    alert("Cuenta eliminada (simulado)");
    setMostrarConfirmEliminar(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 max-w-7xl mx-auto">
      {cargando && (
        <div className="fixed inset-0 bg-white/70 z-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500"></div>
        </div>
      )}

      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Configuraciones de la cuenta</h1>
          <p className="text-gray-600 mt-2">Administre la información y seguridad de su cuenta</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Sección de información personal */}
          <div className="border-b border-gray-200 p-6">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                  <FaUser className="text-blue-500" /> Información personal
                </h2>
                <p className="text-gray-600 mt-1">Actualiza tus datos personales</p>
              </div>
              
              {!editando ? (
                <button
                  onClick={() => setEditando(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  <FaUserEdit /> Editar Informacion
                </button>
              ) : (
                <button
                  onClick={() => {
                    setEditando(false);
                    setError("");
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition"
                >
                  <FaTimes /> Cancelar
                </button>
              )}
            </div>

            <div className="mt-6">
              {!editando ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500">Nombre</p>
                    <p className="text-lg font-medium text-gray-800">{usuario.nombre}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500">Apellido</p>
                    <p className="text-lg font-medium text-gray-800">{usuario.apellido}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg md:col-span-2">
                    <p className="text-sm text-gray-500">Dirección de correo electrónico</p>
                    <p className="text-lg font-medium text-gray-800">{usuario.email}</p>
                  </div>
                </div>
              ) : (
                <form onSubmit={guardarCambios} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nombre</label>
                    <div className="relative">
                      <input
                        type="text"
                        name="nombre"
                        value={form.nombre}
                        onChange={handleChange}
                        required
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <FaUser className="absolute left-3 top-3.5 text-gray-400" />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Apellido</label>
                    <input
                      type="text"
                      name="apellido"
                      value={form.apellido}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Dirección de correo electrónico</label>
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div className="md:col-span-2 border-t border-gray-200 pt-4 mt-2">
                    <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2 mb-4">
                      <FaLock className="text-blue-500" /> Cambiar la contraseña
                    </h3>
                    
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Contraseña</label>
                        <div className="relative">
                          <input
                            type="password"
                            name="password"
                            value={form.password}
                            onChange={handleChange}
                            placeholder="Leave blank to keep current"
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                          <FaLock className="absolute left-3 top-3.5 text-gray-400" />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Confirmar Contraseña</label>
                        <div className="relative">
                          <input
                            type="password"
                            name="confirmarPassword"
                            value={form.confirmarPassword}
                            onChange={handleChange}
                            placeholder="Confirm your new password"
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                          <FaLock className="absolute left-3 top-3.5 text-gray-400" />
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {error && (
                    <div className="md:col-span-2 bg-red-50 text-red-700 p-3 rounded-lg">
                      {error}
                    </div>
                  )}
                  
                  <div className="md:col-span-2 flex justify-end mt-4">
                    <button
                      type="submit"
                      className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                      <FaSave /> Guardar Cambios
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>

          {/* Sección de eliminación de cuenta */}
          <div className="p-6 bg-red-50">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                  <FaTrash className="text-red-500" /> Eliminar Cuenta
                </h2>
                <p className="text-gray-600 mt-1">
Eliminar permanentemente su cuenta y todos los datos asociados
                </p>
              </div>
              
              <button
                onClick={() => setMostrarConfirmEliminar(true)}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                <FaTrash /> Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal confirmación eliminar */}
      {mostrarConfirmEliminar && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">Confirm Account Deletion</h3>
              <button 
                onClick={() => setMostrarConfirmEliminar(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                &times;
              </button>
            </div>
            
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
              <p className="text-red-700">
                <strong className="font-bold">Warning:</strong> This action is irreversible. 
                All your data will be permanently deleted.
              </p>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-600">
                Are you sure you want to delete your account? This will permanently remove:
              </p>
              <ul className="list-disc pl-5 mt-2 text-gray-600">
                <li>Your personal information</li>
                <li>All transaction history</li>
                <li>Account settings and preferences</li>
              </ul>
            </div>
            
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setMostrarConfirmEliminar(false)}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition"
              >
                <FaTimes className="inline mr-2" />
                Cancel
              </button>
              <button
                onClick={eliminarCuenta}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                <FaTrash className="inline mr-2" />
                Eliminar cuenta
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}