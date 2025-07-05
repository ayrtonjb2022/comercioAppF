import {
  FaCashRegister,
  FaBoxOpen,
  FaChartBar,
  FaBoxes,
  FaCog,
  FaSignOutAlt,
  FaBars,
    FaListAlt, // Nuevo icono

} from "react-icons/fa";
import { useState } from "react";

const MENU_ITEMS = [
  { id: "cajaventa", label: "Caja Venta", icon: <FaCashRegister /> },
  { id: "productos", label: "Productos", icon: <FaBoxOpen /> },
  { id: "analisis", label: "Análisis", icon: <FaChartBar /> },
  { id: "cajasdiarias", label: "Cajas Diarias", icon: <FaBoxes /> },
  { id: "configuracion", label: "Configuración", icon: <FaCog /> },
  { id: "VentasDetalle", label: "Ventas Detalle", icon: <FaListAlt /> }, // Cambio aquí
];

export default function Sidebar({ selected, onSelect }) {
  const [collapsed, setCollapsed] = useState(true);

  const handleLogout = () => {
    alert("Cerrando sesión...");
    // Aquí podrías limpiar el token o redirigir a login
  };

  return (
    <aside
      className={`${
        collapsed ? "w-20" : "w-64"
      } h-screen bg-gray-900 text-white flex flex-col shadow-lg transition-all duration-300 fixed md:relative z-30`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        {!collapsed && (
          <h1 className="text-xl font-bold select-none whitespace-nowrap">
            MiSistema
          </h1>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-white text-xl hover:text-gray-400"
          aria-label="Toggle sidebar"
        >
          <FaBars />
        </button>
      </div>

      {/* Menú principal */}
      <nav className="flex-1 overflow-y-auto mt-2">
        {MENU_ITEMS.map(({ id, label, icon }) => (
          <button
            key={id}
            onClick={() => onSelect(id)}
            className={`flex items-center gap-3 w-full px-4 py-3 text-left transition-colors rounded-md
              ${
                selected === id
                  ? "bg-blue-600 font-semibold text-white"
                  : "hover:bg-gray-700 text-gray-300"
              }`}
            aria-label={label}
          >
            <span className="text-lg">{icon}</span>
            {!collapsed && <span className="truncate">{label}</span>}
          </button>
        ))}
      </nav>

      {/* Botón cerrar sesión */}
      <div className="p-4">
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 w-full px-4 py-2 bg-gray-800 text-red-400 hover:bg-red-600 rounded-md transition"
        >
          <FaSignOutAlt />
          {!collapsed && <span className="truncate">Cerrar sesión</span>}
        </button>
      </div>
    </aside>
  );
}
