import { useState, useEffect } from "react";
import { FaEdit, FaTrash, FaPlus } from "react-icons/fa";
import {
  getProductosall,
  postProductos,
  putProductos,
  deleteProductos,
} from "../api/webApi";

export default function VistaProductos() {
  const [filtro, setFiltro] = useState("");
  const [mostrarModal, setMostrarModal] = useState(false);
  const [productoEditar, setProductoEditar] = useState(null);
  const [productos, setProductos] = useState([]);

  useEffect(() => {
    const getProductos = async () => {
      const response = await getProductosall();
      const productosRaw = response?.data?.productos || [];

      // Normalizar datos recibidos
      const productosFormateados = productosRaw.map((p) => ({
        ...p,
        descripcion: p.descripcion ?? "",
        categoria: p.categoria ?? "",
        activo: p.activo !== null ? Boolean(p.activo) : true,
      }));

      // Filtro solo por existencia de id y nombre
      const productosValidos = productosFormateados.filter(
        (p) => p?.id && p?.nombre
      );

      setProductos(productosValidos);
    };

    getProductos();
  }, []);

  const productosFiltrados = productos.filter((p) =>
    `${p.nombre} ${p.categoria}`.toLowerCase().includes(filtro.toLowerCase())
  );

  const [form, setForm] = useState({
    nombre: "",
    cantidad: 0,
    precioCompra: 0,
    precioVenta: 0,
    porcentajeGanancia: 0,
    descripcion: "",
    categoria: "",
    activo: true,
  });

  const abrirNuevo = () => {
    setForm({
      nombre: "",
      cantidad: 0,
      precioCompra: 0,
      precioVenta: 0,
      porcentajeGanancia: 0,
      descripcion: "",
      categoria: "",
      activo: true,
    });
    setProductoEditar(null);
    setMostrarModal(true);
  };

  const abrirEditar = (producto) => {
    setForm(producto);
    setProductoEditar(producto);
    setMostrarModal(true);
  };

  const handleEliminar = async (id) => {
    if (confirm("¿Eliminar producto?")) {
      setProductos((prev) => prev.filter((p) => p.id !== id));
      await deleteProductos(id);
    }
  };

  const handleGuardar = async (e) => {
    e.preventDefault();
    if (productoEditar) {
      setProductos((prev) =>
        prev.map((p) => (p.id === productoEditar.id ? form : p))
      );
      await putProductos(form);
    } else {
      setProductos((prev) => [
        ...prev,
        { ...form, id: prev.length ? prev[prev.length - 1].id + 1 : 1 },
      ]);
      await postProductos(form);
    }
    setMostrarModal(false);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Gestión de Productos</h1>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <input
              type="text"
              placeholder="Buscar productos..."
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
              className="p-2 border border-gray-300 rounded-md w-full sm:w-72 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={abrirNuevo}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <FaPlus />
              Nuevo Producto
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {productosFiltrados.map((p) => (
            <div
              key={p.id}
              className="bg-white rounded-xl shadow-md p-5 flex flex-col justify-between hover:shadow-lg transition"
            >
              <div>
                <h3 className="text-xl font-semibold text-gray-800">{p.nombre}</h3>
                <p className="text-gray-600 text-sm mb-2">{p.descripcion}</p>
                <div className="text-sm space-y-1 text-gray-700">
                  <p>
                    <strong>Categoría:</strong> {p.categoria}
                  </p>
                  <p>
                    <strong>Stock:</strong>{" "}
                    <span
                      className={`${
                        p.cantidad <= 5 ? "text-red-600" : "text-green-600"
                      } font-medium`}
                    >
                      {p.cantidad}
                    </span>
                  </p>
                  <p>
                    <strong>Precio Venta:</strong> ${p.precioVenta}{" "}
                    <span className="text-gray-400 text-xs">(Compra: ${p.precioCompra})</span>
                  </p>
                  <p>
                    <strong>Ganancia:</strong> {p.porcentajeGanancia}%
                  </p>
                  <p>
                    <strong>Estado:</strong>{" "}
                    {p.activo ? (
                      <span className="text-green-600 font-semibold">Activo</span>
                    ) : (
                      <span className="text-gray-500 font-medium">Inactivo</span>
                    )}
                  </p>
                </div>
              </div>
              <div className="flex justify-end gap-4 mt-4 text-lg">
                <button
                  onClick={() => abrirEditar(p)}
                  className="text-blue-600 hover:text-blue-800"
                  title="Editar"
                >
                  <FaEdit />
                </button>
                <button
                  onClick={() => handleEliminar(p.id)}
                  className="text-red-600 hover:text-red-800"
                  title="Eliminar"
                >
                  <FaTrash />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {mostrarModal && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6 relative">
            <h2 className="text-xl font-bold mb-4 text-gray-800">
              {productoEditar ? "Editar Producto" : "Nuevo Producto"}
            </h2>
            <form onSubmit={handleGuardar} className="space-y-4">
              <input
                name="nombre"
                value={form.nombre}
                onChange={handleChange}
                placeholder="Nombre del producto"
                required
                className="w-full border border-gray-300 p-2 rounded"
              />
              <div className="grid grid-cols-2 gap-4">
                <input
                  name="cantidad"
                  type="number"
                  value={form.cantidad}
                  onChange={handleChange}
                  placeholder="Cantidad"
                  className="w-full border border-gray-300 p-2 rounded"
                />
                <input
                  name="categoria"
                  value={form.categoria}
                  onChange={handleChange}
                  placeholder="Categoría"
                  className="w-full border border-gray-300 p-2 rounded"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <input
                  name="precioCompra"
                  type="number"
                  step="0.01"
                  value={form.precioCompra}
                  onChange={handleChange}
                  placeholder="Precio Compra"
                  className="w-full border border-gray-300 p-2 rounded"
                />
                <input
                  name="precioVenta"
                  type="number"
                  step="0.01"
                  value={form.precioVenta}
                  onChange={handleChange}
                  placeholder="Precio Venta"
                  className="w-full border border-gray-300 p-2 rounded"
                />
              </div>
              <input
                name="porcentajeGanancia"
                type="number"
                step="0.1"
                value={form.porcentajeGanancia}
                onChange={handleChange}
                placeholder="% Ganancia"
                className="w-full border border-gray-300 p-2 rounded"
              />
              <textarea
                name="descripcion"
                value={form.descripcion}
                onChange={handleChange}
                placeholder="Descripción"
                className="w-full border border-gray-300 p-2 rounded"
              />
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="activo"
                  checked={form.activo}
                  onChange={handleChange}
                />
                Activo
              </label>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setMostrarModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  {productoEditar ? "Guardar Cambios" : "Crear Producto"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
