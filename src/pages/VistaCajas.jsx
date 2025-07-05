import { useState, useMemo, useEffect } from "react";
import { FaEdit, FaSave, FaTimes } from "react-icons/fa";
import {putCajas} from '../api/webApi'

export default function VistaCajas({ data }) {
  const [cajas, setCajas] = useState([
    {
      id: 1,
      fecha: "2025-06-28",
      totalInicial: 10000,
      totalFinal: 35000,
      usuarioId: 1,
      creadoEl: "2025-06-28T00:00:00",
      actualizadoEl: "2025-06-28T12:00:00",
    },
    {
      id: 2,
      fecha: "2025-06-29",
      totalInicial: 8000,
      totalFinal: 28000,
      usuarioId: 1,
      creadoEl: "2025-06-29T00:00:00",
      actualizadoEl: "2025-06-29T12:00:00",
    },
  ]);

  useEffect(() => {
    if (!data || !Array.isArray(data)) return;

    // Mapeo para que siempre tenga totalInicial y totalFinal como números
    const cajasFormateadas = data.map((caja) => ({
      ...caja,
      totalInicial: Number(caja.totalInicial) || 0,
      totalFinal: Number(caja.totalFinal) || 0,
    }));

    setCajas(cajasFormateadas);
  }, [data]);

  const [editandoId, setEditandoId] = useState(null);
  const [editForm, setEditForm] = useState({
    totalInicial: "",
    totalFinal: "",
  });

  // Calcular total general sumando diferencia totalFinal - totalInicial
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
      alert("Por favor, ingresa valores numéricos válidos");
      return;
    }
    if (totalFinalNum < totalInicialNum) {
      alert("El total final no puede ser menor que el total inicial");
      return;
    }
    await putCajas({saldoInicial:totalInicialNum, saldoFinal:totalFinalNum, id:editandoId})
    
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
    cancelarEdicion();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Cajas Diarias</h1>

        <div className="overflow-x-auto bg-white rounded-xl shadow-md">
          <table className="w-full border-collapse text-gray-800">
            <thead className="bg-gray-200">
              <tr>
                <th className="p-4 text-left font-semibold">Fecha</th>
                <th className="p-4 text-left font-semibold">Total Inicial</th>
                <th className="p-4 text-left font-semibold">Total Final</th>
                <th className="p-4 text-left font-semibold">Diferencia</th>
                <th className="p-4 text-center font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {cajas.map((caja) => {
                const editando = editandoId === caja.id;
                const diferencia = caja.totalFinal - caja.totalInicial;

                return (
                  <tr
                    key={caja.id}
                    className="border-b last:border-none hover:bg-gray-50 transition"
                  >
                    <td className="p-4">
                      {new Date(caja.creadoEl || caja.fecha).toLocaleDateString()}
                    </td>

                    <td className="p-4">
                      {editando ? (
                        <input
                          type="number"
                          name="totalInicial"
                          value={editForm.totalInicial}
                          onChange={handleChange}
                          className="w-full border border-gray-300 rounded p-2"
                          min={0}
                        />
                      ) : (
                        `$${caja.totalInicial.toLocaleString()}`
                      )}
                    </td>

                    <td className="p-4">
                      {editando ? (
                        <input
                          type="number"
                          name="totalFinal"
                          value={editForm.totalFinal}
                          onChange={handleChange}
                          className="w-full border border-gray-300 rounded p-2"
                          min={0}
                        />
                      ) : (
                        `$${caja.totalFinal.toLocaleString()}`
                      )}
                    </td>

                    <td className="p-4 font-semibold">
                      ${diferencia.toLocaleString()}
                    </td>

                    <td className="p-4 text-center space-x-2">
                      {editando ? (
                        <>
                          <button
                            onClick={guardarEdicion}
                            title="Guardar"
                            className="inline-flex items-center justify-center px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                          >
                            <FaSave />
                          </button>
                          <button
                            onClick={cancelarEdicion}
                            title="Cancelar"
                            className="inline-flex items-center justify-center px-3 py-1 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
                          >
                            <FaTimes />
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => iniciarEdicion(caja)}
                          title="Editar totales"
                          className="inline-flex items-center justify-center px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                          <FaEdit />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="bg-gray-100 font-bold text-lg">
                <td colSpan={3} className="p-4 text-right">
                  Total General:
                </td>
                <td className="p-4">
                  $
                  {totalGeneral.toLocaleString()}
                </td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
