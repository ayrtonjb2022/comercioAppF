import { useState, useMemo, useEffect } from "react";
import { 
  FaEdit, 
  FaSave, 
  FaTimes, 
  FaMoneyBillWave, 
  FaChartLine, 
  FaInfoCircle, 
  FaCalendarAlt,
  FaArrowUp,
  FaArrowDown,
  FaEye,
  FaEyeSlash,
  FaFilter,
  FaSearch,
  FaHistory,
  FaCheckCircle,
  FaClock,
  FaCalendarDay,
  FaCrown
} from "react-icons/fa";
import { putCajas } from '../api/webApi';

export default function VistaCajas({ data }) {
  const [cajas, setCajas] = useState([]);
  const [cajasFiltradas, setCajasFiltradas] = useState([]);
  const [editandoId, setEditandoId] = useState(null);
  const [editForm, setEditForm] = useState({
    totalInicial: "",
    totalFinal: "",
  });
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const [mostrarTodas, setMostrarTodas] = useState(false);
  const [filtroMes, setFiltroMes] = useState("todos");
  const [busqueda, setBusqueda] = useState("");
  const [mesesDisponibles, setMesesDisponibles] = useState([]);

  useEffect(() => {
    setCargando(true);
    try {
      if (data && Array.isArray(data)) {
        const cajasFormateadas = data
          .map((caja) => ({
            ...caja,
            totalInicial: Number(caja.totalInicial) || 0,
            totalFinal: Number(caja.totalFinal) || 0,
            fecha: caja.actualizadoEl || caja.fecha || new Date().toISOString()
          }))
          .sort((a, b) => new Date(b.fecha) - new Date(a.fecha)); // Ordenar por fecha descendente
        
        setCajas(cajasFormateadas);
        setCajasFiltradas(cajasFormateadas);
        
        // Extraer meses únicos para el filtro
        const meses = [...new Set(cajasFormateadas.map(c => {
          const fecha = new Date(c.fecha);
          return `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`;
        }))].sort().reverse();
        setMesesDisponibles(meses);
      }
    } catch (error) {
      console.error("Error al procesar datos de cajas:", error);
      setError("Error al cargar los datos de cajas");
    } finally {
      setCargando(false);
    }
  }, [data]);

  useEffect(() => {
    let resultado = [...cajas];
    
    // Aplicar filtro por mes
    if (filtroMes !== "todos") {
      resultado = resultado.filter(c => {
        const fecha = new Date(c.fecha);
        const mesKey = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`;
        return mesKey === filtroMes;
      });
    }
    
    // Aplicar búsqueda por fecha
    if (busqueda) {
      const busquedaLower = busqueda.toLowerCase();
      resultado = resultado.filter(c => 
        formatearFecha(c.fecha).toLowerCase().includes(busquedaLower)
      );
    }
    
    setCajasFiltradas(resultado);
  }, [cajas, filtroMes, busqueda]);

  const totalGeneral = useMemo(() => {
    return cajasFiltradas.reduce(
      (acc, c) => acc + (c.totalFinal - c.totalInicial || 0),
      0
    );
  }, [cajasFiltradas]);

  const cajaMasReciente = cajas.length > 0 ? cajas[0] : null;

  const iniciarEdicion = (caja) => {
    setEditandoId(caja.id);
    setEditForm({
      totalInicial: caja.totalInicial,
      totalFinal: caja.totalFinal,
    });
  };

  const cancelarEdicion = () => {
    setEditandoId(null);
    setEditForm({ totalInicial: "", totalFinal: "" });
  };

  const guardarEdicion = async () => {
    const totalInicialNum = Number(editForm.totalInicial);
    const totalFinalNum = Number(editForm.totalFinal);

    if (isNaN(totalInicialNum) || isNaN(totalFinalNum)) {
      setError("Por favor, ingresa valores numéricos válidos");
      setTimeout(() => setError(""), 3000);
      return;
    }
    if (totalFinalNum < totalInicialNum) {
      setError("El total final no puede ser menor que el total inicial");
      setTimeout(() => setError(""), 3000);
      return;
    }
    
    try {
      setCargando(true);
      await putCajas({saldoInicial: totalInicialNum, saldoFinal: totalFinalNum, id: editandoId});
      
      setCajas((prev) =>
        prev.map((c) =>
          c.id === editandoId
            ? {
                ...c,
                totalInicial: totalInicialNum,
                totalFinal: totalFinalNum,
              }
            : c
        )
      );
      setError("");
    } catch (error) {
      console.error("Error al actualizar caja:", error);
      setError("Error al guardar los cambios");
      setTimeout(() => setError(""), 3000);
    } finally {
      setCargando(false);
      cancelarEdicion();
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const formatearMoneda = (valor) => {
    return valor.toLocaleString('es-ES', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const formatearFecha = (fechaISO) => {
    if (!fechaISO) return "";
    const fecha = new Date(fechaISO);
    return fecha.toLocaleDateString('es-ES', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatearFechaCorta = (fechaISO) => {
    if (!fechaISO) return "";
    const fecha = new Date(fechaISO);
    return fecha.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const calcularGananciasDia = (caja) => {
    return caja.totalFinal - caja.totalInicial;
  };

  const obtenerMejorDia = () => {
    if (cajas.length === 0) return null;
    return cajas.reduce((mejor, caja) => {
      const ganancia = calcularGananciasDia(caja);
      return ganancia > calcularGananciasDia(mejor) ? caja : mejor;
    }, cajas[0]);
  };

  const obtenerPeorDia = () => {
    if (cajas.length === 0) return null;
    return cajas.reduce((peor, caja) => {
      const ganancia = calcularGananciasDia(caja);
      return ganancia < calcularGananciasDia(peor) ? caja : peor;
    }, cajas[0]);
  };

  const mejorDia = obtenerMejorDia();
  const peorDia = obtenerPeorDia();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 md:p-6">
      {/* Spinner de carga */}
      {cargando && (
        <div className="fixed inset-0 bg-white/70 z-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500"></div>
        </div>
      )}
      
      {error && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-4 py-2 rounded shadow z-50">
          {error}
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-800 flex items-center gap-3">
                <FaMoneyBillWave className="text-blue-500" /> Gestión de Cajas
              </h1>
              <p className="text-gray-600 mt-2">Control y seguimiento de flujo de caja diario</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMostrarTodas(!mostrarTodas)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg transition ${
                  mostrarTodas 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {mostrarTodas ? <FaEyeSlash /> : <FaHistory />}
                {mostrarTodas ? 'Ocultar Historial' : 'Ver Historial'}
              </button>
            </div>
          </div>

          {/* Panel de Caja Actual - Negro con sombra */}
          {cajaMasReciente && (
            <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl shadow-2xl p-6 mb-8 text-white overflow-hidden relative">
              {/* Elementos decorativos */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full -translate-y-16 translate-x-16"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-green-500/10 rounded-full translate-y-12 -translate-x-12"></div>
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="bg-white/10 p-3 rounded-xl">
                      <FaCalendarDay className="text-white text-xl" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">Caja del Día</h2>
                      <p className="text-gray-300">{formatearFecha(cajaMasReciente.fecha)}</p>
                    </div>
                  </div>
                  <div className="bg-white/10 px-3 py-1 rounded-full text-sm">
                    <FaClock className="inline mr-1" /> Última actualización
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className="bg-white/10 p-5 rounded-xl backdrop-blur-sm">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-gray-300">Saldo Inicial</span>
                      {editandoId === cajaMasReciente.id ? (
                        <div className="relative">
                          <span className="absolute left-2 top-2 text-gray-300">$</span>
                          <input
                            type="number"
                            name="totalInicial"
                            value={editForm.totalInicial}
                            onChange={handleChange}
                            className="w-32 pl-6 pr-2 py-1 bg-white/20 border border-white/30 rounded text-white focus:outline-none focus:border-blue-500"
                            min={0}
                            step="0.01"
                          />
                        </div>
                      ) : (
                        <div className="text-2xl font-bold">${formatearMoneda(cajaMasReciente.totalInicial)}</div>
                      )}
                    </div>
                    <p className="text-xs text-gray-400">Fondos iniciales del día</p>
                  </div>

                  <div className="bg-white/10 p-5 rounded-xl backdrop-blur-sm">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-gray-300">Saldo Final</span>
                      {editandoId === cajaMasReciente.id ? (
                        <div className="relative">
                          <span className="absolute left-2 top-2 text-gray-300">$</span>
                          <input
                            type="number"
                            name="totalFinal"
                            value={editForm.totalFinal}
                            onChange={handleChange}
                            className="w-32 pl-6 pr-2 py-1 bg-white/20 border border-white/30 rounded text-white focus:outline-none focus:border-blue-500"
                            min={0}
                            step="0.01"
                          />
                        </div>
                      ) : (
                        <div className="text-2xl font-bold">${formatearMoneda(cajaMasReciente.totalFinal)}</div>
                      )}
                    </div>
                    <p className="text-xs text-gray-400">Fondos al cierre del día</p>
                  </div>

                  <div className="bg-gradient-to-r from-blue-500/20 to-green-500/20 p-5 rounded-xl backdrop-blur-sm border border-white/10">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-gray-300">Ganancias del Día</span>
                      <div className={`text-2xl font-bold ${calcularGananciasDia(cajaMasReciente) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        ${formatearMoneda(calcularGananciasDia(cajaMasReciente))}
                      </div>
                    </div>
                    <p className="text-xs text-gray-400">Ingresos netos del día</p>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-300">
                    {editandoId === cajaMasReciente.id ? (
                      <span className="text-yellow-400">✏️ Editando caja actual...</span>
                    ) : (
                      <span className="text-green-400">✅ Caja actualizada</span>
                    )}
                  </div>
                  <div className="flex gap-3">
                    {editandoId === cajaMasReciente.id ? (
                      <>
                        <button
                          onClick={guardarEdicion}
                          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                        >
                          <FaSave /> Guardar Cambios
                        </button>
                        <button
                          onClick={cancelarEdicion}
                          className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition"
                        >
                          <FaTimes /> Cancelar
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => iniciarEdicion(cajaMasReciente)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                      >
                        <FaEdit /> Editar Caja
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Estadísticas Generales */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-lg p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <FaChartLine className="text-blue-600 text-xl" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Total General</h3>
                  <p className="text-2xl font-bold text-gray-800">${formatearMoneda(totalGeneral)}</p>
                </div>
              </div>
              <div className="text-sm text-gray-600">Suma total de todas las cajas</div>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-green-100 p-3 rounded-lg">
                  <FaCheckCircle className="text-green-600 text-xl" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Cajas Registradas</h3>
                  <p className="text-2xl font-bold text-gray-800">{cajas.length}</p>
                </div>
              </div>
              <div className="text-sm text-gray-600">Total de días registrados</div>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-purple-100 p-3 rounded-lg">
                  <FaInfoCircle className="text-purple-600 text-xl" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Promedio Diario</h3>
                  <p className="text-2xl font-bold text-gray-800">
                    ${cajas.length ? formatearMoneda(totalGeneral / cajas.length) : '0.00'}
                  </p>
                </div>
              </div>
              <div className="text-sm text-gray-600">Ganancia promedio por día</div>
            </div>
          </div>

          {/* Días Destacados */}
          {mejorDia && peorDia && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {mejorDia && (
                <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl shadow-lg p-5 text-white">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-white/20 p-2 rounded-lg">
                        <FaCrown className="text-xl" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold">Mejor Día</h3>
                        <p className="text-green-100">{formatearFechaCorta(mejorDia.fecha)}</p>
                      </div>
                    </div>
                    <div className="text-2xl font-bold">
                      +${formatearMoneda(calcularGananciasDia(mejorDia))}
                    </div>
                  </div>
                  <div className="text-sm opacity-90">
                    <div className="flex justify-between mb-1">
                      <span>Inicial:</span>
                      <span>${formatearMoneda(mejorDia.totalInicial)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Final:</span>
                      <span>${formatearMoneda(mejorDia.totalFinal)}</span>
                    </div>
                  </div>
                </div>
              )}

              {peorDia && (
                <div className="bg-gradient-to-r from-amber-500 to-orange-600 rounded-2xl shadow-lg p-5 text-white">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-white/20 p-2 rounded-lg">
                        <FaInfoCircle className="text-xl" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold">Día Menor Ganancia</h3>
                        <p className="text-amber-100">{formatearFechaCorta(peorDia.fecha)}</p>
                      </div>
                    </div>
                    <div className={`text-2xl font-bold ${calcularGananciasDia(peorDia) >= 0 ? 'text-green-300' : 'text-red-300'}`}>
                      ${formatearMoneda(calcularGananciasDia(peorDia))}
                    </div>
                  </div>
                  <div className="text-sm opacity-90">
                    <div className="flex justify-between mb-1">
                      <span>Inicial:</span>
                      <span>${formatearMoneda(peorDia.totalInicial)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Final:</span>
                      <span>${formatearMoneda(peorDia.totalFinal)}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Historial de Cajas (Condicional) */}
          {mostrarTodas && (
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <FaHistory /> Historial de Cajas
                  </h2>
                  <p className="text-gray-600">{cajasFiltradas.length} registros encontrados</p>
                </div>
                
                <div className="flex flex-wrap gap-3">
                  <div className="relative">
                    <FaSearch className="absolute left-3 top-3 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Buscar por fecha..."
                      value={busqueda}
                      onChange={(e) => setBusqueda(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-64"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <FaFilter className="text-gray-500" />
                    <select
                      value={filtroMes}
                      onChange={(e) => setFiltroMes(e.target.value)}
                      className="py-2 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="todos">Todos los meses</option>
                      {mesesDisponibles.map((mes) => {
                        const [year, month] = mes.split('-');
                        const nombreMes = new Date(year, month - 1).toLocaleDateString('es-ES', { month: 'long' });
                        return (
                          <option key={mes} value={mes}>
                            {nombreMes.charAt(0).toUpperCase() + nombreMes.slice(1)} {year}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                </div>
              </div>

              {/* Lista de Cajas */}
              <div className="overflow-hidden rounded-xl border border-gray-200">
                {cajasFiltradas.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FaCalendarAlt className="text-gray-400 text-2xl" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-700">No se encontraron cajas</h3>
                    <p className="text-gray-500 mt-1">Intenta con otros filtros o crea una nueva caja</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Fecha</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Saldo Inicial</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Saldo Final</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Ganancia</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Acciones</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {cajasFiltradas.map((caja, index) => {
                          const esActual = index === 0 && caja.id === cajaMasReciente?.id;
                          const ganancia = calcularGananciasDia(caja);
                          
                          return (
                            <tr key={caja.id} className={`hover:bg-gray-50 ${esActual ? 'bg-blue-50' : ''}`}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center gap-2">
                                  {esActual && <FaCalendarDay className="text-blue-500" />}
                                  <div>
                                    <div className="text-sm font-medium text-gray-900">
                                      {formatearFechaCorta(caja.fecha)}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                      {esActual ? 'Hoy' : new Date(caja.fecha).toLocaleDateString('es-ES', { weekday: 'short' })}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">${formatearMoneda(caja.totalInicial)}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">${formatearMoneda(caja.totalFinal)}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className={`text-sm font-semibold ${ganancia >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                  {ganancia >= 0 ? '+' : ''}${formatearMoneda(ganancia)}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <button
                                  onClick={() => iniciarEdicion(caja)}
                                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                  title="Editar caja"
                                >
                                  <FaEdit />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Resumen del filtro */}
              {cajasFiltradas.length > 0 && (
                <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
                  <div className="flex flex-wrap justify-between items-center gap-4">
                    <div className="text-sm text-gray-600">
                      Mostrando {cajasFiltradas.length} de {cajas.length} cajas
                    </div>
                    <div className="text-lg font-bold text-gray-800">
                      Total filtrado: ${formatearMoneda(
                        cajasFiltradas.reduce((acc, c) => acc + calcularGananciasDia(c), 0)
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}