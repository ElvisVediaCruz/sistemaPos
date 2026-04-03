import { useNavigate } from 'react-router-dom';

const Unauthorized = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-300">403</h1>
        <p className="text-gray-600 mt-2 mb-6">No tienes permiso para acceder a esta página.</p>
        <button
          onClick={() => navigate(-1)}
          className="bg-primary-600 text-white px-5 py-2 rounded-lg text-sm hover:bg-primary-700"
        >
          Volver
        </button>
      </div>
    </div>
  );
};

export default Unauthorized;
