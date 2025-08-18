import { useNavigate } from "react-router-dom";
import { FaUserAltSlash, FaHome, FaWifi } from "react-icons/fa";
import { motion } from "framer-motion";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <motion.div 
      className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 to-black text-white p-6 overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      {/* Efecto de partículas de fondo */}
      <div className="absolute inset-0 overflow-hidden z-0">
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-blue-500 rounded-full opacity-20"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -20, 0],
              x: [0, Math.random() * 20 - 10, 0],
              opacity: [0.2, 0.5, 0.2],
            }}
            transition={{
              duration: 3 + Math.random() * 5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* Contenido principal */}
      <motion.div 
        className="text-center max-w-2xl relative z-10"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.8 }}
      >
        {/* Animación del número 404 */}
        <motion.div 
          className="text-9xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500"
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 10, -10, 0]
          }}
          transition={{ 
            duration: 1.5,
            repeat: Infinity,
            repeatType: "reverse"
          }}
        >
          404
        </motion.div>

        <motion.h1 
          className="text-4xl font-bold mb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          Página no encontrada
        </motion.h1>

        <motion.p 
          className="text-xl text-gray-300 mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
        >
          Lo sentimos, no pudimos encontrar lo que estás buscando.
        </motion.p>

        {/* Animación de desconexión */}
        <motion.div 
          className="flex justify-center gap-8 mb-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.0, duration: 0.5 }}
        >
          <motion.div
            className="relative"
            animate={{ 
              y: [0, -20, 0],
              transition: { 
                duration: 2, 
                repeat: Infinity,
                repeatType: "reverse"
              }
            }}
          >
            <FaUserAltSlash className="text-6xl text-red-400" />
            <motion.div 
              className="absolute top-0 left-0 w-full h-full"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.7, 0, 0.7]
              }}
              transition={{ 
                duration: 1.5, 
                repeat: Infinity 
              }}
            >
              <div className="w-full h-full rounded-full border-2 border-red-500"></div>
            </motion.div>
          </motion.div>
          
          <motion.div
            className="relative"
            animate={{ 
              y: [0, -15, 0],
              transition: { 
                duration: 2, 
                repeat: Infinity,
                repeatType: "reverse",
                delay: 0.5
              }
            }}
          >
            <FaWifi className="text-6xl text-yellow-400 rotate-45" />
            <motion.div 
              className="absolute top-0 left-0 w-full h-full"
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.7, 0, 0.7]
              }}
              transition={{ 
                duration: 1.5, 
                repeat: Infinity,
                delay: 0.3
              }}
            >
              <div className="w-full h-full rounded-full border-2 border-yellow-500"></div>
            </motion.div>
          </motion.div>
          
          <motion.div
            className="relative"
            animate={{ 
              y: [0, -25, 0],
              transition: { 
                duration: 2, 
                repeat: Infinity,
                repeatType: "reverse",
                delay: 1.0
              }
            }}
          >
            <FaUserAltSlash className="text-6xl text-blue-400" />
            <motion.div 
              className="absolute top-0 left-0 w-full h-full"
              animate={{
                scale: [1, 1.7, 1],
                opacity: [0.7, 0, 0.7]
              }}
              transition={{ 
                duration: 1.5, 
                repeat: Infinity,
                delay: 0.6
              }}
            >
              <div className="w-full h-full rounded-full border-2 border-blue-500"></div>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Botón animado */}
        <motion.button
          onClick={() => navigate("/")}
          className="relative flex items-center justify-center gap-3 bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-8 py-4 rounded-full text-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
          whileHover={{ 
            scale: 1.05,
            boxShadow: "0 10px 25px -5px rgba(59, 130, 246, 0.5)"
          }}
          whileTap={{ scale: 0.95 }}
        >
          <FaHome className="text-xl" />
          <span>Volver al inicio</span>
          
          {/* Efecto de brillo en hover */}
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
      </motion.div>

      {/* Mensaje flotante */}
      <motion.div 
        className="absolute bottom-6 text-gray-500 text-sm"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5, duration: 0.5 }}
      >
        ¿Te perdiste en el ciberespacio?
      </motion.div>
    </motion.div>
  );
}