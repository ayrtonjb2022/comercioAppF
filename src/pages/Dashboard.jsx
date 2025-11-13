import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import CajaView from "./CajaView";
import ListaProductos from "./ListaProductos";
import VistaIngresosGastos from "./VistaIngresosGastos";
import VistaCajas from "./VistaCajas";
import ConfiguracionCuenta from "./ConfiguracionCuenta";
import VentasDetalle from "./VentasDetalle";
import Servicios from "./Servicios";
import { getCajas, postCaja } from '../api/webApi';
import { 
  FaCashRegister, 
  FaPlus, 
  FaCalendarDay, 
  FaMoneyBillWave,
  FaRocket
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import {  AnimatePresence } from "framer-motion";

function obtenerFechaLocalISO(date = new Date()) {
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().split("T")[0];
}

// Componente de animación reutilizable
const CreationAnimation = ({ message, planetColor = "blue" }) => (
  <motion.div 
    className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.5 }}
  >
    {/* Fondo estrellado */}
    <div className="absolute inset-0">
      {[...Array(200)].map((_, i) => (
        <div
          key={`star-${i}`}
          className="absolute rounded-full bg-white"
          style={{
            width: `${Math.random() * 3}px`,
            height: `${Math.random() * 3}px`,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            opacity: Math.random() * 0.8 + 0.2,
            animation: `twinkle ${2 + Math.random() * 3}s infinite alternate`
          }}
        />
      ))}
    </div>
    
    {/* Planeta */}
    <motion.div
      className="absolute top-1/4 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
      initial={{ scale: 0.5, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 1 }}
    >
      <div className={
        planetColor === "green" 
          ? "w-64 h-64 rounded-full bg-gradient-to-br from-green-700 to-green-900 relative overflow-hidden"
          : "w-64 h-64 rounded-full bg-gradient-to-br from-blue-700 to-blue-900 relative overflow-hidden"
      }>
        <div className="absolute w-full h-full bg-gray-900 opacity-20 top-0 left-0"></div>
        <div className={
          planetColor === "green"
            ? "absolute w-32 h-32 rounded-full bg-green-500 opacity-30 top-10 left-10"
            : "absolute w-32 h-32 rounded-full bg-blue-500 opacity-30 top-10 left-10"
        }></div>
      </div>
    </motion.div>
    
    {/* Nave espacial */}
    <motion.div
      className="text-6xl text-emerald-400 z-10 mb-8"
      animate={{ 
        y: [0, -20, 0],
        rotate: [0, -5, 0],
      }}
      transition={{ 
        duration: 2,
        repeat: Infinity,
        repeatType: "reverse"
      }}
    >
      <FaRocket />
    </motion.div>
    
    {/* Humo/llamas */}
    <motion.div
      className="absolute w-16 h-16 bg-gradient-to-t from-orange-500 to-yellow-300 rounded-full blur-xl"
      initial={{ scale: 0.5, opacity: 0 }}
      animate={{ 
        scale: [1, 1.2, 1], 
        opacity: [0.8, 1, 0.8],
        transition: { 
          duration: 0.5,
          repeat: Infinity,
          repeatType: "reverse"
        } 
      }}
      style={{ top: '60%', left: '50%', transform: 'translateX(-50%)' }}
    />
    
    {/* Mensaje */}
    <motion.div 
      className="text-center text-white z-10"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="text-3xl font-bold mb-2">Procesando</h2>
      <p className="text-xl opacity-80">{message}</p>
    </motion.div>
  </motion.div>
);

