import { useState, useMemo, useEffect } from "react";
import { FaPlus, FaArrowUp, FaArrowDown, FaSearch } from "react-icons/fa";
import { getMovimiento, postMovimiento } from "../api/webApi";
import { format } from "@formkit/tempo";

export default function VistaIngresosGastos({ id }) {
  const [movimientos, setMovimientos] = useState([]);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("all");
  
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

  const [nuevoMovimiento, setNuevoMovimiento] = useState({
    tipo: "ingreso",
    descripcion: "",
    monto: "",
    producto: "",
    fecha: getFechaHoraLocalISO(),
    cajaId: id
  });

  useEffect(() => {
    const getAllMovimientos = async () => {
      try {
        const response = await getMovimiento();
        setMovimientos(response.data.movimientos || []);
      } catch (error) {
        console.error("Error al obtener movimientos:", error);
      }
    };
    getAllMovimientos();
  }, []);

  const totalIngresos = useMemo(() => {
    return movimientos
      .filter((m) => m.tipo === "ingreso")
      .reduce((acc, cur) => acc + parseFloat(cur.monto), 0);
  }, [movimientos]);

  const totalGastos = useMemo(() => {
    return movimientos
      .filter((m) => m.tipo === "gasto")
      .reduce((acc, cur) => acc + parseFloat(cur.monto), 0);
  }, [movimientos]);

  // Filtrar movimientos
  const movimientosFiltrados = useMemo(() => {
    return movimientos.filter(mov => {
      const matchesSearch = 
        mov.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mov.producto?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesType = filtroTipo === "all" || mov.tipo === filtroTipo;
      
      return matchesSearch && matchesType;
    });
  }, [movimientos, searchTerm, filtroTipo]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNuevoMovimiento((prev) => ({ ...prev, [name]: value }));
  };

  const agregarMovimiento = async (e) => {
    e.preventDefault();
    if (!nuevoMovimiento.descripcion || !nuevoMovimiento.monto) return;

    const nuevo = {
      tipo: nuevoMovimiento.tipo,
      descripcion: nuevoMovimiento.descripcion,
      monto: Number(nuevoMovimiento.monto),
      producto: nuevoMovimiento.producto || null,
      fecha: nuevoMovimiento.fecha,
      cajaId: nuevoMovimiento.cajaId
    };

    try {
      await postMovimiento(nuevo);
      setMovimientos((prev) => [...prev, {...nuevo, id: Date.now()}]);
    } catch (error) {
      console.error("Error al agregar movimiento:", error);
    }

    setNuevoMovimiento({
      tipo: "ingreso",
      descripcion: "",
      monto: "",
      producto: "",
      fecha: getFechaHoraLocalISO(),
      cajaId: id
    });
    setMostrarModal(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">Income & Expenses</h1>
        
        {/* Resumen */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-semibold text-gray-500 mb-1">Total Income</p>
                <p className="text-2xl font-bold text-gray-800">
                  ${totalIngresos.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold flex items-center">
                <FaArrowUp className="mr-1" /> +15%
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-semibold text-gray-500 mb-1">Total Expenses</p>
                <p className="text-2xl font-bold text-gray-800">
                  ${totalGastos.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-semibold flex items-center">
                <FaArrowDown className="mr-1" /> -8%
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 my-6"></div>

        {/* Filtros y acciones */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <h2 className="text-xl font-semibold text-gray-800">Transactions</h2>
          
          <div className="flex flex-wrap gap-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <FaSearch className="absolute left-3 top-3 text-gray-400" />
            </div>
            
            <select
              value={filtroTipo}
              onChange={(e) => setFiltroTipo(e.target.value)}
              className="py-2 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Types</option>
              <option value="ingreso">Income</option>
              <option value="gasto">Expense</option>
            </select>
            
            <button
              onClick={() => setMostrarModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              <FaPlus /> New Transaction
            </button>
          </div>
        </div>

        {/* Lista de movimientos */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Description</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {movimientosFiltrados.length > 0 ? (
                movimientosFiltrados.map((mov) => (
                  <tr key={mov.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{mov.fecha.split('T')[0]}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span 
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          mov.tipo === "ingreso" 
                            ? "bg-green-100 text-green-800" 
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {mov.tipo.charAt(0).toUpperCase() + mov.tipo.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{mov.descripcion}</div>
                      {mov.producto && (
                        <div className="text-xs text-gray-500">{mov.producto}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <span className={mov.tipo === "ingreso" ? "text-green-600" : "text-red-600"}>
                        ${Number(mov.monto).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="px-6 py-4 text-center text-gray-500">
                    No transactions found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Modal para agregar movimiento */}
        {mostrarModal && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-800">New Transaction</h3>
                <button 
                  onClick={() => setMostrarModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  &times;
                </button>
              </div>
              <form onSubmit={agregarMovimiento} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                    <select
                      name="tipo"
                      value={nuevoMovimiento.tipo}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg p-2"
                    >
                      <option value="ingreso">Income</option>
                      <option value="gasto">Expense</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                    <input
                      type="date"
                      name="fecha"
                      value={nuevoMovimiento.fecha.split('T')[0]}
                      onChange={(e) => handleChange({target: {name: 'fecha', value: e.target.value + 'T00:00:00'}})}
                      className="w-full border border-gray-300 rounded-lg p-2"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <input
                    type="text"
                    name="descripcion"
                    placeholder="Enter description"
                    value={nuevoMovimiento.descripcion}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-300 rounded-lg p-2"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Product (optional)</label>
                  <input
                    type="text"
                    name="producto"
                    placeholder="Enter product"
                    value={nuevoMovimiento.producto}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg p-2"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-gray-500">$</span>
                    <input
                      type="number"
                      name="monto"
                      placeholder="0.00"
                      value={nuevoMovimiento.monto}
                      onChange={handleChange}
                      required
                      min={0}
                      step="0.01"
                      className="w-full pl-8 border border-gray-300 rounded-lg p-2"
                    />
                  </div>
                </div>
                
                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setMostrarModal(false)}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    Add Transaction
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}