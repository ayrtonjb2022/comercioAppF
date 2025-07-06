import { useState, useEffect } from "react";
import { getDetalleVentas } from "../api/webApi";
import {
  FaChartBar,
  FaMoneyBillWave,
  FaCreditCard,
  FaWallet,
  FaStar,
} from "react-icons/fa";

export default function VentasDetalle() {
  const [detalleVentas, setDetalleVentas] = useState([]);
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");
  const [productoTop, setProductoTop] = useState(null);
  const [totalVendido, setTotalVendido] = useState(0);
  const [totalGanancia, setTotalGanancia] = useState(0);
  const [totalPorMedioPago, setTotalPorMedioPago] = useState({});

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

        // Calcular total por medio de pago filtrado
        const totalesPorMedio = ventasFiltradas.reduce((acc, venta) => {
          const medio = venta.medio_pago?.toLowerCase() || "desconocido";
          const total = parseFloat(venta.total) || 0;
          acc[medio] = (acc[medio] || 0) + total;
          return acc;
        }, {});
        setTotalPorMedioPago(totalesPorMedio);

        const todasLasVentas = ventasFiltradas.flatMap(
          (venta) => venta.detalles || []
        );
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
      conteo[nombre] = (conteo[nombre] || 0) + item.cantidad;
    });
    const productoMasVendido = Object.entries(conteo).sort(
      (a, b) => b[1] - a[1]
    )[0];
    setProductoTop(productoMasVendido);
  };

  const calcularTotalVendido = (data) => {
    const total = data.reduce((acc, item) => {
      const descuentoPorcentaje = item.descuento || 0;
      const totalConDescuento =
        item.precio_unitario * item.cantidad * (1 - descuentoPorcentaje / 100);
      return acc + totalConDescuento;
    }, 0);
    setTotalVendido(total);
  };

  const calcularTotalGanancia = (data) => {
    const total = data.reduce((acc, item) => {
      const precioCompra = parseFloat(item.productos.precioCompra);
      const precioVenta = parseFloat(item.precio_unitario);
      const cantidad = item.cantidad;
      const descuento = item.descuento || 0;

      const totalVenta =
        precioVenta * cantidad * (1 - descuento / 100);
      const ganancia = totalVenta - precioCompra * cantidad;
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
      <div className="flex justify-between items-start mb-6 flex-wrap gap-4">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <FaChartBar /> Detalle de Ventas
        </h1>

        <div className="p-4 bg-gray-100 text-gray-800 font-semibold rounded shadow-md border border-black min-w-[250px]">
          <p className="mb-2 font-bold underline">Ingresos por medio de pago</p>
          <ul className="text-sm space-y-1">
            {Object.entries(totalPorMedioPago).map(([medio, monto]) => {
              let icono;
              switch (medio.toLowerCase()) {
                case "efectivo":
                  icono = <FaMoneyBillWave className="inline text-green-600 mr-1" />;
                  break;
                case "mercado_pago":
                  icono = <FaWallet className="inline text-blue-600 mr-1" />;
                  break;
                case "credito":
                case "debito":
                  icono = <FaCreditCard className="inline text-purple-600 mr-1" />;
                  break;
                default:
                  icono = <FaMoneyBillWave className="inline text-gray-500 mr-1" />;
              }

              return (
                <li key={medio} className="flex items-center">
                  {icono}
                  <span className="capitalize">{medio.replace("_", " ")}:</span>&nbsp;
                  {formatearMoneda(monto)}
                </li>
              );
            })}
          </ul>
        </div>
      </div>

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

      <div className="mb-4 grid md:grid-cols-3 gap-4">
        <div className="p-4 bg-green-100 text-green-900 font-semibold rounded shadow">
          Total vendido: {formatearMoneda(totalVendido)}
        </div>
        <div className="p-4 bg-blue-100 text-blue-900 font-semibold rounded shadow">
          Total ganancia: {formatearMoneda(totalGanancia)}
        </div>
      </div>

      <div
        className="overflow-x-auto border rounded shadow"
        style={{ maxHeight: "400px", overflowY: "auto" }}
      >
        <table className="min-w-full bg-white">
          <thead className="bg-gray-100 sticky top-0">
            <tr>
              <th className="text-left p-2 border">Producto</th>
              <th className="text-left p-2 border">Precio Compra</th>
              <th className="text-left p-2 border">Precio Venta</th>
              <th className="text-left p-2 border">Cantidad</th>
              <th className="text-left p-2 border">Descuento %</th>
              <th className="text-left p-2 border">Total Vendido</th>
              <th className="text-left p-2 border">Ganancia</th>
            </tr>
          </thead>
          <tbody>
            {detalleVentas.map((item) => {
              const precioCompra = parseFloat(item.productos.precioCompra);
              const precioVenta = parseFloat(item.precio_unitario);
              const cantidad = item.cantidad;
              const descuento = item.descuento || 0;

              const totalVenta =
                precioVenta * cantidad * (1 - descuento / 100);
              const ganancia = totalVenta - precioCompra * cantidad;

              return (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="p-2 border">{item.productos.nombre}</td>
                  <td className="p-2 border">{formatearMoneda(precioCompra)}</td>
                  <td className="p-2 border">{formatearMoneda(precioVenta)}</td>
                  <td className="p-2 border">{cantidad}</td>
                  <td className="p-2 border text-red-600 font-semibold">
                    {descuento}%
                  </td>
                  <td className="p-2 border">{formatearMoneda(totalVenta)}</td>
                  <td className="p-2 border text-green-700">
                    {formatearMoneda(ganancia)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
