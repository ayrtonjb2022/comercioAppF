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
  FaTimes,
  FaChevronRight
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
  const [collapsed, setCollapsed] = useState(() => {
    return localStorage.getItem('sidebarCollapsed') === 'true';
  });
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

  // Guardar estado en localStorage cuando cambie
  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', collapsed.toString());
  }, [collapsed]);

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

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  const handleItemClick = (id) => {
    onSelect(id);
    if (isMobile) setOpen(false);
  };

  return (
    <>
      {/* Botón móvil */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setOpen(!open)}
          className="text-gray-700 text-xl bg-white p-2 rounded-lg shadow-lg border"
          aria-label="Abrir menú"
        >
          {open ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      {/* Overlay para móviles */}
      {open && isMobile && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed md:static
          h-screen bg-white border-r border-gray-200 flex flex-col 
          z-40 transition-all duration-300
          ${collapsed ? "w-16" : "w-64"}
          ${open ? "left-0" : "-left-full"} 
          md:left-0
        `}
      >
        {/* Encabezado */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-3 min-w-0">
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0">
              <FaUser className="text-white text-sm" />
            </div>
            
            {!collapsed && (
              <div className="min-w-0 flex-1">
                <div className="font-semibold text-gray-900 text-sm truncate">Admin User</div>
                <div className="text-xs text-gray-500 truncate">Administrador</div>
              </div>
            )}
          </div>
          
          {/* Botón de toggle - solo mostrar en desktop */}
          <button
            onClick={toggleSidebar}
            className="hidden md:flex text-gray-500 hover:text-gray-700 p-1 rounded hover:bg-gray-100 transition-colors flex-shrink-0"
            aria-label={collapsed ? "Expandir menú" : "Contraer menú"}
          >
            <FaChevronRight className={`transition-transform duration-300 ${collapsed ? "rotate-180" : ""}`} />
          </button>
        </div>

        {/* Menú principal */}
        <nav className="flex-1 flex flex-col overflow-y-auto p-2">
          {MENU_ITEMS.map(({ id, label, icon }) => (
            <button
              key={id}
              onClick={() => handleItemClick(id)}
              className={`
                group flex items-center w-full p-2 rounded-lg transition-all
                hover:bg-gray-50
                ${selected === id
                  ? "bg-blue-50 text-blue-700 border border-blue-200"
                  : "text-gray-600 hover:text-gray-900"
                }
                ${collapsed ? "justify-center" : ""}
              `}
              aria-label={label}
            >
              <span className={`
                text-lg transition-colors flex-shrink-0
                ${selected === id ? "text-blue-600" : "text-gray-500"}
                ${collapsed ? "" : "mr-3"}
              `}>
                {icon}
              </span>
              
              {/* Texto cuando está expandido */}
              {!collapsed && (
                <span className="text-sm font-medium truncate text-left flex-1">
                  {label}
                </span>
              )}
              
              {/* Tooltip cuando está colapsado */}
              {collapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 shadow-lg">
                  {label}
                </div>
              )}
            </button>
          ))}
        </nav>

        {/* Pie de página */}
        <div className="p-3 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className={`
              flex items-center w-full p-2 rounded-lg text-red-600 
              hover:bg-red-50 hover:text-red-700 transition-colors
              ${collapsed ? "justify-center" : ""}
            `}
          >
            <FaSignOutAlt />
            {!collapsed && (
              <span className="ml-3 text-sm font-medium truncate">Cerrar sesión</span>
            )}
            
            {/* Tooltip cuando está colapsado */}
            {collapsed && (
              <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 shadow-lg">
                Cerrar sesión
              </div>
            )}
          </button>
          
          {/* Versión solo cuando está expandido */}
          {!collapsed && (
            <div className="mt-2 pt-2 border-t border-gray-100">
              <div className="text-xs text-gray-400 text-center">
                <div>v2.0.1</div>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}