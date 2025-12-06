import { useState, useEffect } from "react";
import { 
  FaSave, 
  FaTrash, 
  FaTimes, 
  FaUserEdit, 
  FaLock, 
  FaUser,
  FaEnvelope,
  FaShieldAlt,
  FaKey,
  FaCheckCircle,
  FaExclamationTriangle,
  FaUserCircle,
  FaEye,
  FaEyeSlash
} from "react-icons/fa";
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
  const [success, setSuccess] = useState("");
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [mostrarConfirmPassword, setMostrarConfirmPassword] = useState(false);

  useEffect(() => {
    const datosUs = async () => {
      setCargando(true);
      try {
        const res = await getDataUs();
        setUsuario(res.data || res);
        setSuccess("Datos cargados correctamente");
        setTimeout(() => setSuccess(""), 3000);
      } catch (error) {
        console.error("Error al obtener datos de usuario:", error);
        setError("Error al cargar datos del usuario");
        setTimeout(() => setError(""), 5000);
      } finally {
        setCargando(false);
      }
    };
    datosUs();
  }, []);

  // Actualiza el formulario cuando llegan los datos del usuario
  useEffect(() => {
    if (usuario.nombre || usuario.apellido || usuario.email) {
      setForm({
        nombre: usuario.nombre || "",
        apellido: usuario.apellido || "",
        email: usuario.email || "",
        password: "",
        confirmarPassword: "",
      });
    }
  }, [usuario]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    // Limpiar errores cuando el usuario comienza a escribir
    if (error) setError("");
  };

  const validarFormulario = () => {
    if (!form.nombre.trim()) {
      setError("El nombre es obligatorio");
      return false;
    }
    if (!form.apellido.trim()) {
      setError("El apellido es obligatorio");
      return false;
    }
    if (!form.email.trim()) {
      setError("El correo electrónico es obligatorio");
      return false;
    }
    if (form.password && form.password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return false;
    }
    if (form.password !== form.confirmarPassword) {
      setError("Las contraseñas no coinciden");
      return false;
    }
    return true;
  };

  const guardarCambios = async (e) => {
    e.preventDefault();
    
    if (!validarFormulario()) {
      setTimeout(() => setError(""), 5000);
      return;
    }

    setCargando(true);
    try {
      await putUserData({
        nombre: form.nombre.trim(),
        apellido: form.apellido.trim(),
        email: form.email.trim(),
        password: form.password || undefined,
      });

      // Actualizar el usuario localmente
      setUsuario({
        nombre: form.nombre.trim(),
        apellido: form.apellido.trim(),
        email: form.email.trim(),
      });

      // Limpiar campos de contraseña
      setForm((prev) => ({
        ...prev,
        password: "",
        confirmarPassword: "",
      }));

      setEditando(false);
      setError("");
      setSuccess("¡Datos actualizados correctamente!");
      setTimeout(() => setSuccess(""), 5000);
    } catch (error) {
      console.error("Error al actualizar datos:", error);
      setError(error.response?.data?.message || "Error al actualizar los datos");
      setTimeout(() => setError(""), 5000);
    } finally {
      setCargando(false);
    }
  };

  const cancelarEdicion = () => {
    setEditando(false);
    setForm({
      nombre: usuario.nombre || "",
      apellido: usuario.apellido || "",
      email: usuario.email || "",
      password: "",
      confirmarPassword: "",
    });
    setError("");
  };

  const eliminarCuenta = () => {
    alert("Cuenta eliminada (simulado)");
    setMostrarConfirmEliminar(false);
    setSuccess("Cuenta eliminada correctamente");
    setTimeout(() => setSuccess(""), 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 md:p-6">
      {/* Spinner de carga */}
      {cargando && (
        <div className="fixed inset-0 bg-white/70 z-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500"></div>
        </div>
      )}

      {/* Mensajes de éxito y error */}
      {success && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2">
          <FaCheckCircle /> {success}
        </div>
      )}
      
      {error && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2">
          <FaExclamationTriangle /> {error}
        </div>
      )}

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-800">Configuración de Cuenta</h1>
              <p className="text-gray-600 mt-2">Administra tu información personal y seguridad</p>
            </div>
            <div className="flex items-center gap-3">
              {editando ? (
                <button
                  onClick={cancelarEdicion}
                  className="flex items-center gap-2 px-4 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                >
                  <FaTimes /> Cancelar
                </button>
              ) : (
                <button
                  onClick={() => setEditando(true)}
                  className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition shadow-md"
                >
                  <FaUserEdit /> Editar Perfil
                </button>
              )}
            </div>
          </div>

          {/* Panel de Información del Usuario */}
          <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-2xl shadow-2xl p-6 mb-8 text-white overflow-hidden relative">
            {/* Elementos decorativos */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full -translate-y-16 translate-x-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-purple-500/10 rounded-full translate-y-12 -translate-x-12"></div>
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="bg-white/10 p-4 rounded-xl">
                    <FaUserCircle className="text-3xl" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Perfil de Usuario</h2>
                    <p className="text-gray-300">Información personal y datos de acceso</p>
                  </div>
                </div>
                <div className="bg-white/10 px-3 py-1 rounded-full text-sm">
                  <FaShieldAlt className="inline mr-1" /> Cuenta activa
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white/10 p-5 rounded-xl backdrop-blur-sm">
                  <div className="flex items-center gap-3 mb-3">
                    <FaUser className="text-blue-300" />
                    <span className="text-gray-300">Nombre Completo</span>
                  </div>
                  <div className="text-xl font-bold">
                    {usuario.nombre} {usuario.apellido}
                  </div>
                </div>

                <div className="bg-white/10 p-5 rounded-xl backdrop-blur-sm">
                  <div className="flex items-center gap-3 mb-3">
                    <FaEnvelope className="text-purple-300" />
                    <span className="text-gray-300">Correo Electrónico</span>
                  </div>
                  <div className="text-xl font-bold truncate">{usuario.email}</div>
                </div>

                <div className="bg-white/10 p-5 rounded-xl backdrop-blur-sm">
                  <div className="flex items-center gap-3 mb-3">
                    <FaKey className="text-green-300" />
                    <span className="text-gray-300">Contraseña</span>
                  </div>
                  <div className="text-xl font-bold">••••••••</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Formulario de Edición (Condicional) */}
        {editando && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-800">Editar Información</h2>
                <p className="text-gray-600">Actualiza tus datos personales y de seguridad</p>
              </div>
              <div className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-sm font-medium">
                Modo edición
              </div>
            </div>

            <form onSubmit={guardarCambios} className="space-y-6">
              {/* Información Personal */}
              <div className="border-b border-gray-200 pb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <FaUser className="text-blue-500" /> Información Personal
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <FaUser className="absolute left-3 top-3.5 text-gray-400" />
                      <input
                        type="text"
                        name="nombre"
                        value={form.nombre}
                        onChange={handleChange}
                        required
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Ingresa tu nombre"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Apellido <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="apellido"
                      value={form.apellido}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Ingresa tu apellido"
                    />
                  </div>
                </div>
                
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Correo Electrónico <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <FaEnvelope className="absolute left-3 top-3.5 text-gray-400" />
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      required
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="tu@email.com"
                    />
                  </div>
                </div>
              </div>

              {/* Cambio de Contraseña */}
              <div className="border-b border-gray-200 pb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <FaLock className="text-green-500" /> Seguridad de la Cuenta
                  <span className="text-sm font-normal text-gray-500 ml-2">(Opcional)</span>
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nueva Contraseña
                    </label>
                    <div className="relative">
                      <FaLock className="absolute left-3 top-3.5 text-gray-400" />
                      <input
                        type={mostrarPassword ? "text" : "password"}
                        name="password"
                        value={form.password}
                        onChange={handleChange}
                        className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Mínimo 6 caracteres"
                      />
                      <button
                        type="button"
                        onClick={() => setMostrarPassword(!mostrarPassword)}
                        className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
                      >
                        {mostrarPassword ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Deja en blanco para mantener la contraseña actual</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confirmar Contraseña
                    </label>
                    <div className="relative">
                      <FaLock className="absolute left-3 top-3.5 text-gray-400" />
                      <input
                        type={mostrarConfirmPassword ? "text" : "password"}
                        name="confirmarPassword"
                        value={form.confirmarPassword}
                        onChange={handleChange}
                        className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Confirma tu nueva contraseña"
                      />
                      <button
                        type="button"
                        onClick={() => setMostrarConfirmPassword(!mostrarConfirmPassword)}
                        className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
                      >
                        {mostrarConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Botones de acción */}
              <div className="flex justify-between items-center pt-6">
                <div className="text-sm text-gray-500">
                  Los campos marcados con <span className="text-red-500">*</span> son obligatorios
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={cancelarEdicion}
                    className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition shadow-md flex items-center gap-2"
                    disabled={cargando}
                  >
                    <FaSave /> {cargando ? "Guardando..." : "Guardar Cambios"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* Sección de Eliminación de Cuenta */}
        <div className="bg-gradient-to-r from-red-50 to-red-100 border border-red-200 rounded-2xl shadow-lg overflow-hidden">
          <div className="p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div className="flex items-start gap-4">
                <div className="bg-red-100 p-3 rounded-lg">
                  <FaExclamationTriangle className="text-red-600 text-2xl" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800">Eliminar Cuenta</h2>
                  <p className="text-gray-600 mt-1">
                    Esta acción es permanente y no se puede deshacer. Se eliminarán todos tus datos.
                  </p>
                </div>
              </div>
              
              <button
                onClick={() => setMostrarConfirmEliminar(true)}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 transition shadow-md"
              >
                <FaTrash /> Eliminar Cuenta
              </button>
            </div>

            <div className="bg-white p-4 rounded-lg border border-red-200">
              <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                <FaExclamationTriangle className="text-red-500" /> Advertencia
              </h4>
              <ul className="list-disc pl-5 text-gray-600 space-y-1">
                <li>Todos tus datos personales serán eliminados permanentemente</li>
                <li>Se perderá el historial completo de transacciones</li>
                <li>Esta acción no se puede deshacer ni revertir</li>
                <li>Se eliminarán todas las configuraciones y preferencias</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Modal confirmación eliminar */}
      {mostrarConfirmEliminar && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="bg-red-50 border-b border-red-200 p-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-800">Confirmar Eliminación</h3>
                <button 
                  onClick={() => setMostrarConfirmEliminar(false)}
                  className="p-2 hover:bg-red-100 rounded-lg transition"
                >
                  <FaTimes className="text-gray-500" />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="flex items-center justify-center mb-4">
                <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center">
                  <FaExclamationTriangle className="text-red-600 text-2xl" />
                </div>
              </div>
              
              <div className="text-center mb-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-2">¿Estás absolutamente seguro?</h4>
                <p className="text-gray-600">
                  Esta acción no se puede deshacer. Se eliminará permanentemente tu cuenta y todos los datos asociados.
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <p className="text-sm text-gray-700 font-medium mb-2">Por favor, escribe "ELIMINAR" para confirmar:</p>
                <input
                  type="text"
                  placeholder="ELIMINAR"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setMostrarConfirmEliminar(false)}
                  className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                >
                  Cancelar
                </button>
                <button
                  onClick={eliminarCuenta}
                  className="px-5 py-2.5 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 transition shadow-md flex items-center gap-2"
                >
                  <FaTrash /> Sí, eliminar cuenta
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}