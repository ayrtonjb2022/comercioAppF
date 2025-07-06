import { useNavigate } from "react-router-dom";
import { FaUserAltSlash } from "react-icons/fa";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 text-gray-800 p-6">
      <div className="text-center">
        <div className="text-6xl mb-4">404</div>
        <h1 className="text-2xl font-semibold mb-2">Página no encontrada</h1>
        <p className="mb-6 text-gray-600">
          Lo sentimos, no pudimos encontrar lo que estás buscando.
        </p>

        {/* Íconos de personas desconectadas */}
        <div className="flex justify-center gap-8 text-6xl text-red-400 mb-6">
          <FaUserAltSlash />
          <FaUserAltSlash />
        </div>

        <button
          onClick={() => navigate("/")}
          className="bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700 transition"
        >
          Volver al inicio
        </button>
      </div>
    </div>
  );
}
