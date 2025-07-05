import { useState, useEffect } from "react";
import { FaChartBar, FaStar } from "react-icons/fa";
import { getDetalleVentas } from "../api/webApi";

export default function VentasDetalle() {
  const [detalleVentas, setDetalleVentas] = useState([]);
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");
  const [productoTop, setProductoTop] = useState(null);
  const [totalVendido, setTotalVendido] = useState(0);
  const [totalGanancia, setTotalGanancia] = useState(0);

  useEffect(() => {
    const fetchVentas = async () => {
      try {
        const res = await getDetalleVentas();
        
        if (!res || !res.ventas) {
          console.warn("No se encontraron ventas");
          return;
        }

        let ventasFiltradas = res.ventas;

        if (desde) {
          const desdeDate = new Date(desde);
          ventasFiltradas = ventasFiltradas.filter(
            (v) => new Date(v.fecha) >= desdeDate
          );
        }

        if (hasta) {
          const hastaDate = new Date(hasta);
          hastaDate.setDate(hastaDate.getDate() + 1);
          ventasFiltradas = ventasFiltradas.filter(
            (v) => new Date(v.fecha) < hastaDate
          );
        }

        const todasLasVentas = ventasFiltradas.flatMap((venta) => venta.detalles || []);
        setDetalleVentas(todasLasVentas);
        calcularProductoTop(todasLasVentas);
        calcularTotalVendido(todasLasVentas);
        calcularTotalGanancia(todasLasVentas);
      } catch (error) {
        console.error("Error al obtener las ventas:", error);
      }
    };

    fetchVentas();
  }, [desde, hasta]);

  const calcularProductoTop = (data) => {
    const conteo = {};
    data.forEach((item) => {
      const nombre = item.productos.nombre;
      if (!conteo[nombre]) {
        conteo[nombre] = item.cantidad;
      } else {
        conteo[nombre] += item.cantidad;
      }
    });
    const productoMasVendido = Object.entries(conteo).sort((a, b) => b[1] - a[1])[0];
    setProductoTop(productoMasVendido);
  };

  const calcularTotalVendido = (data) => {
    const total = data.reduce((acc, item) => acc + item.total, 0);
    setTotalVendido(total);
  };

  const calcularTotalGanancia = (data) => {
    const total = data.reduce((acc, item) => {
      const precioCompra = parseFloat(item.productos.precioCompra);
      const precioVenta = parseFloat(item.precio_unitario);
      const cantidad = item.cantidad;
      const ganancia = (precioVenta - precioCompra) * cantidad;
      return acc + ganancia;
    }, 0);
    setTotalGanancia(total);
  };

  const formatearMoneda = (valor) =>
    valor.toLocaleString("es-AR", {
      style: "currency",
      currency: "ARS",
    });

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4 flex items-center gap-2">
        <FaChartBar /> Detalle de Ventas
      </h1>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div>
          <label className="block text-sm font-semibold">Desde:</label>
          <input
            type="date"
            value={desde}
            onChange={(e) => setDesde(e.target.value)}
            className="border rounded px-2 py-1"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold">Hasta:</label>
          <input
            type="date"
            value={hasta}
            onChange={(e) => setHasta(e.target.value)}
            className="border rounded px-2 py-1"
          />
        </div>
      </div>

      {productoTop && (
        <div className="bg-yellow-100 text-yellow-800 p-4 mb-4 rounded shadow flex items-center gap-2">
          <FaStar className="text-yellow-500" />
          Producto más vendido: <strong>{productoTop[0]}</strong> ({productoTop[1]} unidades)
        </div>
      )}

      {/* Totales arriba */}
      <div className="mb-4 flex gap-6">
        <div className="flex-1 p-4 bg-green-100 text-green-900 font-semibold rounded shadow">
          Total vendido: {formatearMoneda(totalVendido)}
        </div>
        <div className="flex-1 p-4 bg-blue-100 text-blue-900 font-semibold rounded shadow">
          Total ganancia: {formatearMoneda(totalGanancia)}
        </div>
      </div>

      <div className="overflow-x-auto border rounded shadow" style={{ maxHeight: "400px", overflowY: "auto" }}>
        <table className="min-w-full bg-white">
          <thead className="bg-gray-100 sticky top-0">
            <tr>
              <th className="text-left p-2 border">Producto</th>
              <th className="text-left p-2 border">Precio Compra</th>
              <th className="text-left p-2 border">Precio Venta</th>
              <th className="text-left p-2 border">Cantidad</th>
              <th className="text-left p-2 border">Total Vendido</th>
              <th className="text-left p-2 border">Ganancia</th>
            </tr>
          </thead>
          <tbody>
            {detalleVentas.map((item) => {
              const precioCompra = parseFloat(item.productos.precioCompra);
              const precioVenta = parseFloat(item.precio_unitario);
              const cantidad = item.cantidad;
              const totalVenta = precioVenta * cantidad;
              const ganancia = (precioVenta - precioCompra) * cantidad;

              return (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="p-2 border">{item.productos.nombre}</td>
                  <td className="p-2 border">{formatearMoneda(precioCompra)}</td>
                  <td className="p-2 border">{formatearMoneda(precioVenta)}</td>
                  <td className="p-2 border">{cantidad}</td>
                  <td className="p-2 border">{formatearMoneda(totalVenta)}</td>
                  <td className="p-2 border text-green-700">{formatearMoneda(ganancia)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
