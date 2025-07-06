import { useState, useEffect } from "react";
import { FaSave, FaTrash, FaTimes, FaUserEdit } from "react-icons/fa";
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

  useEffect(() => {
    const datosUs = async () => {
      const res = await getDataUs();
      setUsuario(res);
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
      alert("Las contraseñas no coinciden");
      return;
    }

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
    alert("Datos actualizados correctamente");
  };

  const eliminarCuenta = () => {
    alert("Cuenta eliminada (simulado)");
    // Aquí puedes agregar la lógica real de eliminación de cuenta
  };

  return (
    <div className="bg-gray-100 min-h-screen p-6 max-w-7xl mx-auto">
      <div className="bg-white rounded-xl shadow-md p-5 hover:shadow-lg transition mb-6 max-w-md mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Configuración de Cuenta</h1>

        {!editando ? (
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-gray-600 font-semibold mb-1">Nombre</label>
              <p className="text-gray-800 text-lg">{usuario.nombre}</p>
            </div>
            <div>
              <label className="block text-gray-600 font-semibold mb-1">Apellido</label>
              <p className="text-gray-800 text-lg">{usuario.apellido}</p>
            </div>
            <div>
              <label className="block text-gray-600 font-semibold mb-1">Email</label>
              <p className="text-gray-800 text-lg">{usuario.email}</p>
            </div>

            <button
              onClick={() => setEditando(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <FaUserEdit /> Editar Información
            </button>
          </div>
        ) : (
          <form onSubmit={guardarCambios} className="space-y-4">
            <div>
              <label className="block text-gray-600 font-semibold mb-1">Nombre</label>
              <input
                type="text"
                name="nombre"
                value={form.nombre}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-gray-600 font-semibold mb-1">Apellido</label>
              <input
                type="text"
                name="apellido"
                value={form.apellido}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-gray-600 font-semibold mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-gray-600 font-semibold mb-1">Nueva Contraseña</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Dejar vacío para no cambiar"
                className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-gray-600 font-semibold mb-1">Confirmar Contraseña</label>
              <input
                type="password"
                name="confirmarPassword"
                value={form.confirmarPassword}
                onChange={handleChange}
                placeholder="Confirmar contraseña"
                className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex justify-between items-center pt-4">
              <button
                type="button"
                onClick={() => setEditando(false)}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                <FaSave className="inline mr-2" />
                Guardar Cambios
              </button>
            </div>
          </form>
        )}

        <hr className="my-8" />

        <div className="max-w-md mx-auto">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Eliminar Cuenta</h2>
          <button
            onClick={() => setMostrarConfirmEliminar(true)}
            className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            <FaTrash className="inline mr-2" />
            Eliminar mi cuenta
          </button>
        </div>

        {/* Modal confirmación eliminar */}
        {mostrarConfirmEliminar && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-lg p-6 max-w-lg w-full">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Confirmar eliminación</h3>
              <p className="mb-6 text-gray-600 text-sm">
                ¿Estás seguro que deseas eliminar tu cuenta? Esta acción no se puede deshacer.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setMostrarConfirmEliminar(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400"
                >
                  <FaTimes className="inline mr-2" />
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    eliminarCuenta();
                    setMostrarConfirmEliminar(false);
                  }}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  <FaTrash className="inline mr-2" />
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
