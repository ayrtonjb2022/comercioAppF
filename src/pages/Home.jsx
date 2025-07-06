import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  const irALogin = () => {
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 text-white">
      <div className="text-center px-6">
        <h1 className="text-4xl md:text-5xl font-bold mb-6">
          Bienvenido a ComercioApp
        </h1>
        <p className="mb-8 text-lg md:text-xl">
          Gestioná tus ventas y productos de forma fácil y rápida.
        </p>
        <button
          onClick={irALogin}
          className="bg-white text-blue-600 font-semibold px-6 py-3 rounded-full shadow-lg hover:bg-gray-100 transition duration-300"
        >
          Iniciar sesión
        </button>
      </div>
    </div>
  );
}
