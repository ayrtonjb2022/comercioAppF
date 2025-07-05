import { useState, useMemo, useEffect } from "react";
import { FaPlus, FaArrowUp, FaArrowDown } from "react-icons/fa";
import { getMovimiento,postMovimiento } from "../api/webApi";

export default function VistaIngresosGastos() {
  const [movimientos, setMovimientos] = useState([]);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [nuevoMovimiento, setNuevoMovimiento] = useState({
    tipo: "ingreso",
    descripcion: "",
    monto: "",
    producto: "",
    fecha: new Date().toISOString().slice(0, 10), // formato YYYY-MM-DD
    cajaId: 1
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNuevoMovimiento((prev) => ({ ...prev, [name]: value }));
  };

  const agregarMovimiento = async (e) => {
    e.preventDefault();
    if (!nuevoMovimiento.descripcion || !nuevoMovimiento.monto) return;

    const nuevo = {
      id: movimientos.length ? movimientos[movimientos.length - 1].id + 1 : 1,
      tipo: nuevoMovimiento.tipo,
      descripcion: nuevoMovimiento.descripcion,
      monto: Number(nuevoMovimiento.monto),
      producto: nuevoMovimiento.producto || null,
      fecha: nuevoMovimiento.fecha,
      cajaId: nuevoMovimiento.cajaId
    };

    setMovimientos((prev) => [...prev, nuevo]);
    console.log("Nuevo movimiento:", nuevo);
    await postMovimiento(nuevo)

    setNuevoMovimiento({
      tipo: "ingreso",
      descripcion: "",
      monto: "",
      producto: "",
      fecha: new Date().toISOString().slice(0, 10),
      cajaId: 1
    });
    setMostrarModal(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">Ingresos y Gastos</h1>

        {/* Resumen */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6 flex items-center gap-4">
            <FaArrowUp className="text-green-600 text-3xl" />
            <div>
              <p className="text-sm font-semibold text-gray-500">Total Ingresos</p>
              <p className="text-2xl font-bold text-green-700">
                ${totalIngresos.toLocaleString()}
              </p>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6 flex items-center gap-4">
            <FaArrowDown className="text-red-600 text-3xl" />
            <div>
              <p className="text-sm font-semibold text-gray-500">Total Gastos</p>
              <p className="text-2xl font-bold text-red-700">
                ${totalGastos.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* Lista de movimientos */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Movimientos</h2>
            <button
              onClick={() => setMostrarModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <FaPlus /> Nuevo
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-300">
                  <th className="p-3 text-gray-600">Fecha</th>
                  <th className="p-3 text-gray-600">Tipo</th>
                  <th className="p-3 text-gray-600">Descripción</th>
                  <th className="p-3 text-gray-600">Producto</th>
                  <th className="p-3 text-gray-600 text-right">Monto</th>
                </tr>
              </thead>
              <tbody>
                {movimientos.map((mov) => (
                  <tr
                    key={mov.id}
                    className={`border-b ${
                      mov.tipo === "ingreso" ? "bg-green-50" : "bg-red-50"
                    }`}
                  >
                    <td className="p-3">{mov.fecha || "-"}</td>
                    <td className={`p-3 font-semibold ${mov.tipo === "ingreso" ? "text-green-700" : "text-red-700"}`}>
                      {mov.tipo.charAt(0).toUpperCase() + mov.tipo.slice(1)}
                    </td>
                    <td className="p-3">{mov.descripcion}</td>
                    <td className="p-3">{mov.producto || "-"}</td>
                    <td className="p-3 text-right font-semibold">
                      ${Number(mov.monto).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal para agregar movimiento */}
        {mostrarModal && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
              <h3 className="text-xl font-bold mb-4 text-gray-800">Nuevo Movimiento</h3>
              <form onSubmit={agregarMovimiento} className="space-y-4">
                <select
                  name="tipo"
                  value={nuevoMovimiento.tipo}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded p-2"
                >
                  <option value="ingreso">Ingreso</option>
                  <option value="gasto">Gasto</option>
                </select>
                <input
                  type="date"
                  name="fecha"
                  value={nuevoMovimiento.fecha}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded p-2"
                />
                <input
                  type="text"
                  name="descripcion"
                  placeholder="Descripción"
                  value={nuevoMovimiento.descripcion}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded p-2"
                />
                <input
                  type="text"
                  name="producto"
                  placeholder="Productos (opcional)"
                  value={nuevoMovimiento.producto}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded p-2"
                />
                <input
                  type="number"
                  name="monto"
                  placeholder="Monto"
                  value={nuevoMovimiento.monto}
                  onChange={handleChange}
                  required
                  min={0}
                  step="0.01"
                  className="w-full border border-gray-300 rounded p-2"
                />
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setMostrarModal(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Agregar
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
