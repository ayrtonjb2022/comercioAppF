import { useState, useEffect } from "react";
import { 
  FaEdit, 
  FaTrash, 
  FaPlus, 
  FaSearch, 
  FaBox, 
  FaChartLine, 
  FaTags, 
  FaInfoCircle,
  FaTimes, // Importación añadida para solucionar el error
  FaSave // Importación añadida para el botón de guardar
} from "react-icons/fa";
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
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const [categorias, setCategorias] = useState([]);

  useEffect(() => {
    const getProductos = async () => {
      setCargando(true);
      try {
        const response = await getProductosall();
        const productosRaw = response?.data?.productos || [];

        const productosFormateados = productosRaw.map((p) => ({
          ...p,
          descripcion: p.descripcion ?? "",
          categoria: p.categoria ?? "",
          activo: p.activo !== null ? Boolean(p.activo) : true,
        }));

        const productosValidos = productosFormateados.filter(
          (p) => p?.id && p?.nombre
        );

        // Extraer categorías únicas
        const catUnicas = [...new Set(productosValidos.map(p => p.categoria).filter(cat => cat))];
        setCategorias(catUnicas);
        
        setProductos(productosValidos);
      } catch (err) {
        console.error("Error al cargar productos:", err);
        setError("Error al cargar productos.");
        setTimeout(() => setError(""), 30000);
      } finally {
        setCargando(false);
      }
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
      const newProduct = {
        ...form,
        id: productos.length ? Math.max(...productos.map(p => p.id)) + 1 : 1
      };
      setProductos((prev) => [...prev, newProduct]);
      await postProductos(newProduct);
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

  // Calcular estadísticas
  const totalProductos = productos.length;
  const productosActivos = productos.filter(p => p.activo).length;
  const stockTotal = productos.reduce((acc, p) => acc + parseInt(p.cantidad), 0);
  const valorInventario = productos.reduce((acc, p) => 
    acc + (parseInt(p.cantidad) * parseFloat(p.precioCompra)), 0);

  return (
    <div className="min-h-screen bg-gray-50 p-6 relative">
      {/* ERROR */}
      {error && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-4 py-2 rounded shadow z-50">
          {error}
        </div>
      )}

      {/* CARGANDO */}
      {cargando && (
        <div className="fixed inset-0 bg-white bg-opacity-70 z-40 flex items-center justify-center pointer-events-auto">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500 border-solid"></div>
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <FaBox className="text-blue-500" /> Gestión de Productos
          </h1>
          <p className="text-gray-600 mt-2">Administra tu inventario de productos y stock</p>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-8">
          <div className="bg-white rounded-xl shadow p-5 flex items-start">
            <div className="bg-blue-100 p-3 rounded-lg mr-4">
              <FaBox className="text-blue-600 text-xl" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Productos totales</h3>
              <p className="text-2xl font-bold text-gray-800">{totalProductos}</p>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow p-5 flex items-start">
            <div className="bg-green-100 p-3 rounded-lg mr-4">
              <FaChartLine className="text-green-600 text-xl" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Productos activos</h3>
              <p className="text-2xl font-bold text-gray-800">{productosActivos}</p>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow p-5 flex items-start">
            <div className="bg-purple-100 p-3 rounded-lg mr-4">
              <FaTags className="text-purple-600 text-xl" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Stock total</h3>
              <p className="text-2xl font-bold text-gray-800">{stockTotal}</p>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow p-5 flex items-start">
            <div className="bg-amber-100 p-3 rounded-lg mr-4">
              <FaInfoCircle className="text-amber-600 text-xl" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Valor inventario</h3>
              <p className="text-2xl font-bold text-gray-800">${valorInventario.toFixed(2)}</p>
            </div>
          </div>
        </div>

        {/* Controles */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 bg-white p-4 rounded-xl shadow">
          <div className="relative flex-1">
            <FaSearch className="absolute left-3 top-3.5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar productos por nombre o categoría..."
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={abrirNuevo}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-md"
          >
            <FaPlus />
            Nuevo Producto
          </button>
        </div>

        {/* Lista de productos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {productosFiltrados.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <FaBox className="text-gray-500 text-2xl" />
              </div>
              <h3 className="text-lg font-medium text-gray-700">No se encontraron productos</h3>
              <p className="text-gray-500 mt-1">Intenta con otro término de búsqueda o crea un nuevo producto.</p>
            </div>
          ) : (
            productosFiltrados.map((p) => (
              <div
                key={p.id}
                className={`bg-white rounded-xl shadow-md overflow-hidden transition-all hover:shadow-lg ${
                  !p.activo ? "opacity-70" : ""
                }`}
              >
                <div className="p-5">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                        {p.nombre}
                        {!p.activo && (
                          <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded">
                            Inactivo
                          </span>
                        )}
                      </h3>
                      {p.categoria && (
                        <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded mt-1">
                          {p.categoria}
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => abrirEditar(p)}
                        className="text-blue-600 hover:text-blue-800 p-2 rounded-full hover:bg-blue-50"
                        title="Editar"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleEliminar(p.id)}
                        className="text-red-600 hover:text-red-800 p-2 rounded-full hover:bg-red-50"
                        title="Eliminar"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 text-sm mt-3 min-h-[40px]">
                    {p.descripcion || "Sin descripción..."}
                  </p>
                  
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-xs text-gray-500">Stock</p>
                      <p className={`text-lg font-medium ${p.cantidad <= 5 ? "text-red-600" : "text-green-600"}`}>
                        {p.cantidad} unidades
                      </p>
                    </div>
                    
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-xs text-gray-500">Precio</p>
                      <p className="text-lg font-medium text-gray-800">${parseFloat(p.precioVenta).toFixed(2)}</p>
                    </div>
                    
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-xs text-gray-500">Costo</p>
                      <p className="text-lg font-medium text-gray-800">${parseFloat(p.precioCompra).toFixed(2)}</p>
                    </div>
                    
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-xs text-gray-500">Ganancia</p>
                      <p className="text-lg font-medium text-green-600">{p.porcentajeGanancia}%</p>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal para crear/editar producto */}
      {mostrarModal && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl">
            <div className="flex justify-between items-center border-b p-5">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <FaBox className="text-blue-500" />
                {productoEditar ? "Editar Producto" : "Nuevo Producto"}
              </h2>
              <button 
                onClick={() => setMostrarModal(false)}
                className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100"
              >
                <FaTimes className="text-xl" />
              </button>
            </div>
            
            <form onSubmit={handleGuardar} className="p-5 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre del producto *
                  </label>
                  <input
                    name="nombre"
                    value={form.nombre}
                    onChange={handleChange}
                    placeholder="Ej: Café Premium"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Categoría
                  </label>
                  <div className="relative">
                    <select
                      name="categoria"
                      value={form.categoria}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                    >
                      <option value="">Seleccionar categoría</option>
                      {categorias.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                      <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                        <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción
                </label>
                <textarea
                  name="descripcion"
                  value={form.descripcion}
                  onChange={handleChange}
                  placeholder="Describe las características del producto..."
                  rows="3"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Stock inicial
                  </label>
                  <input
                    name="cantidad"
                    type="number"
                    min="0"
                    value={form.cantidad}
                    onChange={handleChange}
                    placeholder="0"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Precio de compra ($)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-3.5 text-gray-500">$</span>
                    <input
                      name="precioCompra"
                      type="number"
                      step="0.01"
                      min="0"
                      value={form.precioCompra}
                      onChange={handleChange}
                      placeholder="0.00"
                      className="w-full pl-8 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Precio de venta ($)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-3.5 text-gray-500">$</span>
                    <input
                      name="precioVenta"
                      type="number"
                      step="0.01"
                      min="0"
                      value={form.precioVenta}
                      onChange={handleChange}
                      placeholder="0.00"
                      className="w-full pl-8 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Porcentaje de ganancia (%)
                  </label>
                  <input
                    name="porcentajeGanancia"
                    type="number"
                    step="0.1"
                    min="0"
                    value={form.porcentajeGanancia}
                    onChange={handleChange}
                    placeholder="0.0"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div className="flex items-end">
                  <label className="flex items-center gap-3 h-full">
                    <div className="relative">
                      <input
                        type="checkbox"
                        name="activo"
                        checked={form.activo}
                        onChange={handleChange}
                        className="sr-only"
                      />
                      <div className={`block w-14 h-7 rounded-full ${
                        form.activo ? 'bg-blue-600' : 'bg-gray-300'
                      }`}></div>
                      <div className={`absolute left-1 top-1 bg-white w-5 h-5 rounded-full transition-transform ${
                        form.activo ? 'transform translate-x-7' : ''
                      }`}></div>
                    </div>
                    <span className="text-gray-700">Producto activo</span>
                  </label>
                </div>
              </div>
              
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setMostrarModal(false)}
                  className="px-5 py-2.5 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
                >
                  <FaSave /> {productoEditar ? "Guardar Cambios" : "Crear Producto"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}