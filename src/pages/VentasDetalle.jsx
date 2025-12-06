import { useState, useEffect, useMemo, useRef } from "react";
import { getDetalleVentas } from "../api/webApi";
import { 
  FaSearch, 
  FaStar, 
  FaArrowUp, 
  FaArrowDown, 
  FaFilter, 
  FaChartBar, 
  FaTable,
  FaMoneyBillWave,
  FaChartLine,
  FaBox,
  FaTags,
  FaCalendarAlt,
  FaDownload,
  FaShoppingCart,
  FaExclamationTriangle,
  FaFileExcel,
  FaFilePdf,
  FaCrown,
  FaPercent
} from "react-icons/fa";
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
  Cell,
  AreaChart,
  Area
} from 'recharts';
import * as XLSX from 'xlsx';

// Opción 1: Usar jsPDF sin autotable (más simple)
let jsPDF;
let autoTable;

// Cargar jsPDF dinámicamente para evitar problemas de SSR
if (typeof window !== 'undefined') {
  import('jspdf').then(module => {
    jsPDF = module.default;
  });
  
  // Intentar cargar autotable, pero si falla, usaremos nuestro propio método
  import('jspdf-autotable').then(module => {
    autoTable = module.default;
  }).catch(() => {
    console.log('jspdf-autotable no disponible, usando método alternativo');
  });
}

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
  const [tendencia, setTendencia] = useState({ tipo: "neutral", porcentaje: 0 });
  const [vistaActiva, setVistaActiva] = useState("graficos");
  const [productosMasVendidos, setProductosMasVendidos] = useState([]);
  const [categoriaDistribucion, setCategoriaDistribucion] = useState([]);
  const [productosTopGanancia, setProductosTopGanancia] = useState([]);
  const [ventasAgrupadas, setVentasAgrupadas] = useState([]);

  // Paleta de colores mejorada
  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#f97316'];
  const GRADIENT_COLORS = {
    ventas: { start: '#3b82f6', end: '#1d4ed8' },
    ganancias: { start: '#10b981', end: '#047857' }
  };

  // Función para parsear fechas de forma segura
  const parsearFecha = (fechaString) => {
    if (!fechaString) return new Date();
    
    if (fechaString instanceof Date) return fechaString;
    
    try {
      // Manejar diferentes formatos de fecha
      let fecha;
      
      // Formato ISO con Z (UTC)
      if (fechaString.includes('T') && fechaString.includes('Z')) {
        fecha = new Date(fechaString);
      } 
      // Formato YYYY-MM-DD
      else if (fechaString.match(/^\d{4}-\d{2}-\d{2}$/)) {
        fecha = new Date(fechaString + 'T00:00:00');
      } 
      // Otros formatos
      else {
        fecha = new Date(fechaString);
      }
      
      if (isNaN(fecha.getTime())) {
        console.warn('Fecha inválida:', fechaString);
        return new Date();
      }
      return fecha;
    } catch (error) {
      console.error('Error al parsear fecha:', fechaString, error);
      return new Date();
    }
  };

  // Formatear fecha para mostrar
  const formatearFechaMostrar = (fecha) => {
    const fechaObj = parsearFecha(fecha);
    return fechaObj.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Formatear fecha para gráficos
  const formatearFechaGrafico = (fecha) => {
    const fechaObj = parsearFecha(fecha);
    return fechaObj.toLocaleDateString('es-ES', {
      weekday: 'short',
      day: 'numeric',
      month: 'short'
    });
  };

  // Obtener ventas
  useEffect(() => {
    const fetchVentas = async () => {
      setCargando(true);
      try {
        const res = await getDetalleVentas();
        if (!res || !res.ventas) {
          throw new Error("No se encontraron ventas.");
        }

        setVentasCompletas(res.ventas);
        
        let ventasFiltradas = res.ventas;

        // Aplicar filtros de fecha - CORREGIDO
        if (desde) {
          const desdeDate = parsearFecha(desde);
          desdeDate.setHours(0, 0, 0, 0);
          ventasFiltradas = ventasFiltradas.filter(v => {
            if (!v.fecha) return false;
            const fechaVenta = parsearFecha(v.fecha);
            return fechaVenta >= desdeDate;
          });
        }

        if (hasta) {
          const hastaDate = parsearFecha(hasta);
          hastaDate.setHours(23, 59, 59, 999);
          ventasFiltradas = ventasFiltradas.filter(v => {
            if (!v.fecha) return false;
            const fechaVenta = parsearFecha(v.fecha);
            return fechaVenta <= hastaDate;
          });
        }

        // Procesar ventas completas para la tabla
        const todasLasVentas = [];
        const ventasAgrupadasData = [];

        ventasFiltradas.forEach(venta => {
          if (venta.detalles && venta.detalles.length > 0) {
            venta.detalles.forEach(detalle => {
              todasLasVentas.push({
                ...detalle,
                fechaVenta: venta.fecha,
                medioPago: venta.medio_pago,
                idVenta: venta.id,
                cajaId: venta.cajaId,
                totalVenta: venta.total
              });
            });
          }
          
          ventasAgrupadasData.push({
            id: venta.id,
            fecha: venta.fecha,
            medioPago: venta.medio_pago,
            total: venta.total,
            cajaId: venta.cajaId,
            detalles: venta.detalles || []
          });
        });

        setDetalleVentas(todasLasVentas);
        setVentasAgrupadas(ventasAgrupadasData);
        calcularProductoTop(todasLasVentas);
        calcularTotalVendido(todasLasVentas);
        calcularTotalGanancia(todasLasVentas);
        
        procesarDatosParaGraficos(ventasFiltradas, todasLasVentas);
        
      } catch (error) {
        console.error("Error al obtener las ventas:", error);
        setError("Hubo un error al obtener las ventas.");
        setTimeout(() => setError(""), 5000);
      } finally {
        setCargando(false);
      }
    };

    fetchVentas();
  }, [desde, hasta]);

  const procesarDatosParaGraficos = (ventasFiltradas, detallesVentas) => {
    // 1. Procesar datos para gráfico de tendencia
    const datosPorFecha = {};
    
    ventasFiltradas.forEach(venta => {
      if (!venta.fecha) return;
      
      const fecha = parsearFecha(venta.fecha);
      const fechaKey = fecha.toISOString().split('T')[0];
      
      if (!datosPorFecha[fechaKey]) {
        datosPorFecha[fechaKey] = { 
          fecha: fechaKey,
          dia: formatearFechaGrafico(venta.fecha),
          ventas: 0, 
          ganancias: 0,
          transacciones: 0
        };
      }
      
      datosPorFecha[fechaKey].ventas += parseFloat(venta.total) || 0;
      datosPorFecha[fechaKey].transacciones += 1;
      
      if (venta.detalles) {
        venta.detalles.forEach(detalle => {
          const precioCompra = parseFloat(detalle.productos?.precioCompra) || 0;
          const precioVenta = parseFloat(detalle.precio_unitario) || 0;
          const cantidad = detalle.cantidad || 0;
          const descuento = detalle.descuento || 0;

          const totalConDescuento = precioVenta * cantidad * (1 - descuento / 100);
          const ganancia = totalConDescuento - (precioCompra * cantidad);
          
          datosPorFecha[fechaKey].ganancias += ganancia;
        });
      }
    });

    const datosTendencia = Object.values(datosPorFecha)
      .sort((a, b) => new Date(a.fecha) - new Date(b.fecha))
      .slice(-10);

    setDatosGrafico(datosTendencia);

    // Calcular tendencia
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
      const nombre = item.productos?.nombre || "Producto desconocido";
      const precioCompra = parseFloat(item.productos?.precioCompra) || 0;
      const precioVenta = parseFloat(item.precio_unitario) || 0;
      const cantidad = item.cantidad || 0;
      const descuento = item.descuento || 0;

      if (!productosMap[nombre]) {
        productosMap[nombre] = {
          nombre: nombre,
          ventas: 0,
          ganancia: 0,
          unidades: 0
        };
      }
      
      const totalVenta = precioVenta * cantidad * (1 - descuento / 100);
      const ganancia = totalVenta - (precioCompra * cantidad);
      
      productosMap[nombre].ventas += totalVenta;
      productosMap[nombre].ganancia += ganancia;
      productosMap[nombre].unidades += cantidad;
    });

    const topProductosVentas = Object.values(productosMap)
      .sort((a, b) => b.unidades - a.unidades)
      .slice(0, 6);
    
    setProductosMasVendidos(topProductosVentas);

    const topProductosGanancia = Object.values(productosMap)
      .sort((a, b) => b.ganancia - a.ganancia)
      .slice(0, 6);
    
    setProductosTopGanancia(topProductosGanancia);

    // 3. Procesar distribución por categoría
    const categoriasMap = {};
    
    detallesVentas.forEach(item => {
      const categoria = item.productos?.categoria || "Sin categoría";
      const totalVenta = parseFloat(item.precio_unitario) * (item.cantidad || 0) * (1 - (item.descuento || 0) / 100);
      
      categoriasMap[categoria] = (categoriasMap[categoria] || 0) + totalVenta;
    });

    const distribucionCategorias = Object.entries(categoriasMap).map(([name, value], index) => ({
      name,
      value: parseFloat(value.toFixed(2)),
      color: COLORS[index % COLORS.length]
    })).sort((a, b) => b.value - a.value);
    
    setCategoriaDistribucion(distribucionCategorias);
  };

  const calcularProductoTop = (data) => {
    const conteo = {};
    data.forEach((item) => {
      const nombre = item.productos?.nombre || "Producto desconocido";
      conteo[nombre] = (conteo[nombre] || 0) + (item.cantidad || 0);
    });
    const productoMasVendido = Object.entries(conteo).sort(
      (a, b) => b[1] - a[1]
    )[0];
    setProductoTop(productoMasVendido);
  };

  const calcularTotalVendido = (data) => {
    const total = data.reduce((acc, item) => {
      const precioVenta = parseFloat(item.precio_unitario) || 0;
      const cantidad = item.cantidad || 0;
      const descuento = item.descuento || 0;
      return acc + (precioVenta * cantidad * (1 - descuento / 100));
    }, 0);
    setTotalVendido(total);
  };

  const calcularTotalGanancia = (data) => {
    const total = data.reduce((acc, item) => {
      const precioCompra = parseFloat(item.productos?.precioCompra) || 0;
      const precioVenta = parseFloat(item.precio_unitario) || 0;
      const cantidad = item.cantidad || 0;
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

  const formatearNumero = (valor) => 
    valor.toLocaleString("es-AR", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });

  // Memoized filtered ventas para mejor rendimiento
  const filteredVentas = useMemo(() => {
    if (!searchTerm) return detalleVentas;
    const searchLower = searchTerm.toLowerCase();
    return detalleVentas.filter((item) => {
      const nombre = item.productos?.nombre || "";
      const categoria = item.productos?.categoria || "";
      return (
        nombre.toLowerCase().includes(searchLower) ||
        categoria.toLowerCase().includes(searchLower)
      );
    });
  }, [detalleVentas, searchTerm]);

  // Calcular métricas adicionales
  const margenPromedio = totalVendido > 0 ? (totalGanancia / totalVendido) * 100 : 0;
  const promedioVenta = ventasAgrupadas.length > 0 ? totalVendido / ventasAgrupadas.length : 0;
  const promedioGanancia = ventasAgrupadas.length > 0 ? totalGanancia / ventasAgrupadas.length : 0;

  // Custom Tooltip para gráficos
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-900 text-white p-3 rounded-lg shadow-xl border border-gray-700">
          <p className="font-semibold mb-2">{label}</p>
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center justify-between gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: entry.color }}
                />
                <span>{entry.name}:</span>
              </div>
              <span className="font-medium">
                {formatearMoneda(entry.value)}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  const PieTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const total = categoriaDistribucion.reduce((a, b) => a + b.value, 0);
      const porcentaje = total > 0 ? ((payload[0].value / total) * 100).toFixed(1) : 0;
      return (
        <div className="bg-gray-900 text-white p-3 rounded-lg shadow-xl">
          <p className="font-semibold">{payload[0].name}</p>
          <p className="text-sm">{formatearMoneda(payload[0].value)}</p>
          <p className="text-xs text-gray-300 mt-1">
            {porcentaje}% del total
          </p>
        </div>
      );
    }
    return null;
  };

  // Exportar a Excel
  const exportarExcel = () => {
    try {
      const datosExcel = ventasAgrupadas.map(venta => {
        const fecha = parsearFecha(venta.fecha);
        return {
          'ID Venta': venta.id,
          'Fecha': fecha.toLocaleDateString('es-ES'),
          'Hora': fecha.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
          'Medio de Pago': venta.medioPago,
          'Total Venta': venta.total,
          'Caja ID': venta.cajaId,
          'Cantidad de Productos': venta.detalles.length
        };
      });

      const ws = XLSX.utils.json_to_sheet(datosExcel);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Ventas");
      
      // Estilos para el Excel
      const wscols = [
        { wch: 10 }, // ID Venta
        { wch: 12 }, // Fecha
        { wch: 10 }, // Hora
        { wch: 15 }, // Medio de Pago
        { wch: 12 }, // Total Venta
        { wch: 8 },  // Caja ID
        { wch: 18 }, // Cantidad de Productos
      ];
      ws['!cols'] = wscols;

      XLSX.writeFile(wb, `ventas_${new Date().toISOString().split('T')[0]}.xlsx`);
    } catch (error) {
      console.error('Error al exportar Excel:', error);
      setError('Error al exportar a Excel');
      setTimeout(() => setError(""), 3000);
    }
  };

  // Exportar detalles a Excel
  const exportarDetallesExcel = () => {
    try {
      const datosExcel = filteredVentas.map(item => {
        const total = (parseFloat(item.precio_unitario) || 0) * (item.cantidad || 0) * (1 - (item.descuento || 0) / 100);
        const ganancia = total - ((parseFloat(item.productos?.precioCompra) || 0) * (item.cantidad || 0));
        
        return {
          'Fecha Venta': formatearFechaMostrar(item.fechaVenta),
          'Producto': item.productos?.nombre || 'N/A',
          'Categoría': item.productos?.categoria || 'Sin categoría',
          'Precio Compra': parseFloat(item.productos?.precioCompra) || 0,
          'Precio Venta': parseFloat(item.precio_unitario) || 0,
          'Cantidad': item.cantidad || 0,
          'Descuento': item.descuento || 0,
          'Total': total,
          'Ganancia': ganancia
        };
      });

      const ws = XLSX.utils.json_to_sheet(datosExcel);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Detalles Ventas");
      XLSX.writeFile(wb, `detalles_ventas_${new Date().toISOString().split('T')[0]}.xlsx`);
    } catch (error) {
      console.error('Error al exportar detalles Excel:', error);
      setError('Error al exportar detalles a Excel');
      setTimeout(() => setError(""), 3000);
    }
  };

  // Función mejorada para exportar a PDF
  const exportarPDF = async () => {
    try {
      // Cargar jsPDF dinámicamente
      const { default: jsPDF } = await import('jspdf');
      
      const doc = new jsPDF();
      
      // Título
      doc.setFontSize(20);
      doc.setTextColor(40);
      doc.text('Reporte de Ventas', 105, 20, { align: 'center' });
      
      // Fecha del reporte
      doc.setFontSize(10);
      doc.text(`Generado: ${new Date().toLocaleDateString('es-ES')}`, 14, 30);
      doc.text(`Período: ${desde ? formatearFechaMostrar(desde) : 'Inicio'} - ${hasta ? formatearFechaMostrar(hasta) : 'Actual'}`, 14, 36);
      
      // Métricas principales
      doc.setFontSize(12);
      doc.setTextColor(50);
      doc.text('Métricas Principales', 14, 50);
      
      // Crear tabla manualmente (sin autotable)
      const metricas = [
        ['Ventas Totales', formatearMoneda(totalVendido)],
        ['Ganancias Totales', formatearMoneda(totalGanancia)],
        ['Transacciones', ventasAgrupadas.length],
        ['Margen Promedio', `${margenPromedio.toFixed(1)}%`],
        ['Producto Top', productoTop ? `${productoTop[0]} (${productoTop[1]} unidades)` : 'N/A']
      ];
      
      let yPos = 60;
      metricas.forEach(([metrica, valor], index) => {
        doc.setFillColor(index % 2 === 0 ? [240, 240, 240] : [255, 255, 255]);
        doc.rect(14, yPos - 5, 180, 10, 'F');
        
        doc.setFontSize(11);
        doc.setTextColor(60);
        doc.text(metrica, 20, yPos);
        
        doc.setFontSize(11);
        doc.setTextColor(30);
        doc.text(valor.toString(), 140, yPos);
        
        yPos += 10;
      });
      
      // Resumen de ventas por día
      doc.addPage();
      doc.setFontSize(12);
      doc.text('Resumen de Ventas por Día', 14, 20);
      
      const ventasResumen = datosGrafico.slice(-7);
      yPos = 30;
      
      // Encabezado de tabla
      doc.setFillColor([59, 130, 246]);
      doc.rect(14, yPos - 5, 180, 10, 'F');
      doc.setTextColor(255);
      doc.text('Fecha', 20, yPos);
      doc.text('Ventas', 70, yPos);
      doc.text('Ganancias', 120, yPos);
      doc.text('Trans.', 170, yPos);
      
      yPos += 10;
      
      // Filas de datos
      ventasResumen.forEach((item, index) => {
        doc.setFillColor(index % 2 === 0 ? [240, 240, 240] : [255, 255, 255]);
        doc.rect(14, yPos - 5, 180, 10, 'F');
        
        doc.setTextColor(60);
        doc.text(item.dia, 20, yPos);
        doc.text(formatearMoneda(item.ventas), 70, yPos);
        doc.text(formatearMoneda(item.ganancias), 120, yPos);
        doc.text(item.transacciones.toString(), 170, yPos);
        
        yPos += 10;
      });
      
      // Productos más vendidos
      doc.addPage();
      doc.setFontSize(12);
      doc.text('Productos Más Vendidos', 14, 20);
      
      yPos = 30;
      
      // Encabezado
      doc.setFillColor([16, 185, 129]);
      doc.rect(14, yPos - 5, 180, 10, 'F');
      doc.setTextColor(255);
      doc.text('Producto', 20, yPos);
      doc.text('Unidades', 90, yPos);
      doc.text('Ventas', 120, yPos);
      doc.text('Ganancia', 160, yPos);
      
      yPos += 10;
      
      // Filas de datos
      productosMasVendidos.forEach((producto, index) => {
        doc.setFillColor(index % 2 === 0 ? [240, 240, 240] : [255, 255, 255]);
        doc.rect(14, yPos - 5, 180, 10, 'F');
        
        doc.setTextColor(60);
        // Truncar nombre si es muy largo
        const nombre = producto.nombre.length > 20 ? producto.nombre.substring(0, 20) + '...' : producto.nombre;
        doc.text(nombre, 20, yPos);
        doc.text(producto.unidades.toString(), 90, yPos);
        doc.text(formatearMoneda(producto.ventas), 120, yPos);
        doc.text(formatearMoneda(producto.ganancia), 160, yPos);
        
        yPos += 10;
      });
      
      doc.save(`reporte_ventas_${new Date().toISOString().split('T')[0]}.pdf`);
      
    } catch (error) {
      console.error('Error al exportar PDF:', error);
      setError('Error al exportar a PDF. Asegúrate de tener jspdf instalado.');
      setTimeout(() => setError(""), 5000);
      
      // Ofrecer alternativa de exportación a Excel
      if (window.confirm('Error al generar PDF. ¿Deseas exportar a Excel en su lugar?')) {
        exportarExcel();
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 md:p-6">
      {/* Spinner de carga */}
      {cargando && (
        <div className="fixed inset-0 bg-white/70 z-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500"></div>
        </div>
      )}

      {/* Mensaje de error */}
      {error && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2">
          <FaExclamationTriangle /> {error}
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-800">Dashboard de Ventas</h1>
              <p className="text-gray-600 mt-2">Análisis detallado del rendimiento comercial</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={exportarExcel}
                className="flex items-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition shadow-md"
              >
                <FaFileExcel /> Exportar Excel
              </button>
              <button
                onClick={exportarPDF}
                className="flex items-center gap-2 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition shadow-md"
              >
                <FaFilePdf /> Exportar PDF
              </button>
            </div>
          </div>

          {/* Selector de Vista */}
          <div className="bg-white rounded-xl shadow-md p-2 mb-6 inline-flex">
            <button
              onClick={() => setVistaActiva("graficos")}
              className={`px-6 py-3 rounded-lg flex items-center gap-2 transition-all ${
                vistaActiva === "graficos" 
                  ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md" 
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <FaChartBar />
              Análisis Gráfico
            </button>
            <button
              onClick={() => setVistaActiva("tabla")}
              className={`px-6 py-3 rounded-lg flex items-center gap-2 transition-all ${
                vistaActiva === "tabla" 
                  ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md" 
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <FaTable />
              Detalle de Ventas
            </button>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center mb-4">
            <div>
              <h2 className="text-xl font-bold text-gray-800">Filtros y Búsqueda</h2>
              <p className="text-gray-600">Refina los datos según tus necesidades</p>
            </div>
            <button 
              onClick={() => {
                setDesde("");
                setHasta("");
                setSearchTerm("");
              }}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition text-sm"
            >
              Limpiar Filtros
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <FaSearch className="absolute left-3 top-3.5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por producto o categoría..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <FaCalendarAlt /> Desde
              </label>
              <input
                type="date"
                value={desde}
                onChange={(e) => setDesde(e.target.value)}
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <FaCalendarAlt /> Hasta
              </label>
              <input
                type="date"
                value={hasta}
                onChange={(e) => setHasta(e.target.value)}
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-end">
              <button 
                onClick={() => {
                  const hoy = new Date();
                  const hace7Dias = new Date(hoy);
                  hace7Dias.setDate(hoy.getDate() - 7);
                  setDesde(hace7Dias.toISOString().split('T')[0]);
                  setHasta(hoy.toISOString().split('T')[0]);
                }}
                className="w-full px-4 py-2.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition"
              >
                Últimos 7 días
              </button>
            </div>
          </div>
        </div>

        {/* Métricas Principales */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl shadow-xl p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-white/20 p-3 rounded-lg">
                <FaMoneyBillWave className="text-2xl" />
              </div>
              <div className={`flex items-center gap-1 text-sm ${tendencia.tipo === "positive" ? 'text-green-300' : tendencia.tipo === "negative" ? 'text-red-300' : 'text-gray-300'}`}>
                {tendencia.tipo === "positive" && <FaArrowUp />}
                {tendencia.tipo === "negative" && <FaArrowDown />}
                {tendencia.porcentaje}%
              </div>
            </div>
            <div className="text-2xl font-bold mb-1">{formatearMoneda(totalVendido)}</div>
            <div className="text-sm opacity-90">Ventas Totales</div>
          </div>
          
          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl shadow-xl p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-white/20 p-3 rounded-lg">
                <FaChartLine className="text-2xl" />
              </div>
              <div className="text-sm opacity-90">
                {margenPromedio.toFixed(1)}%
              </div>
            </div>
            <div className="text-2xl font-bold mb-1">{formatearMoneda(totalGanancia)}</div>
            <div className="text-sm opacity-90">Ganancias Totales</div>
          </div>
          
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl shadow-xl p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-white/20 p-3 rounded-lg">
                <FaShoppingCart className="text-2xl" />
              </div>
              <div className="text-sm opacity-90">
                {formatearMoneda(promedioVenta)}
              </div>
            </div>
            <div className="text-2xl font-bold mb-1">{formatearNumero(ventasAgrupadas.length)}</div>
            <div className="text-sm opacity-90">Transacciones</div>
          </div>
          
          <div className="bg-gradient-to-r from-amber-500 to-amber-600 rounded-2xl shadow-xl p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-white/20 p-3 rounded-lg">
                <FaPercent className="text-2xl" />
              </div>
              <div className="text-sm opacity-90">
                Por transacción
              </div>
            </div>
            <div className="text-2xl font-bold mb-1">{formatearMoneda(promedioGanancia)}</div>
            <div className="text-sm opacity-90">Ganancia Promedio</div>
          </div>
          
          {productoTop && (
            <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-2xl shadow-xl p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-white/20 p-3 rounded-lg">
                  <FaCrown className="text-2xl" />
                </div>
                <div className="text-sm opacity-90">
                  {productoTop[1]} unidades
                </div>
              </div>
              <div className="text-xl font-bold mb-1 truncate">{productoTop[0]}</div>
              <div className="text-sm opacity-90">Producto Top</div>
            </div>
          )}
        </div>

        {/* Vista de Gráficos */}
        {vistaActiva === "graficos" && (
          <div className="space-y-6">
            {/* Gráfico de Tendencia */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-800">Tendencia de Ventas</h2>
                  <p className="text-gray-600">Evolución de ventas y ganancias en el tiempo</p>
                </div>
                <div className="flex items-center gap-4 mt-2 md:mt-0">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    <span className="text-sm text-gray-600">Ventas</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span className="text-sm text-gray-600">Ganancias</span>
                  </div>
                </div>
              </div>
              
              {datosGrafico.length > 0 ? (
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={datosGrafico}>
                      <defs>
                        <linearGradient id="colorVentas" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={GRADIENT_COLORS.ventas.start} stopOpacity={0.8}/>
                          <stop offset="95%" stopColor={GRADIENT_COLORS.ventas.start} stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorGanancias" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={GRADIENT_COLORS.ganancias.start} stopOpacity={0.8}/>
                          <stop offset="95%" stopColor={GRADIENT_COLORS.ganancias.start} stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis 
                        dataKey="dia" 
                        tick={{ fontSize: 12 }}
                      />
                      <YAxis 
                        tickFormatter={(value) => {
                          if (value >= 1000000) return `$${(value/1000000).toFixed(1)}M`;
                          if (value >= 1000) return `$${(value/1000).toFixed(0)}K`;
                          return `$${value}`;
                        }}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Area 
                        type="monotone" 
                        dataKey="ventas" 
                        name="Ventas" 
                        stroke={GRADIENT_COLORS.ventas.start}
                        fill="url(#colorVentas)" 
                        strokeWidth={2}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="ganancias" 
                        name="Ganancias" 
                        stroke={GRADIENT_COLORS.ganancias.start}
                        fill="url(#colorGanancias)" 
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-72 flex flex-col items-center justify-center text-gray-500">
                  <FaChartLine className="text-4xl mb-2 opacity-50" />
                  <p>No hay datos para mostrar en el período seleccionado</p>
                </div>
              )}
            </div>

            {/* Gráficos Secundarios */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Productos Más Vendidos */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold text-gray-800">Productos Más Vendidos</h3>
                  <button 
                    onClick={exportarDetallesExcel}
                    className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                  >
                    <FaDownload className="text-xs" /> Exportar
                  </button>
                </div>
                {productosMasVendidos.length > 0 ? (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={productosMasVendidos}
                        layout="vertical"
                        margin={{ left: 100, right: 20 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                        <XAxis 
                          type="number" 
                          tickFormatter={(value) => value >= 1000 ? `${(value/1000).toFixed(0)}K` : value}
                        />
                        <YAxis 
                          type="category" 
                          dataKey="nombre" 
                          width={90}
                          tick={{ fontSize: 12 }}
                        />
                        <Tooltip 
                          formatter={(value, name) => [value, name === 'unidades' ? 'Unidades' : 'Ventas']}
                          labelFormatter={() => ''}
                        />
                        <Legend />
                        <Bar 
                          dataKey="unidades" 
                          name="Unidades" 
                          fill="#3b82f6" 
                          radius={[0, 4, 4, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-64 flex items-center justify-center text-gray-500">
                    <FaBox className="text-3xl mb-2 opacity-50" />
                    <p>No hay datos de productos</p>
                  </div>
                )}
              </div>

              {/* Distribución por Categoría */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Distribución por Categoría</h3>
                {categoriaDistribucion.length > 0 ? (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={categoriaDistribucion}
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={80}
                          paddingAngle={2}
                          dataKey="value"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {categoriaDistribucion.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip content={<PieTooltip />} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-64 flex items-center justify-center text-gray-500">
                    <FaTags className="text-3xl mb-2 opacity-50" />
                    <p>No hay datos de categorías</p>
                  </div>
                )}
              </div>
            </div>

            {/* Tabla de Productos con Más Ganancia */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Productos con Mayor Ganancia</h3>
              {productosTopGanancia.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Producto</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unidades</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ventas</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ganancia</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Margen</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {productosTopGanancia.map((producto, index) => {
                        const margen = producto.ventas > 0 ? ((producto.ganancia / producto.ventas) * 100) : 0;
                        return (
                          <tr key={index} className="hover:bg-gray-50 transition-colors">
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-3">
                                <div 
                                  className="w-3 h-3 rounded-full"
                                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                                />
                                <span className="font-medium text-gray-900 truncate max-w-xs">{producto.nombre}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                                {producto.unidades}
                              </span>
                            </td>
                            <td className="px-4 py-3 font-medium">{formatearMoneda(producto.ventas)}</td>
                            <td className="px-4 py-3">
                              <span className="font-medium text-green-600">
                                {formatearMoneda(producto.ganancia)}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <span className="font-medium text-green-600">
                                {margen.toFixed(1)}%
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <FaBox className="text-3xl mx-auto mb-2 opacity-50" />
                  <p>No hay datos de productos con ganancia</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Vista de Tabla */}
        {vistaActiva === "tabla" && (
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h2 className="text-lg font-bold text-gray-800">Detalle de Ventas</h2>
                  <p className="text-sm text-gray-600">
                    Mostrando {filteredVentas.length} de {detalleVentas.length} productos vendidos
                  </p>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={exportarDetallesExcel}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm"
                  >
                    <FaFileExcel /> Exportar Excel
                  </button>
                  <button 
                    onClick={exportarPDF}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm"
                  >
                    <FaFilePdf /> Exportar PDF
                  </button>
                </div>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha Venta</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Producto</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cantidad</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Precio</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descuento</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ganancia</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Margen</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredVentas.length > 0 ? (
                    filteredVentas.map((item, index) => {
                      const precioCompra = parseFloat(item.productos?.precioCompra) || 0;
                      const precioVenta = parseFloat(item.precio_unitario) || 0;
                      const cantidad = item.cantidad || 0;
                      const descuento = item.descuento || 0;

                      const totalVenta = precioVenta * cantidad * (1 - descuento / 100);
                      const ganancia = totalVenta - precioCompra * cantidad;
                      const margen = totalVenta > 0 ? (ganancia / totalVenta) * 100 : 0;

                      return (
                        <tr key={`${item.idVenta}-${index}`} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatearFechaMostrar(item.fechaVenta)}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col">
                              <span className="font-medium text-gray-900">{item.productos?.nombre || "Producto desconocido"}</span>
                              <span className="text-xs text-gray-500">{item.productos?.categoria || "Sin categoría"}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                              {cantidad}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatearMoneda(precioVenta)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {descuento > 0 ? (
                              <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium">
                                -{descuento}%
                              </span>
                            ) : '-'}
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
                      <td colSpan="8" className="px-6 py-8 text-center">
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
    </div>
  );
}