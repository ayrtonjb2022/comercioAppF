import { useState, useEffect, useMemo, useRef } from "react";
import { FaTimes, FaTrash, FaSearch, FaMoneyBillWave, FaPercent, FaExclamationTriangle, FaBoxOpen, FaKeyboard, FaArrowDown, FaArrowUp } from "react-icons/fa";
import { getProductosall, postVendas, postMovimiento } from "../api/webApi";
import VentaModal from "../components/VentaModal";

export default function CajaView({ id }) {
  const [filtro, setFiltro] = useState("");
  const [ticket, setTicket] = useState([]);
  const [productosG, setProductosG] = useState([]);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [totalVenta, setTotalVenta] = useState(0);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const [mostrarAyuda, setMostrarAyuda] = useState(false);
  const searchRef = useRef(null);

  function getFechaHoraLocalISO() {
    const fecha = new Date();
    const año = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, "0");
    const dia = String(fecha.getDate()).padStart(2, "0");
    const hora = String(fecha.getHours()).padStart(2, "0");
    const minutos = String(fecha.getMinutes()).padStart(2, "0");
    const segundos = String(fecha.getSeconds()).padStart(2, "0");
    return `${año}-${mes}-${dia}T${hora}:${minutos}:${segundos}`;
  }

  const totalBruto = ticket.reduce(
    (acc, item) => acc + item.precio * item.cantidad,
    0
  );
  const totalDescuento = ticket.reduce(
    (acc, item) => acc + (item.precio * item.cantidad * item.descuento) / 100,
    0
  );
  const totalNeto = totalBruto - totalDescuento;

  useEffect(() => {
    setTotalVenta(parseFloat(totalNeto.toFixed(2)));
  }, [ticket]);

  const manejarConfirmacion = async (venta) => {
    const detalles = ticket.map((item) => ({
      producto_id: item.id,
      cantidad: item.cantidad,
      precio_unitario: item.precio,
      total: parseFloat(
        (item.precio * item.cantidad * (1 - item.descuento / 100)).toFixed(2)
      ),
      descuento: parseFloat(item.descuento),
    }));

    const ventaCompleta = {
      fecha: getFechaHoraLocalISO(),
      total: parseFloat(totalNeto.toFixed(2)),
      cajaId: id,
      medio_pago: venta.medio_pago,
      monto_entregado: venta.monto_entregado || totalNeto,
      cambio: venta.cambio || 0,
      detalles,
    };

    try {
      await postVendas(ventaCompleta);
      console.log(ventaCompleta);
      
      await postMovimiento({
        tipo: "ingreso",
        monto: totalNeto,
        descripcion: "Venta",
        fecha: getFechaHoraLocalISO(),
        cajaId: id,
      });
      setTicket([]);
    } catch (error) {
      console.error("Error al registrar venta:", error);
      setError("Error al registrar la venta");
      setTimeout(() => setError(""), 3000);
    } finally {
      setModalAbierto(false);
    }
  };

  useEffect(() => {
    const getProductosUs = async () => {
      setCargando(true);
      try {
        const response = await getProductosall();
        const productos = response?.data?.productos || [];

        const productosFormateados = productos.map((p) => ({
          ...p,
          descripcion: p.descripcion ?? "",
          categoria: p.categoria ?? "General",
          subcategoria: p.subcategoria ?? "",
          activo: p.activo !== null ? Boolean(p.activo) : true,
          cantidad: parseInt(p.cantidad) || 0,
        }));

        const productosValidos = productosFormateados.filter(
          (p) => p?.id && p?.nombre && p.activo === true
        );
        
        setProductosG(productosValidos);
      } catch (error) {
        console.error("Error al obtener productos:", error);
        setError("Error al obtener productos.");
        setTimeout(() => setError(""), 30000);
      } finally {
        setCargando(false);
      }
    };

    getProductosUs();
  }, []);

  // Atajos de teclado
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        if (searchRef.current) {
          searchRef.current.focus();
        }
      }
      if (e.key === 'Escape' && filtro) {
        setFiltro("");
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [filtro]);

  // Agrupar productos por subcategoría y separar con/sin stock
  const { productosConStock, productosSinStock, totalProductos } = useMemo(() => {
    const productosFiltrados = productosG.filter((p) =>
      `${p.nombre} ${p.categoria} ${p.subcategoria}`.toLowerCase().includes(filtro.toLowerCase())
    );

    const conStock = {};
    const sinStock = {};
    
    productosFiltrados.forEach(producto => {
      const subcategoria = producto.subcategoria || "Sin especificar";
      const tieneStock = producto.cantidad > 0;
      
      if (tieneStock) {
        if (!conStock[subcategoria]) {
          conStock[subcategoria] = [];
        }
        conStock[subcategoria].push(producto);
      } else {
        if (!sinStock[subcategoria]) {
          sinStock[subcategoria] = [];
        }
        sinStock[subcategoria].push(producto);
      }
    });

    return {
      productosConStock: conStock,
      productosSinStock: sinStock,
      totalProductos: productosFiltrados.length
    };
  }, [productosG, filtro]);

  const getColorSubcategoria = (subcategoria) => {
    const colores = [
      "bg-blue-100 text-blue-800 border-blue-300",
      "bg-green-100 text-green-800 border-green-300",
      "bg-purple-100 text-purple-800 border-purple-300",
      "bg-amber-100 text-amber-800 border-amber-300",
      "bg-indigo-100 text-indigo-800 border-indigo-300",
      "bg-pink-100 text-pink-800 border-pink-300",
      "bg-teal-100 text-teal-800 border-teal-300",
      "bg-orange-100 text-orange-800 border-orange-300",
      "bg-cyan-100 text-cyan-800 border-cyan-300",
      "bg-lime-100 text-lime-800 border-lime-300"
    ];
    
    let hash = 0;
    for (let i = 0; i < subcategoria.length; i++) {
      hash = subcategoria.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    return colores[Math.abs(hash) % colores.length];
  };

  const agregarProducto = (producto) => {
    const precio = parseFloat(producto.precioVenta) || 0;
    setTicket((prev) => {
      const existe = prev.find((item) => item.id === producto.id);
      if (existe) {
        return prev.map((item) =>
          item.id === producto.id
            ? { ...item, cantidad: item.cantidad + 1 }
            : item
        );
      }
      return [
        ...prev,
        {
          ...producto,
          cantidad: 1,
          descuento: 0,
          precio,
        },
      ];
    });
  };

  const quitarProducto = (id) => {
    setTicket((prev) => prev.filter((item) => item.id !== id));
  };

  const actualizarItem = (id, cantidad, descuento) => {
    setTicket((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              cantidad: cantidad !== null ? cantidad : item.cantidad,
              descuento: descuento !== null ? descuento : item.descuento,
            }
          : item
      )
    );
  };

  const productosSinStockEnTicket = ticket.filter(item => item.cantidad <= 0).length;

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gradient-to-br from-gray-50 to-gray-100 text-gray-900 relative">

      {cargando && (
        <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
            <p className="text-gray-700 font-medium">Cargando productos...</p>
          </div>
        </div>
      )}

      {error && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-6 py-3 rounded-xl shadow-lg z-50 flex items-center gap-3 animate-fade-in">
          <FaExclamationTriangle className="animate-pulse" />
          <span className="font-medium">{error}</span>
          <button onClick={() => setError("")} className="ml-4">
            <FaTimes />
          </button>
        </div>
      )}

      <VentaModal
        isOpen={modalAbierto}
        onClose={() => setModalAbierto(false)}
        total={totalVenta}
        onConfirm={manejarConfirmacion}
      />

      {/* Panel Ticket */}
      <section className="w-full md:w-1/4 p-4 flex flex-col flex-1 md:flex-none md:max-h-full bg-white shadow-2xl rounded-tr-2xl rounded-br-2xl border-r border-gray-300">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Ticket</h2>
            <p className="text-sm text-gray-500">Caja #{id}</p>
          </div>
          {ticket.length > 0 && (
            <button
              onClick={() => setTicket([])}
              className="text-red-600 hover:text-red-800 flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-red-50 transition-all"
            >
              <FaTrash /> <span className="font-medium">Limpiar</span>
            </button>
          )}
        </div>
        
        <div className="flex-grow overflow-y-auto pr-1">
          {ticket.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <div className="bg-gradient-to-br from-gray-200 to-gray-300 border-2 border-dashed border-gray-300 rounded-2xl w-20 h-20 mb-4 flex items-center justify-center">
                <FaMoneyBillWave className="text-3xl" />
              </div>
              <p className="text-gray-500 font-medium">No hay productos en el ticket</p>
            </div>
          ) : (
            <div className="space-y-3">
              {ticket.map(({ id, nombre, precio, cantidad, descuento, subcategoria }) => (
                <div
                  key={id}
                  className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-4 hover:shadow-lg transition-all border border-gray-200"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-gray-800 text-sm mb-1">{nombre}</h3>
                          {subcategoria && (
                            <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                              {subcategoria}
                            </span>
                          )}
                        </div>
                        <span className="font-bold text-base text-blue-600">
                          ${(precio * cantidad * (1 - descuento / 100)).toFixed(2)}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2 mt-4">
                        <div className="relative">
                          <span className="absolute left-3 top-2 text-gray-500 text-xs">x</span>
                          <input
                            type="number"
                            min={1}
                            value={cantidad}
                            onChange={(e) =>
                              actualizarItem(id, parseInt(e.target.value) || 1, null)
                            }
                            className="w-16 pl-6 pr-2 py-2 border border-gray-300 rounded-lg text-center text-sm bg-white"
                          />
                        </div>
                        
                        <div className="relative">
                          <span className="absolute left-3 top-2 text-gray-500 text-xs"><FaPercent /></span>
                          <input
                            type="number"
                            min={0}
                            max={100}
                            value={descuento}
                            onChange={(e) =>
                              actualizarItem(
                                id,
                                null,
                                parseInt(e.target.value) || 0
                              )
                            }
                            className="w-16 pl-6 pr-2 py-2 border border-gray-300 rounded-lg text-center text-sm bg-white"
                            placeholder="%"
                          />
                        </div>
                        
                        <button
                          onClick={() => quitarProducto(id)}
                          className="ml-auto text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-50 transition-colors"
                        >
                          <FaTimes className="text-sm" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Panel Productos */}
      <section className="w-full md:w-2/4 p-6 flex flex-col flex-1 md:flex-none overflow-y-auto">
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Productos Activos</h2>
              <p className="text-gray-600 mt-1">Busca y agrega productos al ticket</p>
            </div>
            
            <div className="flex items-center gap-4">
              <button
                onClick={() => setMostrarAyuda(!mostrarAyuda)}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 rounded-lg hover:from-blue-100 hover:to-blue-200 transition-all"
              >
                <FaKeyboard />
                <span className="font-medium">Atajos</span>
                {mostrarAyuda ? <FaArrowUp size={12} /> : <FaArrowDown size={12} />}
              </button>
              
              <div className="text-sm text-gray-600 bg-white px-4 py-2 rounded-lg border border-gray-300 shadow-sm">
                <span className="font-bold">{totalProductos}</span> productos
              </div>
            </div>
          </div>
          
          {mostrarAyuda && (
            <div className="mb-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 animate-fade-in">
              <div className="flex items-center gap-2 text-blue-800 mb-2">
                <FaKeyboard />
                <span className="font-bold">Atajos de teclado:</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <div className="flex items-center gap-2">
                  <kbd className="bg-white px-2 py-1 rounded border border-blue-300 text-sm">Ctrl</kbd> + 
                  <kbd className="bg-white px-2 py-1 rounded border border-blue-300 text-sm">F</kbd>
                  <span className="text-blue-700 text-sm">Buscar</span>
                </div>
                <div className="flex items-center gap-2">
                  <kbd className="bg-white px-2 py-1 rounded border border-blue-300 text-sm">ESC</kbd>
                  <span className="text-blue-700 text-sm">Limpiar búsqueda</span>
                </div>
              </div>
            </div>
          )}
          
          <div className="relative">
            <FaSearch className="absolute left-4 top-4 text-gray-400 text-lg" />
            <input
              ref={searchRef}
              type="text"
              placeholder="Buscar productos por nombre, categoría o subcategoría... (Ctrl+F)"
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base bg-white shadow-sm"
            />
            {filtro && (
              <button
                onClick={() => setFiltro("")}
                className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
              >
                <FaTimes />
              </button>
            )}
          </div>
        </div>
        
        <div className="flex-grow overflow-y-auto pr-2">
          {totalProductos === 0 ? (
            <div className="text-center py-12">
              <div className="bg-gradient-to-br from-gray-200 to-gray-300 border-2 border-dashed border-gray-300 rounded-2xl w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                <FaSearch className="text-gray-500 text-3xl" />
              </div>
              <h3 className="text-lg font-medium text-gray-700">
                {filtro ? 'No se encontraron productos' : 'No hay productos activos'}
              </h3>
              <p className="text-gray-500 mt-1 text-sm">
                {filtro 
                  ? 'Intenta con otro término de búsqueda' 
                  : 'Todos los productos están inactivos'}
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* PRODUCTOS CON STOCK */}
              {Object.keys(productosConStock).length > 0 && (
                <div className="space-y-4">
                  {Object.entries(productosConStock).map(([subcategoria, productos]) => (
                    <div key={subcategoria} className="space-y-3">
                      {subcategoria !== "Sin especificar" && subcategoria && (
                        <div className="px-2">
                          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border ${getColorSubcategoria(subcategoria)}`}>
                            <span className="font-bold text-sm">{subcategoria}</span>
                            <span className="text-xs bg-white/50 px-2 py-0.5 rounded-full">
                              {productos.length} productos
                            </span>
                          </div>
                        </div>
                      )}
                      
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                        {productos.map((producto) => {
                          const precio = parseFloat(producto.precioVenta) || 0;
                          const stockBajo = producto.cantidad <= 5 && producto.cantidad > 0;
                          
                          return (
                            <button
                              key={producto.id}
                              onClick={() => agregarProducto(producto)}
                              className={`rounded-xl shadow-sm p-3 hover:shadow-lg transition-all duration-200 flex flex-col items-center justify-between h-32 ${
                                stockBajo
                                  ? 'bg-gradient-to-br from-amber-50 to-white border-2 border-amber-200 hover:border-amber-300 hover:from-amber-100'
                                  : 'bg-gradient-to-br from-white to-gray-50 border-2 border-gray-200 hover:border-blue-300 hover:from-blue-50'
                              }`}
                              title="Agregar al ticket"
                            >
                              <div className="w-full">
                                <h3 className="font-medium text-center text-gray-800 text-xs leading-tight h-10 flex items-center justify-center overflow-hidden">
                                  {producto.nombre}
                                </h3>
                              </div>
                              
                              <p className="text-lg font-bold text-blue-600 mt-1">${precio.toFixed(2)}</p>
                              
                              <div className="w-full flex justify-between items-center mt-2 px-1">
                                <div>
                                  <div className={`text-xs font-medium ${stockBajo ? 'text-amber-600' : 'text-green-600'}`}>
                                    Stock: {producto.cantidad}
                                  </div>
                                </div>
                                
                                <div className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
                                  Agregar
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* PRODUCTOS SIN STOCK (DESHABILITADOS) */}
              {Object.keys(productosSinStock).length > 0 && (
                <div className="space-y-4 mt-8 pt-6 border-t border-red-200">
                  <div className="px-2">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-red-300 bg-gradient-to-r from-red-50 to-pink-50">
                      <FaBoxOpen className="text-red-500" />
                      <span className="font-bold text-sm text-red-700">Productos sin stock disponible</span>
                      <span className="text-xs bg-white/50 px-2 py-0.5 rounded-full text-red-600">
                        {Object.values(productosSinStock).flat().length} productos
                      </span>
                    </div>
                    <p className="text-xs text-red-600 mt-2 ml-2">
                      No se pueden agregar por falta de inventario
                    </p>
                  </div>
                  
                  {Object.entries(productosSinStock).map(([subcategoria, productos]) => (
                    <div key={subcategoria} className="space-y-3">
                      {subcategoria !== "Sin especificar" && subcategoria && (
                        <div className="px-4">
                          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${getColorSubcategoria(subcategoria)} opacity-80`}>
                            <span className="font-medium text-xs">{subcategoria}</span>
                          </div>
                        </div>
                      )}
                      
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                        {productos.map((producto) => {
                          const precio = parseFloat(producto.precioVenta) || 0;
                          
                          return (
                            <div
                              key={producto.id}
                              className="rounded-xl p-3 flex flex-col items-center justify-between h-32 bg-gradient-to-br from-red-50 to-white border-2 border-red-200 opacity-70 cursor-not-allowed"
                              title="Sin stock - No disponible"
                            >
                              <div className="w-full">
                                <h3 className="font-medium text-center text-gray-500 text-xs leading-tight h-10 flex items-center justify-center overflow-hidden line-through">
                                  {producto.nombre}
                                </h3>
                              </div>
                              
                              <p className="text-lg font-bold text-red-400 mt-1">${precio.toFixed(2)}</p>
                              
                              <div className="w-full flex justify-between items-center mt-2 px-1">
                                <div className="flex items-center gap-1">
                                  <FaBoxOpen className="text-red-400 text-xs" />
                                  <span className="text-xs text-red-500 font-medium">Sin stock</span>
                                </div>
                                
                                <div className="text-xs bg-gray-200 text-gray-500 px-2 py-1 rounded-full font-medium">
                                  No disponible
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Panel Totales */}
      <section className="w-full md:w-1/4 p-6 flex flex-col flex-1 md:flex-none bg-gradient-to-b from-white to-gray-50 border-t md:border-t-0 md:border-l border-gray-300 shadow-2xl rounded-tl-2xl rounded-bl-2xl">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Totales</h2>
          <p className="text-gray-600 text-sm">Resumen de la venta</p>
        </div>
        
        <div className="space-y-6 flex-grow flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex justify-between items-center bg-gradient-to-r from-gray-50 to-white p-4 rounded-xl border border-gray-200">
              <span className="text-gray-600">Subtotal:</span>
              <span className="font-bold text-lg">${totalBruto.toFixed(2)}</span>
            </div>
            
            <div className="flex justify-between items-center bg-gradient-to-r from-red-50 to-white p-4 rounded-xl border border-red-200">
              <span className="text-red-600">Descuento:</span>
              <span className="font-bold text-lg text-red-600">-${totalDescuento.toFixed(2)}</span>
            </div>
            
            <div className="flex justify-between items-center bg-gradient-to-r from-green-50 to-white p-4 rounded-xl border border-green-200 mt-6">
              <span className="text-green-700 font-bold">Total a pagar:</span>
              <span className="font-bold text-2xl text-green-600">${totalNeto.toFixed(2)}</span>
            </div>
            
            <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
              <div className="flex items-center gap-2 text-blue-800 mb-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="font-medium">Resumen de venta</span>
              </div>
              <p className="text-blue-700">
                <span className="font-bold">{ticket.length}</span> producto{ticket.length !== 1 ? 's' : ''} en el ticket
              </p>
              
              {productosSinStockEnTicket > 0 && (
                <div className="mt-3 p-2 bg-gradient-to-r from-red-50 to-amber-50 rounded-lg border border-red-200">
                  <div className="flex items-center gap-2">
                    <FaExclamationTriangle className="text-red-500 text-sm" />
                    <span className="text-sm text-red-700 font-medium">
                      {productosSinStockEnTicket} producto{productosSinStockEnTicket !== 1 ? 's' : ''} sin stock
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div>
            <button
              className={`w-full py-4 text-white rounded-xl shadow-lg transition-all duration-200 flex items-center justify-center gap-3 ${
                ticket.length === 0 
                  ? 'bg-gradient-to-r from-gray-400 to-gray-500 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 hover:shadow-2xl hover:scale-[1.02]'
              }`}
              onClick={() => setModalAbierto(true)}
              disabled={ticket.length === 0}
            >
              <FaMoneyBillWave className="text-xl" />
              <span className="font-bold text-lg">
                {ticket.length === 0 ? 'Agregar productos' : `Cobrar $${totalNeto.toFixed(2)}`}
              </span>
            </button>
            
            {ticket.length > 0 && (
              <p className="text-center text-xs text-gray-500 mt-3">
                Presiona el botón para procesar el pago
              </p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}