export default function Dashboard() {
  const navigate = useNavigate();
  const [pagina, setPagina] = useState("cajaventa");
  const [privado, setPrivado] = useState(false);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [ingresoInicial, setIngresoInicial] = useState("");
  const fechaHoy = obtenerFechaLocalISO();
  const [cajaData, setCajaData] = useState([]);
  const [cajaId, setCajaId] = useState(0);
  const [cargando, setCargando] = useState(true);
  const [showLaunchAnimation, setShowLaunchAnimation] = useState(false);
  const [firstLogin, setFirstLogin] = useState(true);
  const [isCreatingBox, setIsCreatingBox] = useState(false);
  const [creationMessage, setCreationMessage] = useState("");

  useEffect(() => {
    const getFechaCaja = async () => {
      try {
        setCargando(true);
        const res = await getCajas();
        setCajaData(res);
        
        const existe = res.some((caja) => {
          if (!caja.creadoEl) return false;
          const fechaCaja = new Date(caja.creadoEl);
          if (isNaN(fechaCaja)) return false;
          
          const fechaLocalCaja = obtenerFechaLocalISO(fechaCaja);
          
          if (fechaLocalCaja === fechaHoy) {
            setCajaId(caja.id);
            return true;
          }
          
          return false;
        });
        
        if (!existe) {
          // Primera vez que inicia sesión hoy
          if (firstLogin) {
            setShowLaunchAnimation(true);
            setFirstLogin(false);
          } else {
            setMostrarModal(true);
            setPrivado(true);
          }
        }
      } catch (error) {
        console.error("Error al obtener cajas:", error);
      } finally {
        setCargando(false);
      }
    };
    
    getFechaCaja();
  }, []);
  
  const crearCaja = async (monto) => {
    if (!monto || isNaN(Number(monto))) {
      alert("Por favor ingrese un monto válido");
      return;
    }
    
    try {
      // Activar animación de creación
      setIsCreatingBox(true);
      setCreationMessage("Creando tu nueva caja...");
      setMostrarModal(false);
      
      const res = await postCaja({ saldoInicial: monto });
      setCajaId(res.data.nuevaCaja);
      setPrivado(false);
      
      // Finalizar animación después de 2 segundos
      setTimeout(() => {
        setIsCreatingBox(false);
        setCargando(false);
      }, 2000);
    } catch (error) {
      console.log(error);
      alert("Error al crear la caja");
      setIsCreatingBox(false);
    }
  };

  // Finalizar animación de lanzamiento
  const finishLaunchAnimation = () => {
    setShowLaunchAnimation(false);
    setMostrarModal(true);
    setPrivado(true);
  };

  return (
    <div className="flex min-h-screen h-screen bg-gray-50 relative">
      {/* Animación de lanzamiento inicial */}
      <AnimatePresence>
        {showLaunchAnimation && (
          <motion.div 
            key="launch-screen"
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
          >
            <div className="absolute inset-0">
              {[...Array(200)].map((_, i) => (
                <div
                  key={`launch-star-${i}`}
                  className="absolute rounded-full bg-white"
                  style={{
                    width: `${Math.random() * 3}px`,
                    height: `${Math.random() * 3}px`,
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    opacity: Math.random() * 0.8 + 0.2,
                    animation: `twinkle ${2 + Math.random() * 3}s infinite alternate`
                  }}
                />
              ))}
            </div>
            
            <motion.div
              className="absolute top-1/4 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.5, duration: 1.5 }}
            >
              <div className="w-64 h-64 rounded-full bg-gradient-to-br from-blue-700 to-blue-900 relative overflow-hidden">
                <div className="absolute w-full h-full bg-gray-900 opacity-20 top-0 left-0"></div>
                <div className="absolute w-32 h-32 rounded-full bg-blue-500 opacity-30 top-10 left-10"></div>
              </div>
            </motion.div>
            
            <motion.div
              className="text-6xl text-blue-400 z-10"
              initial={{ y: 300, x: -50, rotate: 0 }}
              animate={{ 
                y: -500, 
                x: 50, 
                rotate: -20,
                transition: { 
                  duration: 4, 
                  ease: "easeOut"
                } 
              }}
              onAnimationComplete={finishLaunchAnimation}
            >
              <FaRocket />
            </motion.div>
            
            <motion.div
              className="absolute w-16 h-16 bg-gradient-to-t from-orange-500 to-yellow-300 rounded-full blur-xl"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ 
                scale: [1, 1.2, 1], 
                opacity: [0.8, 1, 0.8],
                transition: { 
                  duration: 0.5,
                  repeat: Infinity,
                  repeatType: "reverse"
                } 
              }}
              style={{ top: '60%', left: '50%', transform: 'translateX(-50%)' }}
            />
            
            <motion.div 
              className="text-center mt-24 text-white z-10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 1 }}
            >
              <h2 className="text-3xl font-bold mb-2">Bienvenido a ComercioApp</h2>
              <p className="text-xl opacity-80">Preparando tu espacio de trabajo...</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Animación para creación de caja */}
      <AnimatePresence>
        {isCreatingBox && (
          <CreationAnimation 
            key="box-creation"
            message={creationMessage} 
            planetColor="green"
          />
        )}
      </AnimatePresence>

      {/* Spinner de carga */}
      {cargando && !showLaunchAnimation && !isCreatingBox && (
        <div className="fixed inset-0 bg-white bg-opacity-80 z-40 flex items-center justify-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500 border-solid"></div>
        </div>
      )}
      
      {/* Modal para crear nueva caja */}
      {mostrarModal && !isCreatingBox && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-40 p-4">
          <motion.div 
            className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-5">
              <div className="flex items-center gap-3">
                <FaCashRegister className="text-3xl" />
                <div>
                  <h2 className="text-xl font-bold">Crear nueva caja</h2>
                  <p className="text-sm opacity-80">Inicia las operaciones del día</p>
                </div>
              </div>
            </div>
            
            <div className="p-5 space-y-4">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <FaCalendarDay className="text-blue-500" />
                <div>
                  <div className="text-sm text-gray-500">Fecha</div>
                  <div className="font-medium">{fechaHoy}</div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ingreso inicial *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-gray-500">$</span>
                  <input
                    type="number"
                    value={ingresoInicial}
                    onChange={(e) => setIngresoInicial(e.target.value)}
                    className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ej: 10000"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>
              
              <div className="pt-4 flex gap-3">
                <button
                  onClick={() => {
                    setMostrarModal(false);
                    navigate('/login');
                  }}
                  className="flex-1 px-4 py-2.5 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => crearCaja(ingresoInicial)}
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-lg hover:from-blue-700 hover:to-blue-900 transition flex items-center justify-center gap-2"
                >
                  <FaPlus /> Crear caja
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
      
      {/* CONTENIDO PRINCIPAL */}
      {!privado && !showLaunchAnimation && !isCreatingBox && (
        <div className="flex flex-1">
          <Sidebar selected={pagina} onSelect={setPagina} />
          
          {/* Contenido principal */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* Cabecera para móviles */}
            <div className="md:hidden bg-gradient-to-r from-blue-600 to-blue-800 text-white p-4 shadow-md">
              <div className="flex items-center justify-between">
                <h1 className="text-xl font-bold">
                  {pagina === "cajaventa" && "Caja Venta"}
                  {pagina === "productos" && "Productos"}
                  {pagina === "analisis" && "Análisis"}
                  {pagina === "cajasdiarias" && "Cajas Diarias"}
                  {pagina === "configuracion" && "Configuración"}
                  {pagina === "VentasDetalle" && "Ventas Detalle"}
                  {pagina === "Servicios" && "Servicios"}
                </h1>
                {pagina === "cajaventa" && (
                  <div className="flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full">
                    <FaMoneyBillWave />
                    <span>${cajaData.length > 0 ? cajaData[0].totalInicial.toFixed(2) : '0.00'}</span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Contenido de la página */}
            <main className={`flex-1 overflow-auto ${pagina === "cajaventa" ? "h-full" : "p-4 md:p-6"}`}>
              {pagina === "cajaventa" && <CajaView id={cajaId} />}
              {pagina === "productos" && <ListaProductos />}
              {pagina === "analisis" && <VistaIngresosGastos id={cajaId} />}
              {pagina === "cajasdiarias" && <VistaCajas data={cajaData} />}
              {pagina === "configuracion" && <ConfiguracionCuenta />}
              {pagina === "VentasDetalle" && <VentasDetalle />}
              {pagina === "Servicios" && <Servicios cajaId={cajaId} />}
            </main>
          </div>
        </div>
      )}
    </div>
  );
}