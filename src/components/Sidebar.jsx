import {
  FaCashRegister,
  FaBoxOpen,
  FaChartBar,
  FaBoxes,
  FaCog,
  FaSignOutAlt,
  FaBars,
  FaListAlt,
  FaUser,
  FaTimes
} from "react-icons/fa";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const MENU_ITEMS = [
  { id: "cajaventa", label: "Caja Venta", icon: <FaCashRegister /> },
  { id: "productos", label: "Productos", icon: <FaBoxOpen /> },
  { id: "analisis", label: "Análisis", icon: <FaChartBar /> },
  { id: "cajasdiarias", label: "Cajas Diarias", icon: <FaBoxes /> },
  { id: "configuracion", label: "Configuración", icon: <FaCog /> },
  { id: "VentasDetalle", label: "Ventas Detalle", icon: <FaListAlt /> },
];

export default function Sidebar({ selected, onSelect }) {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(true);
  const [open, setOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem("token");
    navigate("/login");
    salirPantallaCompleta();
  };

  const salirPantallaCompleta = () => {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen();
    }
  };

  return (
    <>
      {/* Botón móvil - Manteniendo simplicidad */}
      <div className="md:hidden p-4 fixed top-0 left-0 z-40">
        <button
          onClick={() => setOpen(!open)}
          className="text-white text-2xl bg-gray-800 p-2 rounded-lg"
          aria-label="Abrir menú"
        >
          {open ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      {/* Overlay para móviles - Solo cuando está abierto */}
      {open && isMobile && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={`h-screen bg-gray-900 text-white flex flex-col 
        fixed z-40 transition-all duration-300
        ${collapsed ? "w-35" : "w-64"}
        ${open ? "left-0" : "-left-full"} 
        md:left-0 md:relative`}
      >
        {/* Encabezado mejorado */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0">
              <FaUser className="text-white" />
            </div>
            
            {!collapsed && (
              <div className="overflow-hidden">
                <div className="font-medium truncate">Admin User</div>
                <div className="text-xs text-gray-400 truncate">Administrador</div>
              </div>
            )}
          </div>
          
          <button
            onClick={() => {
              if (isMobile) setOpen(false);
              setCollapsed(!collapsed);
            }}
            className="text-white text-xl hover:text-gray-400 ml-2"
            aria-label="Toggle sidebar"
          >
            {collapsed ? <FaBars /> : <FaTimes />}
          </button>
        </div>

        {/* Menú principal - Estilo optimizado para usar todo el espacio */}
<nav className="flex-1 flex flex-col gap-1 mt-1 overflow-y-auto px-1 py-2">
  {MENU_ITEMS.map(({ id, label, icon }) => (
    <button
      key={id}
      onClick={() => {
        onSelect(id);
        if (isMobile) setOpen(false);
      }}
      className={`flex items-center gap-3 w-full px-4 py-3.5 text-left rounded-lg transition-all
        ${selected === id
          ? "bg-blue-600 font-semibold text-white shadow-md"
          : "text-gray-300 hover:bg-gray-700"
        }`}
      aria-label={label}
    >
      <span className={`text-xl flex-shrink-0 ${selected === id ? "text-white" : "text-blue-400"}`}>
        {icon}
      </span>
      {!collapsed && (
        <span className="truncate flex-grow font-medium">{label}</span>
      )}
    </button>
  ))}
</nav>

        {/* Botón cerrar sesión */}
        <div className="p-4 border-t border-gray-700">
          <button
            onClick={handleLogout}
            className={`flex items-center gap-3 w-full px-4 py-3 text-left rounded-md bg-gray-800 text-red-400 hover:bg-red-600 hover:text-white transition
            ${collapsed ? "justify-center" : ""}`}
          >
            <FaSignOutAlt />
            {!collapsed && <span className="truncate">Cerrar sesión</span>}
          </button>
        </div>
        
        {/* Pie de página solo cuando está expandido */}
        {!collapsed && (
          <div className="px-4 py-2 text-xs text-gray-500 border-t border-gray-800 text-center">
            <div>v2.0.1</div>
            <div className="mt-1">© 2024 MiSistema</div>
          </div>
        )}
      </aside>
    </>
  );
}