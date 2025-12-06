import { useState, useMemo, useEffect, useCallback } from "react";
import { 
  FaPlus, 
  FaArrowUp, 
  FaArrowDown, 
  FaSearch, 
  FaFilter,
  FaCalendarAlt,
  FaChartBar,
  FaMoneyBillWave,
  FaReceipt,
  FaTimes,
  FaDownload,
  FaSort,
  FaSortUp,
  FaSortDown,
  FaBalanceScale,
  FaPiggyBank
} from "react-icons/fa";
import { getMovimiento, postMovimiento } from "../api/webApi";

export default function VistaIngresosGastos({ id }) {
  const [movimientos, setMovimientos] = useState([]);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("all");
  const [filtroFecha, setFiltroFecha] = useState("all");
  const [ordenarPor, setOrdenarPor] = useState("fecha");
  const [ordenDireccion, setOrdenDireccion] = useState("desc");
  const [cargando, setCargando] = useState(true);
  const [stats, setStats] = useState({
    hoy: { ingresos: 0, gastos: 0 },
    semana: { ingresos: 0, gastos: 0 },
    mes: { ingresos: 0, gastos: 0 }
  });

  function getFechaHoraLocalISO() {
    const fecha = new Date();
    const año = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, "0");
    const dia = String(fecha.getDate()).padStart(2, "0");
    const hora = String(fecha.getHours()).padStart(2, "0");
    const minutos = String(fecha.getMinutes()).padStart(2, "0");
    return `${año}-${mes}-${dia}T${hora}:${minutos}`;
  }

  const [nuevoMovimiento, setNuevoMovimiento] = useState({
    tipo: "ingreso",
    descripcion: "",
    monto: "",
    producto: "",
    fecha: getFechaHoraLocalISO(),
    cajaId: id
  });

  // Usar useCallback para evitar recrear la función en cada render
  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setNuevoMovimiento((prev) => ({ ...prev, [name]: value }));
  }, []);

  useEffect(() => {
    const getAllMovimientos = async () => {
      setCargando(true);
      try {
        const response = await getMovimiento();
        const movimientosData = response.data.movimientos || [];
        setMovimientos(movimientosData);
        calcularEstadisticas(movimientosData);
      } catch (error) {
        console.error("Error al obtener movimientos:", error);
      } finally {
        setCargando(false);
      }
    };
    getAllMovimientos();
  }, []);

  const calcularEstadisticas = (movimientosData) => {
    const hoy = new Date();
    const inicioSemana = new Date(hoy);
    inicioSemana.setDate(hoy.getDate() - hoy.getDay());
    const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);

    const statsCalculadas = {
      hoy: { ingresos: 0, gastos: 0 },
      semana: { ingresos: 0, gastos: 0 },
      mes: { ingresos: 0, gastos: 0 }
    };

    movimientosData.forEach(mov => {
      if (!mov || !mov.tipo || !mov.monto) return;
      
      const fechaMov = new Date(mov.fecha);
      const monto = parseFloat(mov.monto) || 0;

      if (fechaMov.toDateString() === hoy.toDateString()) {
        if (mov.tipo === "ingreso") statsCalculadas.hoy.ingresos += monto;
        else statsCalculadas.hoy.gastos += monto;
      }

      if (fechaMov >= inicioSemana) {
        if (mov.tipo === "ingreso") statsCalculadas.semana.ingresos += monto;
        else statsCalculadas.semana.gastos += monto;
      }

      if (fechaMov >= inicioMes) {
        if (mov.tipo === "ingreso") statsCalculadas.mes.ingresos += monto;
        else statsCalculadas.mes.gastos += monto;
      }
    });

    setStats(statsCalculadas);
  };

  const totalIngresos = useMemo(() => {
    return movimientos
      .filter((m) => m && m.tipo === "ingreso" && m.monto)
      .reduce((acc, cur) => acc + (parseFloat(cur.monto) || 0), 0);
  }, [movimientos]);

  const totalGastos = useMemo(() => {
    return movimientos
      .filter((m) => m && m.tipo === "gasto" && m.monto)
      .reduce((acc, cur) => acc + (parseFloat(cur.monto) || 0), 0);
  }, [movimientos]);

  const balance = totalIngresos - totalGastos;

  // Ordenar movimientos de forma segura
  const movimientosOrdenados = useMemo(() => {
    return [...movimientos].filter(mov => mov && mov.id).sort((a, b) => {
      let valorA, valorB;
      
      switch (ordenarPor) {
        case "monto":
          valorA = parseFloat(a.monto) || 0;
          valorB = parseFloat(b.monto) || 0;
          break;
        case "descripcion":
          valorA = (a.descripcion || "").toLowerCase();
          valorB = (b.descripcion || "").toLowerCase();
          break;
        case "fecha":
        default:
          valorA = new Date(a.fecha || new Date());
          valorB = new Date(b.fecha || new Date());
          break;
      }

      if (ordenDireccion === "asc") {
        return valorA > valorB ? 1 : -1;
      } else {
        return valorA < valorB ? 1 : -1;
      }
    });
  }, [movimientos, ordenarPor, ordenDireccion]);

  // Filtrar movimientos con validaciones
  const movimientosFiltrados = useMemo(() => {
    const searchTermLower = searchTerm.toLowerCase();
    
    return movimientosOrdenados.filter(mov => {
      if (!mov) return false;
      
      // Filtro por tipo
      const matchesType = filtroTipo === "all" || mov.tipo === filtroTipo;
      if (!matchesType) return false;
      
      // Filtro por búsqueda
      const descripcion = mov.descripcion || "";
      const producto = mov.producto || "";
      
      const matchesSearch = 
        descripcion.toLowerCase().includes(searchTermLower) ||
        producto.toLowerCase().includes(searchTermLower);
      
      if (!matchesSearch) return false;
      
      // Filtro por fecha
      if (filtroFecha !== "all") {
        const movDate = new Date(mov.fecha || new Date());
        const hoy = new Date();
        
        switch (filtroFecha) {
          case "hoy":
            if (movDate.toDateString() !== hoy.toDateString()) return false;
            break;
          case "semana":
            const inicioSemana = new Date(hoy);
            inicioSemana.setDate(hoy.getDate() - hoy.getDay());
            if (movDate < inicioSemana) return false;
            break;
          case "mes":
            const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
            if (movDate < inicioMes) return false;
            break;
        }
      }
      
      return true;
    });
  }, [movimientosOrdenados, searchTerm, filtroTipo, filtroFecha]);

  const agregarMovimiento = async (e) => {
    e.preventDefault();
    if (!nuevoMovimiento.descripcion || !nuevoMovimiento.monto) {
      alert("Por favor completa los campos obligatorios");
      return;
    }

    const nuevo = {
      tipo: nuevoMovimiento.tipo,
      descripcion: nuevoMovimiento.descripcion.trim(),
      monto: Number(nuevoMovimiento.monto),
      producto: nuevoMovimiento.producto?.trim() || null,
      fecha: nuevoMovimiento.fecha,
      cajaId: nuevoMovimiento.cajaId
    };

    try {
      const response = await postMovimiento(nuevo);
      // Asumiendo que la respuesta tiene la estructura { data: movimiento }
      const movimientoCreado = response.data || nuevo;
      setMovimientos(prev => [...prev, movimientoCreado]);
      setMostrarModal(false);
      
      // Resetear formulario
      setNuevoMovimiento({
        tipo: "ingreso",
        descripcion: "",
        monto: "",
        producto: "",
        fecha: getFechaHoraLocalISO(),
        cajaId: id
      });
    } catch (error) {
      console.error("Error al agregar movimiento:", error);
      alert("Error al agregar movimiento");
    }
  };

  const cambiarOrden = (columna) => {
    if (ordenarPor === columna) {
      setOrdenDireccion(ordenDireccion === "asc" ? "desc" : "asc");
    } else {
      setOrdenarPor(columna);
      setOrdenDireccion("desc");
    }
  };

  const exportarCSV = () => {
    const headers = ["Fecha", "Tipo", "Descripción", "Producto", "Monto"];
    const csvData = movimientosFiltrados.map(mov => [
      new Date(mov.fecha || new Date()).toLocaleDateString(),
      mov.tipo === "ingreso" ? "Ingreso" : "Gasto",
      mov.descripcion || "",
      mov.producto || "",
      `$${parseFloat(mov.monto || 0).toFixed(2)}`
    ]);

    const csvContent = [
      headers.join(","),
      ...csvData.map(row => row.join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `movimientos_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-800">Gestión Financiera</h1>
              <p className="text-gray-600 mt-2">Controla tus ingresos y gastos en tiempo real</p>
            </div>
            <button
              onClick={() => setMostrarModal(true)}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-xl"
            >
              <FaPlus /> Nuevo Movimiento
            </button>
          </div>

          {/* Balance Overview */}
          <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-2xl p-6 text-white mb-8 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <FaBalanceScale className="text-3xl text-blue-300" />
                <div>
                  <h2 className="text-xl font-semibold">Balance General</h2>
                  <p className="text-gray-300">Estado financiero actual</p>
                </div>
              </div>
              <div className="text-right">
                <div className={`text-3xl font-bold ${balance >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  ${balance.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                </div>
                <div className="text-sm text-gray-300">Saldo neto</div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="bg-white/10 p-4 rounded-xl">
                <div className="flex items-center gap-3 mb-2">
                  <div className="bg-green-500/20 p-2 rounded-lg">
                    <FaArrowUp className="text-green-400" />
                  </div>
                  <span className="text-gray-300">Ingresos Totales</span>
                </div>
                <div className="text-2xl font-bold text-green-400">
                  ${totalIngresos.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                </div>
              </div>
              <div className="bg-white/10 p-4 rounded-xl">
                <div className="flex items-center gap-3 mb-2">
                  <div className="bg-red-500/20 p-2 rounded-lg">
                    <FaArrowDown className="text-red-400" />
                  </div>
                  <span className="text-gray-300">Gastos Totales</span>
                </div>
                <div className="text-2xl font-bold text-red-400">
                  ${totalGastos.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                </div>
              </div>
              <div className="bg-white/10 p-4 rounded-xl">
                <div className="flex items-center gap-3 mb-2">
                  <div className="bg-blue-500/20 p-2 rounded-lg">
                    <FaPiggyBank className="text-blue-400" />
                  </div>
                  <span className="text-gray-300">Movimientos</span>
                </div>
                <div className="text-2xl font-bold text-blue-400">
                  {movimientos.length}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-white rounded-xl shadow-md p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="bg-green-100 p-2 rounded-lg">
                    <FaMoneyBillWave className="text-green-600" />
                  </div>
                  <span className="font-medium text-gray-700">Hoy</span>
                </div>
                <span className="text-sm text-gray-500">{new Date().toLocaleDateString('es-ES')}</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Ingresos:</span>
                  <span className="font-semibold text-green-600">+${stats.hoy.ingresos.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Gastos:</span>
                  <span className="font-semibold text-red-600">-${stats.hoy.gastos.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <FaCalendarAlt className="text-blue-600" />
                  </div>
                  <span className="font-medium text-gray-700">Esta Semana</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Ingresos:</span>
                  <span className="font-semibold text-green-600">+${stats.semana.ingresos.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Gastos:</span>
                  <span className="font-semibold text-red-600">-${stats.semana.gastos.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="bg-purple-100 p-2 rounded-lg">
                    <FaChartBar className="text-purple-600" />
                  </div>
                  <span className="font-medium text-gray-700">Este Mes</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Ingresos:</span>
                  <span className="font-semibold text-green-600">+${stats.mes.ingresos.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Gastos:</span>
                  <span className="font-semibold text-red-600">-${stats.mes.gastos.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filtros y búsqueda */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-800">Movimientos</h2>
              <p className="text-gray-600">{movimientosFiltrados.length} registros encontrados</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <div className="relative">
                <FaSearch className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar movimientos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-64"
                />
              </div>

              <select
                value={filtroTipo}
                onChange={(e) => setFiltroTipo(e.target.value)}
                className="py-2 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Todos los tipos</option>
                <option value="ingreso">Solo ingresos</option>
                <option value="gasto">Solo gastos</option>
              </select>

              <select
                value={filtroFecha}
                onChange={(e) => setFiltroFecha(e.target.value)}
                className="py-2 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Todas las fechas</option>
                <option value="hoy">Hoy</option>
                <option value="semana">Esta semana</option>
                <option value="mes">Este mes</option>
              </select>

              <button
                onClick={exportarCSV}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
              >
                <FaDownload /> Exportar
              </button>
            </div>
          </div>

          {/* Lista de movimientos */}
          <div className="overflow-hidden rounded-xl border border-gray-200">
            {cargando ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500"></div>
              </div>
            ) : movimientosFiltrados.length === 0 ? (
              <div className="text-center py-12">
                <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaReceipt className="text-gray-400 text-2xl" />
                </div>
                <h3 className="text-lg font-medium text-gray-700">No se encontraron movimientos</h3>
                <p className="text-gray-500 mt-1">Intenta con otros filtros o crea un nuevo movimiento</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th 
                        className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer"
                        onClick={() => cambiarOrden("fecha")}
                      >
                        <div className="flex items-center gap-1">
                          Fecha
                          {ordenarPor === "fecha" && (
                            ordenDireccion === "asc" ? <FaSortUp /> : <FaSortDown />
                          )}
                          {ordenarPor !== "fecha" && <FaSort className="text-gray-300" />}
                        </div>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Tipo
                      </th>
                      <th 
                        className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer"
                        onClick={() => cambiarOrden("descripcion")}
                      >
                        <div className="flex items-center gap-1">
                          Descripción
                          {ordenarPor === "descripcion" && (
                            ordenDireccion === "asc" ? <FaSortUp /> : <FaSortDown />
                          )}
                          {ordenarPor !== "descripcion" && <FaSort className="text-gray-300" />}
                        </div>
                      </th>
                      <th 
                        className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer"
                        onClick={() => cambiarOrden("monto")}
                      >
                        <div className="flex items-center gap-1">
                          Monto
                          {ordenarPor === "monto" && (
                            ordenDireccion === "asc" ? <FaSortUp /> : <FaSortDown />
                          )}
                          {ordenarPor !== "monto" && <FaSort className="text-gray-300" />}
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {movimientosFiltrados.map((mov) => {
                      const fecha = new Date(mov.fecha || new Date());
                      const esHoy = fecha.toDateString() === new Date().toDateString();
                      
                      return (
                        <tr key={mov.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${esHoy ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {fecha.toLocaleDateString('es-ES', { 
                                    day: '2-digit', 
                                    month: '2-digit', 
                                    year: 'numeric' 
                                  })}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {fecha.toLocaleTimeString('es-ES', { 
                                    hour: '2-digit', 
                                    minute: '2-digit' 
                                  })}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${
                              mov.tipo === "ingreso" 
                                ? "bg-green-100 text-green-800" 
                                : "bg-red-100 text-red-800"
                            }`}>
                              {mov.tipo === "ingreso" ? (
                                <>
                                  <FaArrowUp className="text-xs" /> Ingreso
                                </>
                              ) : (
                                <>
                                  <FaArrowDown className="text-xs" /> Gasto
                                </>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900">{mov.descripcion || ""}</div>
                            {mov.producto && (
                              <div className="text-xs text-gray-500 flex items-center gap-1">
                                <FaReceipt className="text-xs" /> {mov.producto}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className={`text-sm font-semibold ${
                              mov.tipo === "ingreso" ? "text-green-600" : "text-red-600"
                            }`}>
                              {mov.tipo === "ingreso" ? "+" : "-"}${(parseFloat(mov.monto || 0)).toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Resumen */}
          {movimientosFiltrados.length > 0 && (
            <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
              <div className="flex flex-wrap justify-between items-center gap-4">
                <div className="text-sm text-gray-600">
                  Mostrando {movimientosFiltrados.length} de {movimientos.length} movimientos
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <div className="text-sm text-gray-600">Ingresos filtrados</div>
                    <div className="text-lg font-bold text-green-600">
                      +${movimientosFiltrados
                        .filter(m => m.tipo === "ingreso")
                        .reduce((acc, cur) => acc + (parseFloat(cur.monto) || 0), 0)
                        .toFixed(2)}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-gray-600">Gastos filtrados</div>
                    <div className="text-lg font-bold text-red-600">
                      -${movimientosFiltrados
                        .filter(m => m.tipo === "gasto")
                        .reduce((acc, cur) => acc + (parseFloat(cur.monto) || 0), 0)
                        .toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal para agregar movimiento */}
      {mostrarModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-800">Nuevo Movimiento</h3>
              <button 
                onClick={() => setMostrarModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <FaTimes className="text-gray-500" />
              </button>
            </div>
            
            <form onSubmit={agregarMovimiento} className="p-6 space-y-5">
              {/* Selector de tipo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Movimiento</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setNuevoMovimiento(prev => ({ ...prev, tipo: "ingreso" }))}
                    className={`p-4 rounded-xl border-2 transition-all ${nuevoMovimiento.tipo === "ingreso" 
                      ? "border-green-500 bg-green-50 text-green-700" 
                      : "border-gray-200 hover:border-green-300"}`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <FaArrowUp className="text-lg" />
                      <span className="font-semibold">Ingreso</span>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setNuevoMovimiento(prev => ({ ...prev, tipo: "gasto" }))}
                    className={`p-4 rounded-xl border-2 transition-all ${nuevoMovimiento.tipo === "gasto" 
                      ? "border-red-500 bg-red-50 text-red-700" 
                      : "border-gray-200 hover:border-red-300"}`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <FaArrowDown className="text-lg" />
                      <span className="font-semibold">Gasto</span>
                    </div>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="descripcion"
                  placeholder="Ej: Venta de producto, Pago de servicios..."
                  value={nuevoMovimiento.descripcion}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Fecha</label>
                  <div className="relative">
                    <FaCalendarAlt className="absolute left-3 top-3.5 text-gray-400" />
                    <input
                      type="datetime-local"
                      name="fecha"
                      value={nuevoMovimiento.fecha}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Monto <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-3.5 text-gray-500">$</span>
                    <input
                      type="number"
                      name="monto"
                      placeholder="0.00"
                      value={nuevoMovimiento.monto}
                      onChange={handleInputChange}
                      required
                      min="0"
                      step="0.01"
                      className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Producto (opcional)</label>
                <input
                  type="text"
                  name="producto"
                  placeholder="Nombre del producto relacionado..."
                  value={nuevoMovimiento.producto}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t">
                <button
                  type="button"
                  onClick={() => setMostrarModal(false)}
                  className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition shadow-md"
                >
                  Crear Movimiento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}