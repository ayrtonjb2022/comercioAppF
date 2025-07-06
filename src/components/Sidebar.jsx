import {
  FaCashRegister,
  FaBoxOpen,
  FaChartBar,
  FaBoxes,
  FaCog,
  FaSignOutAlt,
  FaBars,
  FaListAlt,
} from "react-icons/fa";
import { useState } from "react";
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
  const [open, setOpen] = useState(false); // Para manejar el menú en mobile

  const handleLogout = () => {
    sessionStorage.removeItem("token");
    navigate("/login");
    alert("Cerrando sesión...");
  };

  return (
    <>
      {/* Botón visible solo en mobile */}
      <div className="md:hidden p-4 fixed top-0 left-0 z-40">
        <button
          onClick={() => setOpen(!open)}
          className="text-white text-2xl"
          aria-label="Abrir menú"
        >
          <FaBars />
        </button>
      </div>

      <aside
        className={`${
          collapsed ? "w-20" : "w-64"
        } h-screen bg-gray-900 text-white flex flex-col shadow-lg transition-all duration-300
        fixed z-30 transform transition-transform
        ${open ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 md:relative`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          {!collapsed && (
            <h1 className="text-xl font-bold select-none whitespace-nowrap">
              MiSistema
            </h1>
          )}
          <button
            onClick={() => {
              if (window.innerWidth < 768) {
                setOpen(false);
              }
              setCollapsed(!collapsed);
            }}
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
              onClick={() => {
                onSelect(id);
                if (window.innerWidth < 768) setOpen(false); // Auto cerrar en mobile
              }}
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
    </>
  );
}
