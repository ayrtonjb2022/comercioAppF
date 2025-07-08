import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import CajaView from "./CajaView";
import ListaProductos from "./ListaProductos";
import VistaIngresosGastos from "./VistaIngresosGastos";
import VistaCajas from "./VistaCajas";
import ConfiguracionCuenta from "./ConfiguracionCuenta";
import VentasDetalle from "./VentasDetalle";
import { getCajas, postCaja } from '../api/webApi';
import { FaPlus } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

// ✅ Función para obtener fecha local en formato YYYY-MM-DD
function obtenerFechaLocalISO(date = new Date()) {
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().split("T")[0];
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [pagina, setPagina] = useState("cajaventa");
  const [privado, setPrivado] = useState(false);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [ingresoInicial, setIngresoInicial] = useState("");
  const fechaHoy = obtenerFechaLocalISO(); // ✅ corregido
  const [cajaData, setCajaData] = useState({});
  const [cajaId, setCajaId] = useState(0);

  useEffect(() => {
    const getFechaCaja = async () => {
      try {
        const res = await getCajas();
        setCajaData(res);
        const existe = res.some((caja) => {
          if (!caja.creadoEl) return false;
          const fechaCaja = new Date(caja.creadoEl);
          if (isNaN(fechaCaja)) return false;

          // ✅ Ajustar fecha al horario local
          const fechaLocalCaja = obtenerFechaLocalISO(fechaCaja);

          if (fechaLocalCaja === fechaHoy) {
            setCajaId(caja.id);
            return true;
          }

          return false;
        });

        if (!existe) {
          setMostrarModal(true);
          setPrivado(true);
        }
      } catch (error) {
        console.error("Error al obtener cajas:", error);
      }
    };

    getFechaCaja();
  }, []);

  const crearCaja = async (monto) => {
    try {
      const res = await postCaja({ saldoInicial: monto });
      setCajaId(res.data.nuevaCaja);
      setPrivado(false);
      navigate('/dashboard');
      window.location.reload();
    } catch (error) {
      console.log(error);
    }
    setMostrarModal(false);
    setIngresoInicial("");
  };

  return (
    <div className="flex min-h-screen h-screen">
      {/* MODAL siempre que no haya caja */}
      {mostrarModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md relative">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <FaPlus /> Crear nueva caja
            </h2>

            <div className="mb-4">
              <label className="block font-semibold mb-1">Fecha:</label>
              <p className="bg-gray-100 px-3 py-2 rounded">{fechaHoy}</p>
            </div>

            <div className="mb-6">
              <label className="block font-semibold mb-1">Ingreso inicial:</label>
              <input
                type="number"
                value={ingresoInicial}
                onChange={(e) => setIngresoInicial(e.target.value)}
                className="w-full border px-3 py-2 rounded"
                placeholder="Ej: 10000"
              />
            </div>

            <button
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded w-full"
              onClick={() => crearCaja(ingresoInicial)}
            >
              Crear caja
            </button>
          </div>
        </div>
      )}

      {/* CONTENIDO PRINCIPAL */}
      {!privado && (
        <>
          <Sidebar selected={pagina} onSelect={setPagina} />
          <main
            className={`flex-1 overflow-y-auto p-4 ${
              pagina === "cajaventa" ? "flex flex-col md:flex-row h-[calc(100vh-2rem)]" : ""
            }`}
          >
            {pagina === "cajaventa" && <CajaView id={cajaId} />}
            {pagina === "productos" && <ListaProductos />}
            {pagina === "analisis" && <VistaIngresosGastos id={cajaId} />}
            {pagina === "cajasdiarias" && <VistaCajas data={cajaData} />}
            {pagina === "configuracion" && <ConfiguracionCuenta />}
            {pagina === "VentasDetalle" && <VentasDetalle />}
          </main>
        </>
      )}
    </div>
  );
}
