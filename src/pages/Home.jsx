import { useNavigate } from "react-router-dom";
import { 
  FaChartLine, 
  FaQuestionCircle, 
  FaLock,
  FaUser,
  FaChartBar,
  FaRocket,
  FaSatellite,
  FaGlobeAmericas,
  FaUserAstronaut
} from "react-icons/fa";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function Home() {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);

  const irALogin = () => {
    navigate("/login");
  };

  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Animaciones
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1, transition: { duration: 0.6 } }
  };

  return (
    <motion.div 
      className="min-h-screen flex flex-col text-white overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
      style={{
        background: "radial-gradient(ellipse at center, #0c1445 0%, #020617 70%)"
      }}
    >
      {/* Fondo Espacial */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {/* Estrellas */}
        {[...Array(150)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              width: Math.random() * 3 + 'px',
              height: Math.random() * 3 + 'px',
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              opacity: Math.random() * 0.8 + 0.2
            }}
            animate={{
              opacity: [0.2, 1, 0.2]
            }}
            transition={{
              duration: 2 + Math.random() * 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        ))}

        {/* Planetas */}
        <motion.div
          className="absolute rounded-full"
          style={{
            width: '200px',
            height: '200px',
            background: 'radial-gradient(circle, #4a044e, #1e1b4b)',
            left: '10%',
            top: '20%',
            boxShadow: '0 0 50px rgba(122, 0, 128, 0.5)'
          }}
          animate={{
            rotate: 360
          }}
          transition={{
            duration: 40,
            repeat: Infinity,
            ease: "linear"
          }}
        >
          <div className="absolute w-40 h-40 rounded-full bg-gray-800 opacity-20 top-5 left-5"></div>
        </motion.div>

        <motion.div
          className="absolute rounded-full"
          style={{
            width: '120px',
            height: '120px',
            background: 'radial-gradient(circle, #0ea5e9, #0284c7)',
            right: '15%',
            bottom: '25%',
            boxShadow: '0 0 40px rgba(14, 165, 233, 0.5)'
          }}
          animate={{
            rotate: -360
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "linear"
          }}
        />

        {/* Nebulosa */}
        <div 
          className="absolute rounded-full blur-3xl opacity-20"
          style={{
            width: '600px',
            height: '600px',
            background: 'radial-gradient(circle, #4f46e5, transparent 70%)',
            left: '-200px',
            top: '-200px'
          }}
        />
      </div>

      {/* Encabezado */}
      <motion.header 
        className="py-4 px-6 relative z-10"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, type: "spring" }}
        style={{
          background: "rgba(15, 23, 42, 0.4)",
          backdropFilter: "blur(4px)"
        }}
      >
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <motion.div 
            className="flex items-center gap-3"
            whileHover={{ scale: 1.05 }}
          >
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-2 rounded-lg">
              <FaRocket className="text-white text-2xl" />
            </div>
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
              ComercioApp
            </h1>
          </motion.div>
          
          <nav className="hidden md:flex gap-6">
            {["Inicio", "Características", "Precios", "Contacto"].map((item, i) => (
              <motion.a 
                key={i}
                href="#" 
                className="hover:text-blue-300 transition"
                whileHover={{ y: -2 }}
              >
                {item}
              </motion.a>
            ))}
          </nav>
          
          <motion.button 
            onClick={irALogin}
            className="relative overflow-hidden bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold px-5 py-2 rounded-full shadow-lg"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="relative z-10">Iniciar sesión</span>
            <motion.div 
              className="absolute inset-0 bg-white opacity-0"
              initial={{ x: "-100%" }}
              whileHover={{ 
                x: "100%",
                opacity: 0.2,
                transition: { duration: 0.6 }
              }}
            />
          </motion.button>
        </div>
      </motion.header>

      {/* Contenido Principal */}
      <main className="flex-grow p-6 relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* Sección Hero */}
          <motion.div 
            className="text-center mb-12 py-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            <motion.div
              className="inline-block mb-6"
              animate={{ 
                y: [0, -15, 0],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ 
                duration: 4, 
                repeat: Infinity,
                repeatType: "reverse"
              }}
            >
              <FaGlobeAmericas className="text-6xl text-blue-400" />
            </motion.div>
            
            <motion.h1 
              className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-300 to-purple-300"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
            >
              Bienvenido a ComercioApp
            </motion.h1>
            
            <motion.p 
              className="text-xl max-w-2xl mx-auto mb-8 text-blue-100"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.8 }}
            >
              Tu solución para gestionar ventas en la nueva frontera digital
            </motion.p>
            
            <motion.button
              onClick={irALogin}
              className="mt-6 bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-8 py-3 rounded-full text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 group"
              whileHover={{ 
                scale: 1.05,
                boxShadow: "0 10px 25px -5px rgba(99, 102, 241, 0.5)"
              }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="flex items-center gap-2">
                <FaUserAstronaut className="group-hover:rotate-12 transition-transform" />
                Explorar el sistema
              </span>
            </motion.button>
          </motion.div>

          {/* Tarjetas de contenido */}
          <motion.div 
            className="grid grid-cols-1 lg:grid-cols-2 gap-8"
            variants={container}
            initial="hidden"
            animate={isVisible ? "show" : "hidden"}
          >
            {/* Sección de datos */}
            <motion.div 
              className="rounded-2xl p-6 shadow-xl border border-indigo-500 border-opacity-30 relative overflow-hidden"
              variants={item}
              style={{
                background: "rgba(15, 23, 42, 0.4)",
                backdropFilter: "blur(4px)"
              }}
              whileHover={{ y: -10 }}
            >
              {/* Efecto de partículas */}
              <div className="absolute inset-0 overflow-hidden">
                {[...Array(20)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute rounded-full bg-blue-500"
                    style={{
                      width: Math.random() * 5 + 'px',
                      height: Math.random() * 5 + 'px',
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 100}%`,
                      opacity: 0.4
                    }}
                    animate={{
                      y: [0, -20, 0],
                      opacity: [0.2, 0.6, 0.2]
                    }}
                    transition={{
                      duration: 3 + Math.random() * 4,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                ))}
              </div>
              
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white">Sobre Data</h2>
                  <motion.div 
                    className="px-3 py-1 rounded-full text-sm flex items-center gap-2"
                    style={{
                      background: "rgba(34, 197, 94, 0.3)",
                      color: "#dcfce7"
                    }}
                    animate={{ 
                      scale: [1, 1.05, 1],
                      rotate: [0, 2, -2, 0]
                    }}
                    transition={{ 
                      duration: 3, 
                      repeat: Infinity,
                      repeatType: "reverse"
                    }}
                  >
                    <FaSatellite className="text-xs" />
                    +15% últimos 12 meses
                  </motion.div>
                </div>
                
                <div className="mb-8">
                  <p className="text-5xl font-bold text-white mb-2">$120K</p>
                  <p className="text-blue-100">Crecimiento anual</p>
                </div>

                {/* Gráfico animado */}
                <div className="flex justify-between mb-6">
                  {["Jun", "Feb", "Mar", "Apr", "May", "Jun", "Jul"].map((mes, i) => (
                    <motion.div 
                      key={i} 
                      className="flex flex-col items-center"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * i }}
                    >
                      <motion.div 
                        className="h-10 w-10 rounded-full flex items-center justify-center mb-1"
                        style={{
                          background: "rgba(96, 165, 250, 0.2)"
                        }}
                        animate={{ 
                          scale: [1, 1.2, 1],
                          rotate: [0, 10, -10, 0]
                        }}
                        transition={{ 
                          duration: 3, 
                          repeat: Infinity,
                          delay: i * 0.2
                        }}
                      >
                        <FaChartLine className="text-blue-300" />
                      </motion.div>
                      <span className="text-sm text-blue-200">{mes}</span>
                    </motion.div>
                  ))}
                </div>

                <div className="flex gap-4 mt-8">
                  <motion.button 
                    className="flex-1 text-white font-semibold py-3 px-4 rounded-lg transition duration-300 flex items-center justify-center gap-2"
                    style={{
                      background: "rgba(79, 70, 229, 0.3)"
                    }}
                    whileHover={{ 
                      background: "rgba(79, 70, 229, 0.5)",
                      scale: 1.03
                    }}
                  >
                    <FaUser className="text-blue-300" /> Todos restos
                  </motion.button>
                  <motion.button 
                    onClick={irALogin}
                    className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold py-3 px-4 rounded-lg shadow-lg"
                    whileHover={{ 
                      scale: 1.03,
                      boxShadow: "0 5px 15px rgba(99, 102, 241, 0.4)"
                    }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Registrarse
                  </motion.button>
                </div>
              </div>
            </motion.div>

            {/* Sección de contacto */}
            <motion.div 
              className="rounded-2xl p-6 shadow-xl flex flex-col border border-indigo-500 border-opacity-30 relative overflow-hidden"
              variants={item}
              style={{
                background: "rgba(15, 23, 42, 0.4)",
                backdropFilter: "blur(4px)"
              }}
              whileHover={{ y: -10 }}
            >
              {/* Efecto de partículas */}
              <div className="absolute inset-0 overflow-hidden">
                {[...Array(15)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute rounded-full bg-purple-500"
                    style={{
                      width: Math.random() * 5 + 'px',
                      height: Math.random() * 5 + 'px',
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 100}%`,
                      opacity: 0.4
                    }}
                    animate={{
                      y: [0, -15, 0],
                      opacity: [0.2, 0.5, 0.2]
                    }}
                    transition={{
                      duration: 4 + Math.random() * 3,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                ))}
              </div>
              
              <div className="relative z-10 flex flex-col h-full">
                <h2 className="text-2xl font-bold text-white mb-6">Contacto</h2>
                
                <div className="space-y-4 mb-8 flex-grow">
                  <motion.div 
                    className="flex items-center gap-4 p-4 rounded-lg transition cursor-pointer"
                    style={{
                      background: "rgba(79, 70, 229, 0.2)"
                    }}
                    whileHover={{ 
                      background: "rgba(79, 70, 229, 0.3)",
                      x: 5
                    }}
                  >
                    <div 
                      className="h-12 w-12 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{
                        background: "rgba(129, 140, 248, 0.3)"
                      }}
                    >
                      <FaQuestionCircle className="text-xl text-blue-300" />
                    </div>
                    <p className="text-lg text-white">Ayuda y Soporte</p>
                  </motion.div>
                  
                  <motion.div 
                    className="flex items-center gap-4 p-4 rounded-lg transition cursor-pointer"
                    style={{
                      background: "rgba(79, 70, 229, 0.2)"
                    }}
                    whileHover={{ 
                      background: "rgba(79, 70, 229, 0.3)",
                      x: 5
                    }}
                  >
                    <div 
                      className="h-12 w-12 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{
                        background: "rgba(129, 140, 248, 0.3)"
                      }}
                    >
                      <FaLock className="text-xl text-blue-300" />
                    </div>
                    <p className="text-lg text-white">Políticas de Privacidad</p>
                  </motion.div>
                </div>

                <div className="mt-auto pt-6 border-t border-indigo-500 border-opacity-30">
                  <p className="text-sm text-center text-blue-200">
                    © 2024 ComercioApp. Todos los derechos reservados.
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </main>

      {/* Pie de página */}
      <motion.footer 
        className="py-6 px-6 relative z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.8 }}
        style={{
          background: "rgba(15, 23, 42, 0.5)",
          backdropFilter: "blur(4px)"
        }}
      >
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-2 rounded-lg">
                  <FaRocket className="text-white text-xl" />
                </div>
                <h2 className="text-xl font-bold text-white">ComercioApp</h2>
              </div>
              <p className="mt-2 text-blue-300 text-sm">
                Soluciones integrales para tu comercio
              </p>
            </div>
            
            <div className="flex gap-6">
              {["Términos", "Privacidad", "Soporte", "Contacto"].map((item, i) => (
                <motion.a 
                  key={i}
                  href="#" 
                  className="text-blue-300 hover:text-white transition"
                  whileHover={{ y: -2 }}
                >
                  {item}
                </motion.a>
              ))}
            </div>
          </div>
        </div>
      </motion.footer>
    </motion.div>
  );
}