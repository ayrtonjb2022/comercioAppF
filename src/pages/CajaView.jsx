import { useState, useEffect } from "react";
import { getProductosall, postVendas, postMovimiento } from "../api/webApi";
import VentaModal from '../components/VentaModal';

export default function CajaView({ id }) {
  const [filtro, setFiltro] = useState("");
  const [ticket, setTicket] = useState([]);
  const [productosG, setProductosG] = useState([]);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [totalVenta, setTotalVenta] = useState(0);

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
      total: parseFloat((item.precio * item.cantidad * (1 - item.descuento / 100)).toFixed(2)),
      descuento: parseFloat(item.descuento) // ya está en porcentaje

    }));


    const ventaCompleta = {
      fecha: getFechaHoraLocalISO(),
      total: parseFloat(totalNeto.toFixed(2)),
      cajaId: id, // Cambia este valor si usás caja dinámica
      medio_pago: venta.medio_pago,
      detalles
    };


    try {
      const response = await postVendas(ventaCompleta);
      const dataMovimiento = {
        tipo: "ingreso",
        monto: totalNeto,
        descripcion: "Venta",
        fecha: getFechaHoraLocalISO(),
        cajaId: id
      }
      const resMovimiento = await postMovimiento(dataMovimiento);
      setTicket([]);
    } catch (error) {
      console.error("Error al registrar venta:", error);
    } finally {
      setModalAbierto(false);
    }
  };

  useEffect(() => {
    const getProductosUs = async () => {
      try {
        const response = await getProductosall();
        const productos = response?.data?.productos || [];

        // Normalización de productos
        const productosFormateados = productos.map((p) => ({
          ...p,
          descripcion: p.descripcion ?? "",
          categoria: p.categoria ?? "",
          activo: p.activo !== null ? Boolean(p.activo) : true,
        }));

        const productosValidos = productosFormateados.filter((p) => p?.id && p?.nombre);
        setProductosG(productosValidos);
      } catch (error) {
        console.error("Error al obtener productos:", error);
        setProductosG([]);
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


    <div className="flex flex-col md:flex-row h-screen bg-gray-50 text-gray-900">
      <VentaModal
        isOpen={modalAbierto}
        onClose={() => setModalAbierto(false)}
        total={totalVenta}
        onConfirm={manejarConfirmacion}
      />
      {/* Panel Ticket Detalle */}
      <section className="w-full md:w-1/4 p-4 flex flex-col flex-1 md:flex-none md:max-h-full border-b md:border-b-0 md:border-r border-gray-300 overflow-y-auto">
        <h2 className="text-xl font-semibold mb-4">Ticket</h2>
        <div className="flex-grow overflow-y-auto">
          {ticket.length === 0 ? (
            <p className="text-center text-gray-500 mt-10">No hay productos</p>
          ) : (
            ticket.map(({ id, nombre, precio, cantidad, descuento }) => (
              <div
                key={id}
                className="flex items-center justify-between border-b py-2"
              >
                <div className="flex flex-col flex-grow">
                  <span className="font-medium">{nombre}</span>
                  <div className="flex flex-wrap gap-2 text-sm text-gray-600 mt-1">
                    <input
                      type="number"
                      min={1}
                      value={cantidad}
                      onChange={(e) =>
                        actualizarItem(id, parseInt(e.target.value) || 1, null)
                      }
                      className="w-20 border rounded px-2 py-1"
                      aria-label={`Cantidad de ${nombre}`}
                    />
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={descuento}
                      onChange={(e) =>
                        actualizarItem(id, null, parseInt(e.target.value) || 0)
                      }
                      className="w-24 border rounded px-2 py-1"
                      aria-label={`Descuento % de ${nombre}`}
                      placeholder="% Desc"
                    />
                  </div>
                </div>
                <div className="flex flex-col items-end ml-4">
                  <span>
                    ${(precio * cantidad * (1 - descuento / 100)).toFixed(2)}
                  </span>
                  <button
                    onClick={() => quitarProducto(id)}
                    className="text-red-600 hover:text-red-800 text-sm"
                    aria-label={`Quitar ${nombre}`}
                  >
                    &times;
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Panel Productos */}
      <section className="w-full md:w-2/4 p-4 flex flex-col flex-1 md:flex-none overflow-y-auto">
        <h2 className="text-xl font-semibold mb-4">Productos</h2>
        <input
          type="text"
          placeholder="Buscar por nombre o categoría"
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          className="mb-4 p-2 border rounded"
          aria-label="Buscar productos"
        />
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 flex-grow overflow-y-auto">
          {productosFiltrados.length === 0 ? (
            <p className="text-center text-gray-500 col-span-full mt-10">
              No se encontraron productos
            </p>
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
                  className="border rounded p-4 bg-white shadow hover:shadow-lg transition"
                  aria-label={`Agregar ${nombre}`}
                >
                  <h3 className="font-semibold">{nombre}</h3>
                  <p className="text-gray-600">${precio.toFixed(2)}</p>
                </button>
              );
            })
          )}
        </div>
      </section>

      {/* Panel Totales */}
      <section className="w-full md:w-1/4 p-4 flex flex-col flex-1 md:flex-none border-t md:border-t-0 md:border-l border-gray-300 overflow-y-auto">
        <h2 className="text-xl font-semibold mb-4">Totales</h2>
        <div className="flex flex-col gap-3 flex-grow justify-center text-lg font-medium">
          <div className="flex justify-between">
            <span>Total Bruto:</span>
            <span>${totalBruto.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-red-600">
            <span>Descuento:</span>
            <span>-${totalDescuento.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-green-700 font-bold text-xl">
            <span>Total Neto:</span>
            <span>${totalNeto.toFixed(2)}</span>
          </div>
          <button
            className="mt-6 py-3 bg-blue-700 text-white rounded hover:bg-blue-800 transition"
            onClick={() => setModalAbierto(true)}
          >
            Cobrar
          </button>
        </div>
      </section>
    </div>

  );
}
