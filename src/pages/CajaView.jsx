import { useState, useEffect } from "react";
import { FaTimes, FaTrash, FaSearch, FaMoneyBillWave, FaPercent } from "react-icons/fa";
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
        }));

        const productosValidos = productosFormateados.filter(
          (p) => p?.id && p?.nombre
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
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-4 py-2 rounded shadow z-50">
          {error}
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
                      <h3 className="font-semibold">{nombre}</h3>
                      <span className="font-medium">
                        ${(precio * cantidad * (1 - descuento / 100)).toFixed(2)}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2 mt-2">
                      <div className="relative">
                        <span className="absolute left-2 top-1.5 text-gray-500 text-sm">x</span>
                        <input
                          type="number"
                          min={1}
                          value={cantidad}
                          onChange={(e) =>
                            actualizarItem(id, parseInt(e.target.value) || 1, null)
                          }
                          className="w-16 pl-6 pr-2 py-1 border border-gray-300 rounded text-center"
                        />
                      </div>
                      
                      <div className="relative">
                        <span className="absolute left-2 top-1.5 text-gray-500 text-sm"><FaPercent /></span>
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
                          className="w-16 pl-6 pr-2 py-1 border border-gray-300 rounded text-center"
                          placeholder="%"
                        />
                      </div>
                      
                      <button
                        onClick={() => quitarProducto(id)}
                        className="ml-auto text-red-600 hover:text-red-800 p-1"
                      >
                        <FaTimes />
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
          <h2 className="text-xl font-bold text-gray-800 mb-4">Productos</h2>
          <div className="relative">
            <FaSearch className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nombre o categoría"
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 flex-grow">
          {productosFiltrados.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <FaSearch className="text-gray-500 text-2xl" />
              </div>
              <h3 className="text-lg font-medium text-gray-700">No se encontraron productos</h3>
              <p className="text-gray-500 mt-1">Intenta con otro término de búsqueda</p>
            </div>
          ) : (
            productosFiltrados.map(({ id, nombre, precioVenta }) => {
              const precio = parseFloat(precioVenta) || 0;
              return (
                <button
                  key={id}
                  onClick={() =>
                    agregarProducto({
                      id,
                      nombre,
                      precioVenta,
                    })
                  }
                  className="bg-white rounded-xl shadow p-4 hover:shadow-lg transition flex flex-col items-center justify-center"
                >
                  <h3 className="font-semibold text-center">{nombre}</h3>
                  <p className="text-blue-600 font-bold mt-1">${precio.toFixed(2)}</p>
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
              <span className="text-gray-600">Subtotal:</span>
              <span className="font-medium">${totalBruto.toFixed(2)}</span>
            </div>
            
            <div className="flex justify-between items-center bg-red-50 p-3 rounded-lg">
              <span className="text-red-600">Descuento:</span>
              <span className="font-medium text-red-600">-${totalDescuento.toFixed(2)}</span>
            </div>
            
            <div className="flex justify-between items-center bg-green-50 p-3 rounded-lg mt-4">
              <span className="text-green-700 font-bold">Total a pagar:</span>
              <span className="font-bold text-xl text-green-700">${totalNeto.toFixed(2)}</span>
            </div>
          </div>
          
          <button
            className={`py-4 text-white rounded-xl shadow-lg transition ${
              ticket.length === 0 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900'
            }`}
            onClick={() => setModalAbierto(true)}
            disabled={ticket.length === 0}
          >
            <span className="font-bold text-lg">Cobrar</span>
          </button>
        </div>
      </section>
    </div>
  );
}