import { useState, useEffect } from "react";
import { getDetalleVentas } from "../api/webApi";
import { FaSearch, FaStar, FaArrowUp, FaArrowDown, FaFilter, FaChartBar, FaTable } from "react-icons/fa";
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
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

export default function VentasDetalle() {
  const [detalleVentas, setDetalleVentas] = useState([]);
  const [ventasCompletas, setVentasCompletas] = useState([]);
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
  const [vistaActiva, setVistaActiva] = useState("graficos");
  const [productosMasVendidos, setProductosMasVendidos] = useState([]);
  const [categoriaDistribucion, setCategoriaDistribucion] = useState([]);

  // Colores para gráficos
  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#f97316'];

  useEffect(() => {
    const fetchVentas = async () => {
      setCargando(true);
      try {
        const res = await getDetalleVentas();
        if (!res || !res.ventas) {
          throw new Error("No se encontraron ventas.");
        }

        // Guardar las ventas completas para procesamiento
        setVentasCompletas(res.ventas);
        
        let ventasFiltradas = res.ventas;

        // Aplicar filtros de fecha
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
        
        // Procesar datos para gráficos
        procesarDatosParaGraficos(ventasFiltradas, todasLasVentas);
        
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

  const procesarDatosParaGraficos = (ventasFiltradas, detallesVentas) => {
    // 1. Procesar datos para gráfico de tendencia (por fecha)
    const datosPorFecha = {};
    
    ventasFiltradas.forEach(venta => {
      const fecha = new Date(venta.fecha).toLocaleDateString('es-ES', { 
        weekday: 'short',
        day: 'numeric',
        month: 'short'
      });
      
      if (!datosPorFecha[fecha]) {
        datosPorFecha[fecha] = { ventas: 0, ganancias: 0 };
      }
      
      // Calcular total de venta y ganancias para esta venta
      let totalVenta = 0;
      let totalGananciaVenta = 0;
      
      venta.detalles?.forEach(detalle => {
        const precioCompra = parseFloat(detalle.productos.precioCompra);
        const precioVenta = parseFloat(detalle.precio_unitario);
        const cantidad = detalle.cantidad;
        const descuento = detalle.descuento || 0;

        const totalConDescuento = precioVenta * cantidad * (1 - descuento / 100);
        const ganancia = totalConDescuento - (precioCompra * cantidad);
        
        totalVenta += totalConDescuento;
        totalGananciaVenta += ganancia;
      });
      
      datosPorFecha[fecha].ventas += totalVenta;
      datosPorFecha[fecha].ganancias += totalGananciaVenta;
    });

    const datosTendencia = Object.entries(datosPorFecha).map(([fecha, datos]) => ({
      dia: fecha,
      ventas: datos.ventas,
      ganancias: datos.ganancias
    })).sort((a, b) => new Date(a.dia) - new Date(b.dia));

    setDatosGrafico(datosTendencia);

    // Calcular tendencia real
    if (datosTendencia.length > 1) {
      const ventasIniciales = datosTendencia[0].ventas;
      const ventasFinales = datosTendencia[datosTendencia.length - 1].ventas;
      const diferencia = ventasFinales - ventasIniciales;
      const porcentaje = ventasIniciales > 0 ? (diferencia / ventasIniciales) * 100 : 0;
      
      setTendencia({
        tipo: diferencia > 0 ? "positive" : diferencia < 0 ? "negative" : "neutral",
        porcentaje: Math.abs(porcentaje).toFixed(1)
      });
    }

    // 2. Procesar productos más vendidos
    const productosMap = {};
    
    detallesVentas.forEach(item => {
      const nombre = item.productos.nombre;
      const precioCompra = parseFloat(item.productos.precioCompra);
      const precioVenta = parseFloat(item.precio_unitario);
      const cantidad = item.cantidad;
      const descuento = item.descuento || 0;

      if (!productosMap[nombre]) {
        productosMap[nombre] = {
          nombre: nombre,
          ventas: 0,
          ganancia: 0
        };
      }
      
      const totalVenta = precioVenta * cantidad * (1 - descuento / 100);
      const ganancia = totalVenta - (precioCompra * cantidad);
      
      productosMap[nombre].ventas += cantidad;
      productosMap[nombre].ganancia += ganancia;
    });

    const topProductos = Object.values(productosMap)
      .sort((a, b) => b.ventas - a.ventas)
      .slice(0, 5);
    
    setProductosMasVendidos(topProductos);

    // 3. Procesar distribución por categoría (si existe el campo categoría)
    const categoriasMap = {};
    
    detallesVentas.forEach(item => {
      const categoria = item.productos.categoria || "Sin categoría";
      const totalVenta = parseFloat(item.precio_unitario) * item.cantidad * (1 - (item.descuento || 0) / 100);
      
      categoriasMap[categoria] = (categoriasMap[categoria] || 0) + totalVenta;
    });

    const distribucionCategorias = Object.entries(categoriasMap).map(([name, value]) => ({
      name,
      value: parseFloat(value.toFixed(2))
    })).sort((a, b) => b.value - a.value);
    
    setCategoriaDistribucion(distribucionCategorias);
  };

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
      (item.fecha && item.fecha.toLowerCase().includes(searchLower)) ||
      (item.productos.categoria && item.productos.categoria.toLowerCase().includes(searchLower))
    );
  });

  // Formatear para el gráfico
  const formatearParaGrafico = (numero) => {
    if (numero >= 1000000) return `$${(numero / 1000000).toFixed(1)}M`;
    if (numero >= 1000) return `$${(numero / 1000).toFixed(1)}K`;
    return `$${numero}`;
  };

  // Custom Tooltip para gráficos
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-800">{`${label}`}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {`${entry.name}: ${formatearMoneda(entry.value)}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
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
        <h1 className="text-2xl font-bold text-gray-800">Análisis de Ventas</h1>
        <p className="text-gray-600 mt-1">Dashboard completo para análisis de rendimiento comercial</p>
      </div>

      {/* Selector de Vista */}
      <div className="bg-white p-2 rounded-xl shadow mb-6 inline-flex">
        <button
          onClick={() => setVistaActiva("graficos")}
          className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
            vistaActiva === "graficos" 
              ? "bg-blue-500 text-white shadow-md" 
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          <FaChartBar />
          Gráficos
        </button>
        <button
          onClick={() => setVistaActiva("tabla")}
          className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
            vistaActiva === "tabla" 
              ? "bg-blue-500 text-white shadow-md" 
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          <FaTable />
          Tabla de Datos
        </button>
      </div>

      {/* Barra de búsqueda y filtros */}
      <div className="bg-white p-4 rounded-xl shadow mb-6">
        <div className="flex items-center gap-2 mb-4">
          <FaFilter className="text-gray-400" />
          <span className="font-semibold text-gray-700">Filtros y Búsqueda</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Buscar producto, categoría o fecha..."
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

          <div className="flex items-end">
            <button 
              onClick={() => {
                setDesde("");
                setHasta("");
                setSearchTerm("");
              }}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-md transition-colors"
            >
              Limpiar Filtros
            </button>
          </div>
        </div>
      </div>

      {/* Métricas Principales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-xl shadow-lg">
          <div className="text-sm opacity-90">Venta Total</div>
          <div className="text-2xl font-bold mt-1">{formatearMoneda(totalVendido)}</div>
          <div className="text-xs mt-2 opacity-80">Período seleccionado</div>
        </div>
        
        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-xl shadow-lg">
          <div className="text-sm opacity-90">Ganancia Total</div>
          <div className="text-2xl font-bold mt-1">{formatearMoneda(totalGanancia)}</div>
          <div className="text-xs mt-2 opacity-80">
            {totalVendido > 0 ? `Margen: ${((totalGanancia / totalVendido) * 100).toFixed(1)}%` : 'Sin datos'}
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-4 rounded-xl shadow-lg">
          <div className="text-sm opacity-90">Transacciones</div>
          <div className="text-2xl font-bold mt-1">{detalleVentas.length}</div>
          <div className="text-xs mt-2 opacity-80">Ventas registradas</div>
        </div>
        
        {productoTop && (
          <div className="bg-gradient-to-r from-amber-500 to-amber-600 text-white p-4 rounded-xl shadow-lg">
            <div className="flex items-center gap-2">
              <FaStar className="text-yellow-300" />
              <div className="text-sm opacity-90">Producto Top</div>
            </div>
            <div className="text-lg font-bold mt-1 truncate">{productoTop[0]}</div>
            <div className="text-xs mt-2 opacity-80">{productoTop[1]} unidades vendidas</div>
          </div>
        )}
      </div>

      {/* Vista de Gráficos */}
      {vistaActiva === "graficos" && (
        <div className="space-y-6">
          {/* Gráfico de Tendencia */}
          <div className="bg-white p-6 rounded-xl shadow">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-gray-800">Tendencia de Ventas</h2>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Tendencia:</span>
                {tendencia.tipo === "positive" ? (
                  <span className="text-green-600 flex items-center">
                    <FaArrowUp className="mr-1" /> {tendencia.porcentaje}%
                  </span>
                ) : tendencia.tipo === "negative" ? (
                  <span className="text-red-600 flex items-center">
                    <FaArrowDown className="mr-1" /> {tendencia.porcentaje}%
                  </span>
                ) : (
                  <span className="text-gray-500">Estable</span>
                )}
              </div>
            </div>
            
            {datosGrafico.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={datosGrafico}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="dia" />
                    <YAxis tickFormatter={formatearParaGrafico} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="ventas" 
                      name="Ventas" 
                      stroke="#3b82f6" 
                      strokeWidth={3}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }} 
                    />
                    <Line 
                      type="monotone" 
                      dataKey="ganancias" 
                      name="Ganancias" 
                      stroke="#10b981" 
                      strokeWidth={3}
                      dot={{ r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-500">
                No hay datos para mostrar en el período seleccionado
              </div>
            )}
          </div>

          {/* Gráficos Secundarios */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Productos Más Vendidos */}
            <div className="bg-white p-6 rounded-xl shadow">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Productos Más Vendidos</h3>
              {productosMasVendidos.length > 0 ? (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={productosMasVendidos}
                      layout="vertical"
                      margin={{ left: 100 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis type="number" tickFormatter={formatearParaGrafico} />
                      <YAxis 
                        type="category" 
                        dataKey="nombre" 
                        width={90}
                        tick={{ fontSize: 12 }}
                      />
                      <Tooltip formatter={(value) => [value, 'Unidades']} />
                      <Legend />
                      <Bar 
                        dataKey="ventas" 
                        name="Unidades Vendidas" 
                        fill="#3b82f6" 
                        radius={[0, 4, 4, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center text-gray-500">
                  No hay datos de productos
                </div>
              )}
            </div>

            {/* Distribución por Categoría */}
            <div className="bg-white p-6 rounded-xl shadow">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Distribución por Categoría</h3>
              {categoriaDistribucion.length > 0 ? (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoriaDistribucion}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {categoriaDistribucion.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [formatearMoneda(value), 'Ventas']} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center text-gray-500">
                  No hay datos de categorías
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Vista de Tabla */}
      {vistaActiva === "tabla" && (
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">Detalle de Ventas</h2>
            <p className="text-sm text-gray-600">
              Mostrando {filteredVentas.length} de {detalleVentas.length} transacciones
            </p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Producto</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoría</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Precio Compra</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cantidad</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Precio Unit.</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descuento</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ganancia</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Margen</th>
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
                    const margen = totalVenta > 0 ? (ganancia / totalVenta) * 100 : 0;

                    return (
                      <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(item.fecha).toLocaleDateString('es-ES')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {item.productos.nombre}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {item.productos.categoria || "Sin categoría"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatearMoneda(precioCompra) || "N/A"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                            {cantidad}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatearMoneda(precioVenta)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {descuento > 0 ? `${descuento}%` : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {formatearMoneda(totalVenta)}
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                          ganancia >= 0 ? "text-green-600" : "text-red-600"
                        }`}>
                          {formatearMoneda(ganancia)}
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                          margen >= 0 ? "text-green-600" : "text-red-600"
                        }`}>
                          {margen.toFixed(1)}%
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="10" className="px-6 py-8 text-center">
                      <div className="text-gray-500">
                        <FaSearch className="mx-auto text-3xl mb-2 opacity-50" />
                        <p>No se encontraron ventas con los filtros seleccionados</p>
                        <button 
                          onClick={() => {
                            setDesde("");
                            setHasta("");
                            setSearchTerm("");
                          }}
                          className="mt-2 text-blue-500 hover:text-blue-700 text-sm"
                        >
                          Limpiar filtros
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}