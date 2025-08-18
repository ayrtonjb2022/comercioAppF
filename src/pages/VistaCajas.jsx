import { useState, useMemo, useEffect } from "react";
import { FaEdit, FaSave, FaTimes, FaMoneyBillWave, FaChartLine, FaInfoCircle } from "react-icons/fa";
import { putCajas } from '../api/webApi';

export default function VistaCajas({ data }) {
  const [cajas, setCajas] = useState([]);
  const [editandoId, setEditandoId] = useState(null);
  const [editForm, setEditForm] = useState({
    totalInicial: "",
    totalFinal: "",
  });
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setCargando(true);
    try {
      if (data && Array.isArray(data)) {
        const cajasFormateadas = data.map((caja) => ({
          ...caja,
          totalInicial: Number(caja.totalInicial) || 0,
          totalFinal: Number(caja.totalFinal) || 0,
        }));
        setCajas(cajasFormateadas);
      }
    } catch (error) {
      console.error("Error al procesar datos de cajas:", error);
      setError("Error al cargar los datos de cajas");
    } finally {
      setCargando(false);
    }
  }, [data]);

  const totalGeneral = useMemo(() => {
    return cajas.reduce(
      (acc, c) => acc + (c.totalFinal - c.totalInicial || 0),
      0
    );
  }, [cajas]);

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
      return;
    }
    if (totalFinalNum < totalInicialNum) {
      setError("El total final no puede ser menor que el total inicial");
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
    return valor.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const formatearFecha = (fechaISO) => {
    if (!fechaISO) return "";
    const fecha = new Date(fechaISO);
    return fecha.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
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

      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <FaMoneyBillWave className="text-blue-500" /> Caja registradora diaria
          </h1>
          <p className="text-gray-600 mt-1">Realice un seguimiento del flujo de caja diario y registre los saldos</p>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
          <div className="bg-white rounded-xl shadow p-5 flex items-start">
            <div className="bg-blue-100 p-3 rounded-lg mr-4">
              <FaMoneyBillWave className="text-blue-600 text-xl" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Total Cajas</h3>
              <p className="text-2xl font-bold text-gray-800">{cajas.length}</p>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow p-5 flex items-start">
            <div className="bg-green-100 p-3 rounded-lg mr-4">
              <FaChartLine className="text-green-600 text-xl" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Total General</h3>
              <p className="text-2xl font-bold text-gray-800">${formatearMoneda(totalGeneral)}</p>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow p-5 flex items-start">
            <div className="bg-amber-100 p-3 rounded-lg mr-4">
              <FaInfoCircle className="text-amber-600 text-xl" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Promedio Diario</h3>
              <p className="text-2xl font-bold text-gray-800">
                ${cajas.length ? formatearMoneda(totalGeneral / cajas.length) : '0.00'}
              </p>
            </div>
          </div>
        </div>

        {/* Lista de cajas */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 bg-gray-50 font-semibold text-gray-700">
            <div className="md:col-span-2">Fecha</div>
            <div>Inicial</div>
            <div>Final</div>
            <div>Diferencia</div>
          </div>
          
          <div className="divide-y divide-gray-100">
            {cajas.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <FaMoneyBillWave className="text-gray-500 text-2xl" />
                </div>
                <p>No se encontraron registros de caja</p>
              </div>
            ) : (
              cajas.map((caja) => {
                const editando = editandoId === caja.id;
                const diferencia = caja.totalFinal - caja.totalInicial;
                
                return (
                  <div 
                    key={caja.id} 
                    className={`p-4 hover:bg-gray-50 transition ${
                      editando ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                    }`}
                  >
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                      {/* Fecha */}
                      <div className="md:col-span-2 font-medium">
                        {formatearFecha(caja.actualizadoEl || caja.fecha)}
                      </div>
                      
                      {/* Total Inicial */}
                      <div>
                        {editando ? (
                          <div className="relative">
                            <span className="absolute left-3 top-2.5 text-gray-500">$</span>
                            <input
                              type="number"
                              name="totalInicial"
                              value={editForm.totalInicial}
                              onChange={handleChange}
                              className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              min={0}
                              step="0.01"
                            />
                          </div>
                        ) : (
                          <div className="font-medium">${formatearMoneda(caja.totalInicial)}</div>
                        )}
                      </div>
                      
                      {/* Total Final */}
                      <div>
                        {editando ? (
                          <div className="relative">
                            <span className="absolute left-3 top-2.5 text-gray-500">$</span>
                            <input
                              type="number"
                              name="totalFinal"
                              value={editForm.totalFinal}
                              onChange={handleChange}
                              className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              min={0}
                              step="0.01"
                            />
                          </div>
                        ) : (
                          <div className="font-medium">${formatearMoneda(caja.totalFinal)}</div>
                        )}
                      </div>
                      
                      {/* Diferencia y Acciones */}
                      <div className="flex justify-between items-center">
                        <div className={`font-medium ${diferencia >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          ${formatearMoneda(diferencia)}
                        </div>
                        
                        <div className="ml-4">
                          {editando ? (
                            <div className="flex gap-2">
                              <button
                                onClick={guardarEdicion}
                                title="Guardar"
                                className="p-2 bg-green-600 text-white rounded-full hover:bg-green-700 transition"
                              >
                                <FaSave className="w-4 h-4" />
                              </button>
                              <button
                                onClick={cancelarEdicion}
                                title="Cancelar"
                                className="p-2 bg-gray-300 text-gray-700 rounded-full hover:bg-gray-400 transition"
                              >
                                <FaTimes className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => iniciarEdicion(caja)}
                              title="Editar totales"
                              className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition"
                            >
                              <FaEdit className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
          
          {/* Total General */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white px-6 py-4 flex justify-between items-center">
            <div className="text-lg font-bold">Total General</div>
            <div className="text-2xl font-bold">${formatearMoneda(totalGeneral)}</div>
          </div>
        </div>
      </div>
    </div>
  );
}