import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import CajaView from "./CajaView";
import ListaProductos from "./ListaProductos";
import VistaIngresosGastos from "./VistaIngresosGastos";
import VistaCajas from "./VistaCajas";
import ConfiguracionCuenta from "./ConfiguracionCuenta";
import VentasDetalle from "./VentasDetalle";
import { getCajas,postCaja } from '../api/webApi';
import { FaTimes, FaPlus } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
export default function Dashboard() {
    const navigate = useNavigate();

  const [pagina, setPagina] = useState("cajaventa");
  const [privado, setPrivado] = useState(false)
  const [mostrarModal, setMostrarModal] = useState(false);
  const [ingresoInicial, setIngresoInicial] = useState("");
  const fechaHoy = new Date().toISOString().split("T")[0];
  const [cajaData, setCajaData] = useState({})
  const [cajaId, setCajaId] = useState(0)

  useEffect(() => {
    const getFechaCaja = async () => {
      try {
        const res = await getCajas();
        setCajaData(res)
        const existe = res.some((caja) => {
          if (!caja.creadoEl) return false;
          const fechaCaja = new Date(caja.creadoEl);
          if (isNaN(fechaCaja)) return false;
          const formatoFechaCaja = fechaCaja.toISOString().split("T")[0];
          if(formatoFechaCaja === fechaHoy){
            setCajaId(caja.id)
            console.log(caja.id);
          }
          
          
          return formatoFechaCaja === fechaHoy;
        });

        // 👇 Mostrar modal automáticamente si no hay caja hoy
        if (!existe) {
          setMostrarModal(true);
          setPrivado(true)
        }

      } catch (error) {
        console.error("Error al obtener cajas:", error);
      }
    };

    getFechaCaja();
  }, []);

  const crearCaja = async (monto) => {
    console.log("Crear caja con ingreso inicial:", monto);
    try {
      const res = await postCaja({saldoInicial:monto})
      setCajaId(res.data.nuevaCaja);
      setPrivado(false)
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

      {/* ✅ MODAL siempre que no haya caja */}
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
      {privado === false && (
  <>
    <Sidebar selected={pagina} onSelect={setPagina} />
    <main className="flex-1 overflow-y-auto p-4">
      {pagina === "cajaventa" && <CajaView id={cajaId} />}
      {pagina === "productos" && <ListaProductos />}
      {pagina === "analisis" && <VistaIngresosGastos id={cajaId}/>}
      {pagina === "cajasdiarias" && <VistaCajas data={cajaData}  />}
      {pagina === "configuracion" && <ConfiguracionCuenta />}
      {pagina === "VentasDetalle" && <VentasDetalle />}
    </main>
  </>
)}

    </div>
  );
}
