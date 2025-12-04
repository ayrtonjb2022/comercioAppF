// src/components/ProductoCard.jsx
import { FaEdit, FaTrash, FaPowerOff, FaCheck } from "react-icons/fa";

export default function ProductoCard({ 
  producto, 
  onEditar, 
  onDesactivar, 
  onActivar, 
  showActivateButton = false 
}) {
  const {
    nombre,
    cantidad,
    precioCompra,
    precioVenta,
    porcentajeGanancia,
    descripcion,
    categoria,
    activo,
  } = producto;

  return (
    <div className={`bg-white border rounded-lg shadow-md p-4 flex flex-col justify-between transition hover:shadow-lg ${
      !activo ? "opacity-70 bg-gray-50" : ""
    }`}>
      <div className="mb-2">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-semibold text-gray-800">{nombre}</h3>
          {!activo && (
            <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded">
              Inactivo
            </span>
          )}
        </div>
        
        {categoria && (
          <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded mt-1 mb-2">
            {categoria}
          </span>
        )}
        
        {descripcion && (
          <p className="text-sm text-gray-500 line-clamp-2 mt-2">{descripcion}</p>
        )}
        
        <div className="grid grid-cols-2 gap-2 mt-3">
          <div>
            <p className="text-sm text-gray-600">
              <span className="font-medium">Stock:</span>
            </p>
            <p className={`text-lg font-medium ${cantidad <= 5 ? "text-red-600" : "text-green-600"}`}>
              {cantidad} unidades
            </p>
          </div>
          
          <div>
            <p className="text-sm text-gray-600">
              <span className="font-medium">Precio:</span>
            </p>
            <p className="text-lg font-medium text-gray-800">
              ${parseFloat(precioVenta).toFixed(2)}
            </p>
          </div>
          
          <div>
            <p className="text-sm text-gray-600">
              <span className="font-medium">Costo:</span>
            </p>
            <p className="text-sm text-gray-600">
              ${parseFloat(precioCompra).toFixed(2)}
            </p>
          </div>
          
          <div>
            <p className="text-sm text-gray-600">
              <span className="font-medium">Ganancia:</span>
            </p>
            <p className="text-sm font-medium text-green-600">
              {porcentajeGanancia}%
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
        <span className={`text-xs px-2 py-1 rounded-full ${
          activo ? "bg-green-100 text-green-700" : "bg-gray-300 text-gray-600"
        }`}>
          {activo ? "Activo" : "Inactivo"}
        </span>

        <div className="flex gap-2">
          <button
            onClick={onEditar}
            className="text-blue-600 hover:text-blue-800 p-2 rounded-full hover:bg-blue-50"
            aria-label="Editar producto"
          >
            <FaEdit />
          </button>
          
          {showActivateButton ? (
            <button
              onClick={onActivar}
              className="text-green-600 hover:text-green-800 p-2 rounded-full hover:bg-green-50"
              aria-label="Activar producto"
              title="Activar producto"
            >
              <FaCheck />
            </button>
          ) : (
            <button
              onClick={onDesactivar}
              className="text-yellow-600 hover:text-yellow-800 p-2 rounded-full hover:bg-yellow-50"
              aria-label="Desactivar producto"
              title="Desactivar producto"
            >
              <FaPowerOff />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}