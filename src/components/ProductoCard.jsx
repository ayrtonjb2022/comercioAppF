// src/components/ProductoCard.jsx
import { FaEdit, FaTrash } from "react-icons/fa";

export default function ProductoCard({ producto, onEditar, onEliminar }) {
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
    <div className="bg-white border rounded-lg shadow-md p-4 flex flex-col justify-between transition hover:shadow-lg">
      <div className="mb-2">
        <h3 className="text-lg font-semibold text-gray-800">{nombre}</h3>
        {descripcion && (
          <p className="text-sm text-gray-500 line-clamp-2">{descripcion}</p>
        )}
        <p className="text-sm text-gray-600 mt-1">
          <span className="font-medium">Categoría:</span>{" "}
          {categoria || "Sin categoría"}
        </p>
        <p className="text-sm text-gray-600 mt-1">
          <span className="font-medium">Stock:</span>{" "}
          <span
            className={`${
              cantidad <= 5
                ? "text-red-600 font-bold"
                : "text-green-600 font-medium"
            }`}
          >
            {cantidad}
          </span>
        </p>
        <p className="text-sm text-gray-600 mt-1">
          <span className="font-medium">Precio Venta:</span> ${precioVenta}{" "}
          <span className="text-xs text-gray-400">
            (Compra: ${precioCompra})
          </span>
        </p>
        <p className="text-sm text-gray-600 mt-1">
          <span className="font-medium">% Ganancia:</span>{" "}
          {porcentajeGanancia}%
        </p>
      </div>

      <div className="flex justify-between items-center mt-4">
        <span
          className={`text-xs px-2 py-1 rounded-full ${
            activo ? "bg-green-100 text-green-700" : "bg-gray-300 text-gray-600"
          }`}
        >
          {activo ? "Activo" : "Inactivo"}
        </span>

        <div className="flex gap-2">
          <button
            onClick={onEditar}
            className="text-blue-600 hover:text-blue-800"
            aria-label="Editar producto"
          >
            <FaEdit />
          </button>
          <button
            onClick={onEliminar}
            className="text-red-600 hover:text-red-800"
            aria-label="Eliminar producto"
          >
            <FaTrash />
          </button>
        </div>
      </div>
    </div>
  );
}
