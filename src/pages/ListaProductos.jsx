import { useState, useEffect } from "react";
import { 
  FaEdit, 
  FaPlus, 
  FaSearch, 
  FaBox, 
  FaTags, 
  FaInfoCircle,
  FaTimes,
  FaSave,
  FaPowerOff,
  FaCheck,
  FaEye,
  FaEyeSlash,
  FaExclamationTriangle,
  FaShoppingCart,
  FaTrash,
  FaDollarSign,
  FaFilter,
  FaLayerGroup,
  FaTag
} from "react-icons/fa";
import {
  getProductosall,
  postProductos,
  putProductos,
  deleteProductos,
  getCategorias,
  createCategoria,
  getSubcategoriasByCategoria,
  createSubcategoria
} from "../api/webApi";
import ProductoCard from "../components/ProductoCard";

export default function VistaProductos() {
  const [filtro, setFiltro] = useState("");
  const [mostrarModal, setMostrarModal] = useState(false);
  const [productoEditar, setProductoEditar] = useState(null);
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const [vistaActivos, setVistaActivos] = useState(true);
  const [pedido, setPedido] = useState([]);
  
  // Estados para categorías y subcategorías
  const [categorias, setCategorias] = useState([]);
  const [subcategorias, setSubcategorias] = useState([]);
  const [cargandoCategorias, setCargandoCategorias] = useState(false);
  
  // Estados para modales de crear categoría/subcategoría
  const [mostrarModalCategoria, setMostrarModalCategoria] = useState(false);
  const [mostrarModalSubcategoria, setMostrarModalSubcategoria] = useState(false);
  const [nuevaCategoria, setNuevaCategoria] = useState("");
  const [nuevaSubcategoria, setNuevaSubcategoria] = useState("");

  useEffect(() => {
    cargarProductos();
    cargarCategorias();
  }, []);

  const cargarProductos = async () => {
    setCargando(true);
    try {
      const response = await getProductosall();
      const productosRaw = response?.data?.productos || [];

      // Transformar los productos para incluir información de categoría y subcategoría
      const productosFormateados = productosRaw.map((p) => ({
        ...p,
        descripcion: p.descripcion ?? "",
        // Si el backend devuelve las relaciones, usarlas; si no, mantener el campo string
        categoria: p.categoria || p.categoriaNombre || "",
        categoriaId: p.categoriaId || null,
        subcategoria: p.subcategoria || "",
        subcategoriaId: p.subcategoriaId || null,
        activo: p.activo !== null ? Boolean(p.activo) : true,
      }));

      const productosValidos = productosFormateados.filter(
        (p) => p?.id && p?.nombre
      );

      setProductos(productosValidos);
    } catch (err) {
      console.error("Error al cargar productos:", err);
      setError("Error al cargar productos.");
      setTimeout(() => setError(""), 5000);
    } finally {
      setCargando(false);
    }
  };

  const cargarCategorias = async () => {
    setCargandoCategorias(true);
    try {
      const data = await getCategorias();
      setCategorias(data.categorias || []);
    } catch (err) {
      console.error("Error al cargar categorías:", err);
      setError("Error al cargar categorías.");
      setTimeout(() => setError(""), 5000);
    } finally {
      setCargandoCategorias(false);
    }
  };

  const cargarSubcategorias = async (categoriaId) => {
    try {
      if (categoriaId) {
        const data = await getSubcategoriasByCategoria(categoriaId);
        setSubcategorias(data.subcategorias || []);
      } else {
        setSubcategorias([]);
      }
    } catch (err) {
      console.error("Error al cargar subcategorías:", err);
      setSubcategorias([]);
    }
  };

  // Productos según estado activo/inactivo
  const productosFiltradosPorEstado = productos.filter(p => 
    vistaActivos ? p.activo : !p.activo
  );

  // Aplicar filtro de búsqueda
  const productosFiltrados = productosFiltradosPorEstado.filter((p) =>
    `${p.nombre} ${p.categoria} ${p.subcategoria} ${p.descripcion}`.toLowerCase().includes(filtro.toLowerCase())
  );

  // Productos con bajo stock
  const productosBajoStock = productos.filter(p => 
    p.activo && parseInt(p.cantidad) < 6
  );

  const [form, setForm] = useState({
    nombre: "",
    cantidad: 0,
    precioCompra: 0,
    precioVenta: 0,
    porcentajeGanancia: 0,
    descripcion: "",
    categoriaId: "",
    subcategoriaId: "",
    activo: true,
  });

  // Funciones de pedido
  const agregarAlPedido = (producto) => {
    const productoExistente = pedido.find(item => item.id === producto.id);
    
    if (productoExistente) {
      setPedido(pedido.map(item => 
        item.id === producto.id 
          ? { ...item, cantidadPedido: item.cantidadPedido + 1 }
          : item
      ));
    } else {
      setPedido([...pedido, {
        ...producto,
        cantidadPedido: 1,
        costoTotal: parseFloat(producto.precioCompra)
      }]);
    }
  };

  const actualizarCantidadPedido = (id, nuevaCantidad) => {
    if (nuevaCantidad < 1) {
      eliminarDelPedido(id);
      return;
    }
    
    setPedido(pedido.map(item => {
      if (item.id === id) {
        const costoUnitario = parseFloat(item.precioCompra);
        return {
          ...item,
          cantidadPedido: nuevaCantidad,
          costoTotal: costoUnitario * nuevaCantidad
        };
      }
      return item;
    }));
  };

  const eliminarDelPedido = (id) => {
    setPedido(pedido.filter(item => item.id !== id));
  };

  const calcularTotalPedido = () => {
    return pedido.reduce((total, item) => total + (parseFloat(item.precioCompra) * item.cantidadPedido), 0);
  };

  const limpiarPedido = () => {
    setPedido([]);
  };

  const abrirNuevo = () => {
    setForm({
      nombre: "",
      cantidad: 0,
      precioCompra: 0,
      precioVenta: 0,
      porcentajeGanancia: 0,
      descripcion: "",
      categoriaId: "",
      subcategoriaId: "",
      activo: true,
    });
    setProductoEditar(null);
    setSubcategorias([]);
    setMostrarModal(true);
  };

  const abrirEditar = (producto) => {
    setForm({
      ...producto,
      categoriaId: producto.categoriaId || "",
      subcategoriaId: producto.subcategoriaId || "",
    });
    setProductoEditar(producto);
    setMostrarModal(true);
    // Cargar subcategorías de la categoría del producto
    if (producto.categoriaId) {
      cargarSubcategorias(producto.categoriaId);
    }
  };

  const handleDesactivar = async (id) => {
    if (window.confirm("¿Desactivar producto? Podrás reactivarlo después.")) {
      const producto = productos.find(p => p.id === id);
      if (producto) {
        const productoActualizado = { ...producto, activo: false };
        setProductos(prev => prev.map(p => p.id === id ? productoActualizado : p));
        await putProductos(productoActualizado);
      }
    }
  };

  const handleActivar = async (id) => {
    if (window.confirm("¿Activar producto?")) {
      const producto = productos.find(p => p.id === id);
      if (producto) {
        const productoActualizado = { ...producto, activo: true };
        setProductos(prev => prev.map(p => p.id === id ? productoActualizado : p));
        await putProductos(productoActualizado);
      }
    }
  };

  const handleGuardar = async (e) => {
    e.preventDefault();
    try {
      // Preparar datos para enviar
      const productoData = {
        ...form,
        cantidad: parseInt(form.cantidad) || 0,
        precioCompra: parseFloat(form.precioCompra) || 0,
        precioVenta: parseFloat(form.precioVenta) || 0,
        porcentajeGanancia: parseFloat(form.porcentajeGanancia) || 0,
        categoriaId: form.categoriaId || null,
        subcategoriaId: form.subcategoriaId || null,
      };

      if (productoEditar) {
        await putProductos(productoData);
        // Actualizar producto en el estado
        setProductos(prev => prev.map(p => 
          p.id === productoEditar.id 
            ? { ...p, ...productoData, categoria: categorias.find(c => c.id == form.categoriaId)?.nombre || "" } 
            : p
        ));
      } else {
        const response = await postProductos(productoData);
        if (response.data?.producto) {
          setProductos(prev => [...prev, response.data.producto]);
        }
      }
      setMostrarModal(false);
      // Recargar productos para asegurar datos actualizados
      cargarProductos();
    } catch (error) {
      console.error("Error al guardar producto:", error);
      setError("Error al guardar el producto");
      setTimeout(() => setError(""), 5000);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name === "categoriaId") {
      // Cuando cambia la categoría, cargar sus subcategorías y resetear subcategoría seleccionada
      setForm(prev => ({
        ...prev,
        [name]: value,
        subcategoriaId: "" // Resetear subcategoría
      }));
      cargarSubcategorias(value);
    } else {
      setForm(prev => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }
  };

  // Funciones para manejar categorías
  const handleCrearCategoria = async () => {
    if (!nuevaCategoria.trim()) {
      alert("Por favor ingresa un nombre para la categoría");
      return;
    }
    
    try {
      const response = await createCategoria({ nombre: nuevaCategoria });
      if (response.data) {
        // Agregar la nueva categoría a la lista
        const nuevaCategoriaObj = response.data.categoria;
        setCategorias(prev => [...prev, nuevaCategoriaObj]);
        // Seleccionar automáticamente la nueva categoría en el formulario
        setForm(prev => ({ ...prev, categoriaId: nuevaCategoriaObj.id }));
        setNuevaCategoria("");
        setMostrarModalCategoria(false);
        // Cargar subcategorías (vacías porque es nueva)
        setSubcategorias([]);
      }
    } catch (err) {
      console.error("Error al crear categoría:", err);
      setError("Error al crear categoría");
      setTimeout(() => setError(""), 5000);
    }
  };

  const handleCrearSubcategoria = async () => {
    if (!nuevaSubcategoria.trim()) {
      alert("Por favor ingresa un nombre para la subcategoría");
      return;
    }
    
    if (!form.categoriaId) {
      alert("Debes seleccionar una categoría primero");
      return;
    }
    
    try {
      const response = await createSubcategoria({ 
        nombre: nuevaSubcategoria,
        categoriaId: form.categoriaId 
      });
      if (response.data) {
        // Agregar la nueva subcategoría a la lista
        const nuevaSubcategoriaObj = response.data.subcategoria;
        setSubcategorias(prev => [...prev, nuevaSubcategoriaObj]);
        // Seleccionar automáticamente la nueva subcategoría en el formulario
        setForm(prev => ({ ...prev, subcategoriaId: nuevaSubcategoriaObj.id }));
        setNuevaSubcategoria("");
        setMostrarModalSubcategoria(false);
      }
    } catch (err) {
      console.error("Error al crear subcategoría:", err);
      setError("Error al crear subcategoría");
      setTimeout(() => setError(""), 5000);
    }
  };

  // Estadísticas
  const productosActivos = productos.filter(p => p.activo);
  const totalProductosActivos = productosActivos.length;
  const stockTotalActivos = productosActivos.reduce((acc, p) => acc + parseInt(p.cantidad), 0);
  const valorInventarioActivos = productosActivos.reduce((acc, p) => 
    acc + (parseInt(p.cantidad) * parseFloat(p.precioCompra)), 0);
  const totalProductosInactivos = productos.filter(p => !p.activo).length;

  // Obtener nombre de categoría por ID
  const getNombreCategoria = (id) => {
    const categoria = categorias.find(c => c.id == id);
    return categoria ? categoria.nombre : "";
  };

  // Obtener nombre de subcategoría por ID
  const getNombreSubcategoria = (id) => {
    const subcategoria = subcategorias.find(s => s.id == id);
    return subcategoria ? subcategoria.nombre : "";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6">
      {/* Notificaciones */}
      {error && (
        <div className="fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg animate-fade-in z-50">
          <div className="flex items-center gap-2">
            <FaExclamationTriangle />
            {error}
          </div>
        </div>
      )}

      {cargando && (
        <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-40 flex items-center justify-center">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
            <p className="mt-4 text-gray-600">Cargando productos...</p>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FaBox className="text-blue-600" />
              </div>
              Gestión de Productos
            </h1>
            <p className="text-gray-600 mt-2">Administra tu inventario y stock</p>
          </div>
          
          <button
            onClick={abrirNuevo}
            className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-xl"
          >
            <FaPlus />
            Nuevo Producto
          </button>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow p-4 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Activos</p>
                <p className="text-2xl font-bold text-gray-900">{totalProductosActivos}</p>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <FaBox className="text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow p-4 border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Inactivos</p>
                <p className="text-2xl font-bold text-gray-900">{totalProductosInactivos}</p>
              </div>
              <div className="p-2 bg-yellow-100 rounded-lg">
                <FaPowerOff className="text-yellow-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow p-4 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Stock total</p>
                <p className="text-2xl font-bold text-gray-900">{stockTotalActivos}</p>
              </div>
              <div className="p-2 bg-purple-100 rounded-lg">
                <FaTags className="text-purple-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow p-4 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Valor inventario</p>
                <p className="text-2xl font-bold text-gray-900">${valorInventarioActivos.toFixed(2)}</p>
              </div>
              <div className="p-2 bg-green-100 rounded-lg">
                <FaDollarSign className="text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow p-4 border-l-4 border-red-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Bajo stock</p>
                <p className="text-2xl font-bold text-gray-900">{productosBajoStock.length}</p>
              </div>
              <div className="p-2 bg-red-100 rounded-lg">
                <FaExclamationTriangle className="text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Panel de bajo stock */}
        {productosBajoStock.length > 0 && (
          <div className="mb-8 bg-gradient-to-r from-red-50 to-orange-50 border border-red-100 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <FaExclamationTriangle className="text-red-600 text-xl" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Productos con bajo stock</h2>
                  <p className="text-sm text-gray-600">{productosBajoStock.length} productos necesitan reposición</p>
                </div>
              </div>
              <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-bold">
                &lt; 6 unidades
              </span>
            </div>
            
            <div className="overflow-x-auto">
              <div className="flex gap-4 pb-4 min-w-max">
                {productosBajoStock.slice(0, 4).map((producto) => (
                  <div key={producto.id} className="bg-white rounded-xl shadow p-4 min-w-[280px]">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-gray-900">{producto.nombre}</h3>
                        <p className="text-sm text-gray-500 mt-1">
                          {producto.categoria || 'Sin categoría'}
                          {producto.subcategoria && ` / ${producto.subcategoria}`}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                        producto.cantidad < 3 ? 'bg-red-500 text-white' : 'bg-yellow-500 text-white'
                      }`}>
                        {producto.cantidad} unidades
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-sm">
                        <p className="text-gray-600">Costo: <span className="font-semibold">${parseFloat(producto.precioCompra).toFixed(2)}</span></p>
                        <p className="text-gray-600">Valor: <span className="font-semibold">${(parseFloat(producto.precioCompra) * parseInt(producto.cantidad)).toFixed(2)}</span></p>
                      </div>
                      <button
                        onClick={() => agregarAlPedido(producto)}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-lg hover:from-red-700 hover:to-orange-700 transition-all"
                      >
                        <FaShoppingCart />
                        Agregar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Panel de pedido */}
        {pedido.length > 0 && (
          <div className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FaShoppingCart className="text-blue-600 text-xl" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Pedido actual</h2>
                  <p className="text-sm text-gray-600">{pedido.length} productos en el carrito</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-2xl font-bold text-blue-700">
                  ${calcularTotalPedido().toFixed(2)}
                </span>
                <button
                  onClick={limpiarPedido}
                  className="px-4 py-2 bg-white border border-blue-200 text-blue-700 rounded-lg hover:bg-blue-50 transition"
                >
                  Limpiar
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pedido.map((item) => (
                <div key={item.id} className="bg-white rounded-xl shadow p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 truncate">{item.nombre}</h3>
                      <p className="text-sm text-gray-500">
                        {item.categoria || 'Sin categoría'}
                        {item.subcategoria && ` / ${item.subcategoria}`}
                      </p>
                      <p className="text-sm text-gray-500">${parseFloat(item.precioCompra).toFixed(2)} c/u</p>
                    </div>
                    <button
                      onClick={() => eliminarDelPedido(item.id)}
                      className="text-red-500 hover:text-red-700 p-1"
                    >
                      <FaTrash />
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => actualizarCantidadPedido(item.id, item.cantidadPedido - 1)}
                        className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-lg hover:bg-gray-200"
                      >
                        -
                      </button>
                      <span className="w-12 text-center font-semibold">{item.cantidadPedido}</span>
                      <button
                        onClick={() => actualizarCantidadPedido(item.id, item.cantidadPedido + 1)}
                        className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-lg hover:bg-gray-200"
                      >
                        +
                      </button>
                    </div>
                    <div className="font-bold text-blue-600">
                      ${(parseFloat(item.precioCompra) * item.cantidadPedido).toFixed(2)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-6 pt-6 border-t border-blue-200">
              <div className="flex items-center justify-between mb-4">
                <span className="text-lg font-semibold text-gray-900">Total del pedido:</span>
                <span className="text-2xl font-bold text-blue-700">${calcularTotalPedido().toFixed(2)}</span>
              </div>
              <button
                onClick={() => {
                  alert(`Pedido confirmado por $${calcularTotalPedido().toFixed(2)}`);
                  limpiarPedido();
                }}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all font-semibold"
              >
                Confirmar pedido
              </button>
            </div>
          </div>
        )}

        {/* Filtros y búsqueda */}
        <div className="bg-white rounded-2xl shadow p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setVistaActivos(true)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  vistaActivos 
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <FaEye /> Activos
              </button>
              <button
                onClick={() => setVistaActivos(false)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  !vistaActivos 
                    ? 'bg-gradient-to-r from-yellow-600 to-yellow-700 text-white shadow' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <FaEyeSlash /> Inactivos
              </button>
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder={`Buscar ${vistaActivos ? 'activos' : 'inactivos'}...`}
                  value={filtro}
                  onChange={(e) => setFiltro(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="text-sm text-gray-600">
              Mostrando {productosFiltrados.length} de {productosFiltradosPorEstado.length} productos
            </div>
          </div>
        </div>

        {/* Lista de productos */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">
              {vistaActivos ? '📦 Productos activos' : '📦 Productos inactivos'}
            </h2>
            {filtro && (
              <button
                onClick={() => setFiltro("")}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Limpiar búsqueda
              </button>
            )}
          </div>
          
          {productosFiltrados.length === 0 ? (
            <div className="bg-white rounded-2xl shadow p-12 text-center">
              <div className="max-w-md mx-auto">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FaBox className="text-gray-400 text-3xl" />
                </div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  No hay productos {vistaActivos ? 'activos' : 'inactivos'}
                </h3>
                <p className="text-gray-500 mb-6">
                  {filtro 
                    ? 'No se encontraron productos con ese término de búsqueda'
                    : vistaActivos
                      ? 'Crea tu primer producto para comenzar'
                      : 'Todos los productos están activos'
                  }
                </p>
                {!filtro && vistaActivos && (
                  <button
                    onClick={abrirNuevo}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    Crear primer producto
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {productosFiltrados.map((p) => (
                <ProductoCard
                  key={p.id}
                  producto={p}
                  onEditar={() => abrirEditar(p)}
                  onDesactivar={() => handleDesactivar(p.id)}
                  onActivar={() => handleActivar(p.id)}
                  showActivateButton={!vistaActivos}
                  onAgregarPedido={vistaActivos ? () => agregarAlPedido(p) : null}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal de producto - CON z-index: 50 */}
      {mostrarModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-6 flex items-center justify-between rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FaBox className="text-blue-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">
                  {productoEditar ? "Editar producto" : "Nuevo producto"}
                </h2>
              </div>
              <button 
                onClick={() => setMostrarModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <FaTimes className="text-gray-500 text-xl" />
              </button>
            </div>
            
            <form onSubmit={handleGuardar} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre del producto *
                  </label>
                  <input
                    name="nombre"
                    value={form.nombre}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ej: Café Premium"
                  />
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Categoría
                    </label>
                    <button
                      type="button"
                      onClick={() => setMostrarModalCategoria(true)}
                      className="text-sm text-green-600 hover:text-green-800 flex items-center gap-1"
                    >
                      <FaPlus size={12} /> Nueva
                    </button>
                  </div>
                  <select
                    name="categoriaId"
                    value={form.categoriaId}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Seleccionar categoría</option>
                    {cargandoCategorias ? (
                      <option value="" disabled>Cargando categorías...</option>
                    ) : (
                      categorias.map(cat => (
                        <option key={cat.id} value={cat.id}>
                          {cat.nombre}
                        </option>
                      ))
                    )}
                  </select>
                  {form.categoriaId && (
                    <p className="text-xs text-green-600 mt-1">
                      Seleccionada: {getNombreCategoria(form.categoriaId)}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Subcategoría
                    </label>
                    <button
                      type="button"
                      onClick={() => setMostrarModalSubcategoria(true)}
                      disabled={!form.categoriaId}
                      className={`text-sm flex items-center gap-1 ${
                        form.categoriaId 
                          ? "text-blue-600 hover:text-blue-800" 
                          : "text-gray-400 cursor-not-allowed"
                      }`}
                    >
                      <FaPlus size={12} /> Nueva
                    </button>
                  </div>
                  <select
                    name="subcategoriaId"
                    value={form.subcategoriaId}
                    onChange={handleChange}
                    disabled={!form.categoriaId}
                    className={`w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      !form.categoriaId ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    <option value="">Seleccionar subcategoría</option>
                    {form.categoriaId ? (
                      subcategorias.length > 0 ? (
                        subcategorias.map(sub => (
                          <option key={sub.id} value={sub.id}>{sub.nombre}</option>
                        ))
                      ) : (
                        <option value="">No hay subcategorías para esta categoría</option>
                      )
                    ) : (
                      <option value="">Selecciona una categoría primero</option>
                    )}
                  </select>
                  {form.subcategoriaId && (
                    <p className="text-xs text-green-600 mt-1">
                      Seleccionada: {getNombreSubcategoria(form.subcategoriaId)}
                    </p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descripción
                  </label>
                  <textarea
                    name="descripcion"
                    value={form.descripcion}
                    onChange={handleChange}
                    rows="2"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Describe el producto..."
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Stock
                  </label>
                  <input
                    name="cantidad"
                    type="number"
                    min="0"
                    value={form.cantidad}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Precio compra
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
                      className="w-full pl-8 px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Precio venta
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
                      className="w-full pl-8 px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Porcentaje de ganancia
                </label>
                <div className="flex items-center gap-2">
                  <input
                    name="porcentajeGanancia"
                    type="number"
                    step="0.1"
                    min="0"
                    value={form.porcentajeGanancia}
                    onChange={handleChange}
                    placeholder="0.0"
                    className="flex-1 px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (form.precioCompra > 0 && form.precioVenta > 0) {
                        const porcentaje = ((form.precioVenta - form.precioCompra) / form.precioCompra * 100);
                        setForm(prev => ({ ...prev, porcentajeGanancia: porcentaje.toFixed(2) }));
                      }
                    }}
                    className="px-4 py-3 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition"
                  >
                    Calcular
                  </button>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  Ganancia unitaria: ${(form.precioVenta - form.precioCompra).toFixed(2)}
                </p>
              </div>
              
              <div className="flex items-center justify-between pt-6 border-t">
                <label className="flex items-center gap-3 cursor-pointer">
                  <div className="relative">
                    <input
                      type="checkbox"
                      name="activo"
                      checked={form.activo}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <div className={`w-12 h-6 rounded-full transition ${form.activo ? 'bg-blue-600' : 'bg-gray-300'}`}>
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${form.activo ? 'left-7' : 'left-1'}`}></div>
                    </div>
                  </div>
                  <span className="font-medium">Producto activo</span>
                </label>
                
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setMostrarModal(false)}
                    className="px-5 py-2.5 text-gray-700 hover:bg-gray-100 rounded-lg transition"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition flex items-center gap-2"
                  >
                    <FaSave />
                    {productoEditar ? "Guardar" : "Crear"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal para crear nueva categoría - CON z-index: 60 (MAYOR que el modal de producto) */}
      {mostrarModalCategoria && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-60 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-fade-in">
            <div className="sticky top-0 bg-white border-b p-6 flex items-center justify-between rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <FaLayerGroup className="text-green-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Nueva Categoría</h2>
              </div>
              <button 
                onClick={() => setMostrarModalCategoria(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <FaTimes className="text-gray-500 text-xl" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre de la categoría
                </label>
                <input
                  type="text"
                  value={nuevaCategoria}
                  onChange={(e) => setNuevaCategoria(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Ej: Bebidas, Snacks, etc."
                  autoFocus
                />
              </div>
              
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setMostrarModalCategoria(false)}
                  className="px-5 py-2.5 text-gray-700 hover:bg-gray-100 rounded-lg transition"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCrearCategoria}
                  className="px-5 py-2.5 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition flex items-center gap-2"
                >
                  <FaPlus />
                  Crear Categoría
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal para crear nueva subcategoría - CON z-index: 60 (MAYOR que el modal de producto) */}
      {mostrarModalSubcategoria && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-60 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-fade-in">
            <div className="sticky top-0 bg-white border-b p-6 flex items-center justify-between rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FaTag className="text-blue-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Nueva Subcategoría</h2>
              </div>
              <button 
                onClick={() => setMostrarModalSubcategoria(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <FaTimes className="text-gray-500 text-xl" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre de la subcategoría
                </label>
                <input
                  type="text"
                  value={nuevaSubcategoria}
                  onChange={(e) => setNuevaSubcategoria(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ej: Lata, Litro, Descartable, etc."
                  autoFocus
                />
                {form.categoriaId && (
                  <p className="text-sm text-gray-500 mt-2">
                    Esta subcategoría se creará para: <span className="font-medium">{getNombreCategoria(form.categoriaId)}</span>
                  </p>
                )}
              </div>
              
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setMostrarModalSubcategoria(false)}
                  className="px-5 py-2.5 text-gray-700 hover:bg-gray-100 rounded-lg transition"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCrearSubcategoria}
                  className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition flex items-center gap-2"
                >
                  <FaPlus />
                  Crear Subcategoría
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}