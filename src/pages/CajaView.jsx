import { useState, useEffect } from "react";
import { FaTimes, FaTrash, FaSearch, FaMoneyBillWave, FaPercent, FaExclamationTriangle, FaBoxOpen } from "react-icons/fa";
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
  const [confirmacionStock, setConfirmacionStock] = useState({ show: false, producto: null });

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
          categoria: p.categoria ?? "",
          activo: p.activo !== null ? Boolean(p.activo) : true,
          cantidad: parseInt(p.cantidad) || 0,
        }));

        // FILTRAR SOLO PRODUCTOS ACTIVOS
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

  const productosFiltrados = productosG.filter((p) =>
    `${p.nombre} ${p.categoria}`.toLowerCase().includes(filtro.toLowerCase())
  );

  const agregarProductoConConfirmacion = (producto) => {
    // Verificar que el producto esté activo antes de agregarlo
    if (!producto.activo) {
      setError("No se puede agregar un producto inactivo al ticket");
      setTimeout(() => setError(""), 3000);
      return;
    }
    
    // Si el stock es 0, pedir confirmación
    if (producto.cantidad <= 0) {
      setConfirmacionStock({ 
        show: true, 
        producto,
        mensaje: `"${producto.nombre}" tiene 0 stock. ¿Desea agregarlo de todas formas?`
      });
      return;
    }
    
    // Si tiene stock, agregar directamente
    agregarProducto(producto);
  };

  const confirmarAgregarSinStock = () => {
    if (confirmacionStock.producto) {
      agregarProducto(confirmacionStock.producto);
    }
    setConfirmacionStock({ show: false, producto: null, mensaje: "" });
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

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-50 text-gray-900 relative">

      {/* Spinner de carga */}
      {cargando && (
        <div className="fixed inset-0 bg-white bg-opacity-70 z-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500 border-solid"></div>
        </div>
      )}

      {/* Mensaje de error */}
      {error && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-4 py-2 rounded shadow z-50 flex items-center gap-2">
          <FaExclamationTriangle />
          {error}
        </div>
      )}

      {/* Modal de confirmación para productos sin stock */}
      {confirmacionStock.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden">
            <div className="border-b border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-yellow-100 p-2 rounded-lg">
                    <FaExclamationTriangle className="text-yellow-600 text-xl" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Confirmar producto sin stock</h2>
                    <p className="text-gray-600 mt-1">Producto sin inventario disponible</p>
                  </div>
                </div>
                <button 
                  onClick={() => setConfirmacionStock({ show: false, producto: null, mensaje: "" })}
                  className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <FaTimes size={20} />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                <p className="text-yellow-800 font-medium">{confirmacionStock.mensaje}</p>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-700">
                  <span className="font-medium">Producto:</span> {confirmacionStock.producto?.nombre}
                </p>
                <p className="text-gray-700 mt-1">
                  <span className="font-medium">Precio:</span> ${parseFloat(confirmacionStock.producto?.precioVenta || 0).toFixed(2)}
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setConfirmacionStock({ show: false, producto: null, mensaje: "" })}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={confirmarAgregarSinStock}
                  className="flex-1 px-6 py-3 bg-yellow-600 text-white rounded-xl hover:bg-yellow-700 transition-colors font-medium"
                >
                  Agregar sin stock
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <VentaModal
        isOpen={modalAbierto}
        onClose={() => setModalAbierto(false)}
        total={totalVenta}
        onConfirm={manejarConfirmacion}
      />

      {/* Panel Ticket */}
      <section className="w-full md:w-1/4 p-4 flex flex-col flex-1 md:flex-none md:max-h-full bg-white shadow-inner border-r border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">Ticket</h2>
          {ticket.length > 0 && (
            <button
              onClick={() => setTicket([])}
              className="text-red-600 hover:text-red-800 flex items-center gap-1 text-sm"
            >
              <FaTrash /> Limpiar
            </button>
          )}
        </div>
        
        <div className="flex-grow overflow-y-auto">
          {ticket.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16 mb-4 flex items-center justify-center">
                <FaMoneyBillWave className="text-2xl" />
              </div>
              <p>No hay productos en el ticket</p>
            </div>
          ) : (
            ticket.map(({ id, nombre, precio, cantidad, descuento }) => (
              <div
                key={id}
                className="bg-gray-50 rounded-lg p-3 mb-3 hover:bg-gray-100 transition"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <h3 className="font-semibold text-sm truncate max-w-[150px]">{nombre}</h3>
                      <span className="font-medium text-sm">
                        ${(precio * cantidad * (1 - descuento / 100)).toFixed(2)}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2 mt-2">
                      <div className="relative">
                        <span className="absolute left-2 top-1.5 text-gray-500 text-xs">x</span>
                        <input
                          type="number"
                          min={1}
                          value={cantidad}
                          onChange={(e) =>
                            actualizarItem(id, parseInt(e.target.value) || 1, null)
                          }
                          className="w-14 pl-6 pr-1 py-1 border border-gray-300 rounded text-center text-sm"
                        />
                      </div>
                      
                      <div className="relative">
                        <span className="absolute left-2 top-1.5 text-gray-500 text-xs"><FaPercent /></span>
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
                          className="w-14 pl-6 pr-1 py-1 border border-gray-300 rounded text-center text-sm"
                          placeholder="%"
                        />
                      </div>
                      
                      <button
                        onClick={() => quitarProducto(id)}
                        className="ml-auto text-red-600 hover:text-red-800 p-1"
                      >
                        <FaTimes className="text-sm" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Panel Productos */}
      <section className="w-full md:w-2/4 p-4 flex flex-col flex-1 md:flex-none overflow-y-auto bg-gray-50">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800">Productos Activos</h2>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Mostrando solo productos activos</span>
            </div>
          </div>
          <div className="relative">
            <FaSearch className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar productos activos por nombre o categoría"
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>
          <div className="mt-2 text-sm text-gray-500">
            {productosFiltrados.length} productos activos disponibles
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 flex-grow">
          {productosFiltrados.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <FaSearch className="text-gray-500 text-2xl" />
              </div>
              <h3 className="text-lg font-medium text-gray-700">
                {filtro ? 'No se encontraron productos activos' : 'No hay productos activos disponibles'}
              </h3>
              <p className="text-gray-500 mt-1 text-sm">
                {filtro 
                  ? 'Intenta con otro término de búsqueda' 
                  : 'Todos los productos están actualmente inactivos o no hay productos registrados'}
              </p>
            </div>
          ) : (
            productosFiltrados.map((producto) => {
              const precio = parseFloat(producto.precioVenta) || 0;
              const tieneStock = producto.cantidad > 0;
              const stockBajo = producto.cantidad <= 5 && producto.cantidad > 0;
              
              return (
                <button
                  key={producto.id}
                  onClick={() => agregarProductoConConfirmacion(producto)}
                  className={`rounded-xl shadow p-3 hover:shadow-lg transition flex flex-col items-center justify-center relative h-32 ${
                    !tieneStock 
                      ? 'bg-red-50 border border-red-200 hover:bg-red-100' 
                      : stockBajo
                        ? 'bg-amber-50 border border-amber-200 hover:bg-amber-100'
                        : 'bg-white border border-gray-200 hover:bg-blue-50'
                  }`}
                  title={!tieneStock ? "Sin stock - Se requiere confirmación" : "Agregar al ticket"}
                >
                  {/* Indicador de producto activo */}
                  <div className="absolute top-2 right-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full" title="Producto activo"></div>
                  </div>
                  
                  {/* Nombre del producto con truncado */}
                  <h3 className="font-semibold text-center mb-1 text-gray-800 text-xs leading-tight line-clamp-2 h-8 overflow-hidden w-full">
                    {producto.nombre}
                  </h3>
                  
                  {/* Categoría */}
                  {producto.categoria && (
                    <span className="text-xs bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded mb-1 truncate w-full text-center">
                      {producto.categoria}
                    </span>
                  )}
                  
                  {/* Precio */}
                  <p className="text-blue-600 font-bold text-sm mt-1">${precio.toFixed(2)}</p>
                  
                  {/* Estado de stock */}
                  <div className="mt-1 flex flex-col items-center">
                    {!tieneStock && (
                      <div className="flex items-center gap-1">
                        <FaBoxOpen className="text-red-500 text-xs" />
                        <span className="text-xs text-red-600 font-medium">Sin stock</span>
                      </div>
                    )}
                    
                    {stockBajo && (
                      <div className="text-xs text-amber-600 font-medium">
                        Stock: {producto.cantidad}
                      </div>
                    )}
                    
                    {tieneStock && producto.cantidad > 5 && (
                      <div className="text-xs text-gray-500">
                        Stock: {producto.cantidad}
                      </div>
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>
      </section>

      {/* Panel Totales */}
      <section className="w-full md:w-1/4 p-4 flex flex-col flex-1 md:flex-none bg-white border-t md:border-t-0 md:border-l border-gray-200 shadow-inner">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Totales</h2>
        
        <div className="space-y-4 flex-grow flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
              <span className="text-gray-600 text-sm">Subtotal:</span>
              <span className="font-medium text-sm">${totalBruto.toFixed(2)}</span>
            </div>
            
            <div className="flex justify-between items-center bg-red-50 p-3 rounded-lg">
              <span className="text-red-600 text-sm">Descuento:</span>
              <span className="font-medium text-red-600 text-sm">-${totalDescuento.toFixed(2)}</span>
            </div>
            
            <div className="flex justify-between items-center bg-green-50 p-3 rounded-lg mt-4">
              <span className="text-green-700 font-bold text-sm">Total a pagar:</span>
              <span className="font-bold text-lg text-green-700">${totalNeto.toFixed(2)}</span>
            </div>
            
            <div className="mt-6 p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2 text-blue-800 mb-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm font-medium">Resumen de venta</span>
              </div>
              <p className="text-sm text-blue-700">
                {ticket.length} producto{ticket.length !== 1 ? 's' : ''} en el ticket
              </p>
              {ticket.some(item => item.cantidadOriginal <= 0) && (
                <p className="text-xs text-red-600 mt-1">
                  ⚠️ Algunos productos tienen 0 stock
                </p>
              )}
            </div>
          </div>
          
          <div>
            <button
              className={`w-full py-3 text-white rounded-xl shadow-lg transition flex items-center justify-center gap-2 ${
                ticket.length === 0 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800'
              }`}
              onClick={() => setModalAbierto(true)}
              disabled={ticket.length === 0}
            >
              <FaMoneyBillWave className="text-base" />
              <span className="font-bold text-base">
                {ticket.length === 0 ? 'Agregar productos' : `Cobrar $${totalNeto.toFixed(2)}`}
              </span>
            </button>
            
            {ticket.length > 0 && (
              <p className="text-center text-xs text-gray-500 mt-2">
                Haz clic para procesar la venta
              </p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}