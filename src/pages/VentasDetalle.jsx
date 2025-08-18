import { useState, useEffect } from "react";
import { getDetalleVentas } from "../api/webApi";
import { FaSearch, FaStar, FaArrowUp, FaArrowDown } from "react-icons/fa";
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';

export default function VentasDetalle() {
  const [detalleVentas, setDetalleVentas] = useState([]);
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");
  const [productoTop, setProductoTop] = useState(null);
  const [totalVendido, setTotalVendido] = useState(0);
  const [totalGanancia, setTotalGanancia] = useState(0);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [datosGrafico, setDatosGrafico] = useState([]);
  const [tendencia, setTendencia] = useState("neutral");

  // Generar datos de ejemplo para el gráfico
  useEffect(() => {
    const datosEjemplo = [
      { dia: "Lun", ventas: 12000, ganancias: 4500 },
      { dia: "Mar", ventas: 19000, ganancias: 7200 },
      { dia: "Mié", ventas: 15000, ganancias: 5800 },
      { dia: "Jue", ventas: 22000, ganancias: 8900 },
      { dia: "Vie", ventas: 28000, ganancias: 11500 },
      { dia: "Sáb", ventas: 35000, ganancias: 14200 },
      { dia: "Dom", ventas: 18000, ganancias: 6800 },
    ];
    setDatosGrafico(datosEjemplo);
    
    // Calcular tendencia
    const ventasIniciales = datosEjemplo[0].ventas;
    const ventasFinales = datosEjemplo[datosEjemplo.length - 1].ventas;
    setTendencia(ventasFinales > ventasIniciales ? "positive" : ventasFinales < ventasIniciales ? "negative" : "neutral");
  }, []);

  useEffect(() => {
    const fetchVentas = async () => {
      setCargando(true);
      try {
        const res = await getDetalleVentas();
        if (!res || !res.ventas) {
          throw new Error("No se encontraron ventas.");
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

        const todasLasVentas = ventasFiltradas.flatMap(
          (venta) => venta.detalles || []
        );
        setDetalleVentas(todasLasVentas);
        calcularProductoTop(todasLasVentas);
        calcularTotalVendido(todasLasVentas);
        calcularTotalGanancia(todasLasVentas);
      } catch (error) {
        console.error("Error al obtener las ventas:", error);
        setError("Hubo un error al obtener las ventas.");
        setTimeout(() => setError(""), 30000);
      } finally {
        setCargando(false);
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

      const totalVenta = precioVenta * cantidad * (1 - descuento / 100);
      const ganancia = totalVenta - precioCompra * cantidad;
      return acc + ganancia;
    }, 0);
    setTotalGanancia(total);
  };

  const formatearMoneda = (valor) =>
    valor.toLocaleString("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });

  // Filtrar ventas según término de búsqueda
  const filteredVentas = detalleVentas.filter((item) => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      (item.productos.nombre && item.productos.nombre.toLowerCase().includes(searchLower)) ||
      (item.fecha && item.fecha.toLowerCase().includes(searchLower))
    );
  });

  // Formatear para el gráfico
  const formatearParaGrafico = (numero) => {
    if (numero >= 1000000) return `$${(numero / 1000000).toFixed(1)}M`;
    if (numero >= 1000) return `$${(numero / 1000).toFixed(1)}K`;
    return `$${numero}`;
  };

  return (
    <div className="p-6 relative min-h-screen bg-gray-50">
      {/* Overlay de carga */}
      {cargando && (
        <div className="fixed inset-0 bg-white bg-opacity-70 z-40 flex items-center justify-center pointer-events-auto">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500 border-solid"></div>
        </div>
      )}

      {/* Mensaje de error */}
      {error && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-4 py-2 rounded shadow z-50">
          {error}
        </div>
      )}

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Detalle de Ventas</h1>
        <p className="text-gray-600 mt-1">Gestión detallada de transacciones de ventas</p>
      </div>

      {/* Gráfico profesional con recharts */}
      <div className="bg-white p-6 rounded-xl shadow mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-gray-800">Rendimiento de Ventas</h2>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Tendencia:</span>
            {tendencia === "positive" ? (
              <span className="text-green-600 flex items-center">
                <FaArrowUp className="mr-1" /> 12.5%
              </span>
            ) : tendencia === "negative" ? (
              <span className="text-red-600 flex items-center">
                <FaArrowDown className="mr-1" /> 5.3%
              </span>
            ) : (
              <span className="text-gray-500">Estable</span>
            )}
          </div>
        </div>
        
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={datosGrafico}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="dia" 
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                tickFormatter={formatearParaGrafico}
                tick={{ fontSize: 12 }}
              />
              <Tooltip 
                formatter={(value) => [formatearMoneda(value), '']}
                labelFormatter={(label) => `Día: ${label}`}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="ventas" 
                name="Ventas" 
                stroke="#3b82f6" 
                strokeWidth={2}
                activeDot={{ r: 8 }} 
              />
              <Line 
                type="monotone" 
                dataKey="ganancias" 
                name="Ganancias" 
                stroke="#10b981" 
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Barra de búsqueda y filtros */}
      <div className="bg-white p-4 rounded-xl shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Buscar por producto, categoría o fecha"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Desde:</label>
            <input
              type="date"
              value={desde}
              onChange={(e) => setDesde(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Hasta:</label>
            <input
              type="date"
              value={hasta}
              onChange={(e) => setHasta(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Producto más vendido y estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {productoTop && (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-4 rounded-xl shadow-sm flex items-center gap-3">
            <FaStar className="text-yellow-500 text-xl flex-shrink-0" />
            <div>
              <div className="font-medium">Producto más vendido</div>
              <div className="font-bold truncate">{productoTop[0]}</div>
              <div className="text-sm">{productoTop[1]} unidades</div>
            </div>
          </div>
        )}
        
        <div className="bg-white p-4 rounded-xl shadow border border-gray-200">
          <div className="text-sm text-gray-500">Venta total</div>
          <div className="text-xl font-semibold text-gray-800">{formatearMoneda(totalVendido)}</div>
        </div>
        
        <div className="bg-white p-4 rounded-xl shadow border border-gray-200">
          <div className="text-sm text-gray-500">Ganancia total</div>
          <div className="text-xl font-semibold text-gray-800">{formatearMoneda(totalGanancia)}</div>
        </div>
        
        <div className="bg-white p-4 rounded-xl shadow border border-gray-200">
          <div className="text-sm text-gray-500">Transacciones</div>
          <div className="text-xl font-semibold text-gray-800">{detalleVentas.length}</div>
        </div>
      </div>

      {/* Tabla de ventas */}
      <div className="overflow-x-auto border border-gray-200 rounded-xl shadow bg-white">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Producto</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Referencia</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cantidad</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Precio Unit.</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ganancia</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredVentas.length > 0 ? (
              filteredVentas.map((item) => {
                const precioCompra = parseFloat(item.productos.precioCompra);
                const precioVenta = parseFloat(item.precio_unitario);
                const cantidad = item.cantidad;
                const descuento = item.descuento || 0;

                const totalVenta = precioVenta * cantidad * (1 - descuento / 100);
                const ganancia = totalVenta - precioCompra * cantidad;

                return (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.fecha}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {item.productos.nombre}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatearMoneda(precioCompra) || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{cantidad}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatearMoneda(precioVenta)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatearMoneda(totalVenta)}
                    </td>
                    <td
                      className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                        ganancia >= 0 ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {formatearMoneda(ganancia)}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="7" className="px-6 py-4 text-center text-sm text-gray-500">
                  No se encontraron ventas con los filtros seleccionados
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}