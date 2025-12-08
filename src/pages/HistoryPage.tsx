import React, { useEffect, useState } from "react";
import axios from "axios";
//import { useNavigate } from "react-router-dom";
import BottomNav from "../components/BottomNav";

interface Session {
  _id: string;
  startTime: string;
  endTime?: string;
  duration?: number;
  distance?: number;
  avgSpeed?: number;
  elevationGain?: number;
}

const HistoryPage: React.FC = () => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  //const navigate = useNavigate();

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No auth token");

      const res = await axios.get(`${import.meta.env.VITE_API_URL}/sessions/history`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setSessions(res.data);
    } catch (err) {
      console.error("Error fetching history:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Seguro que deseas eliminar esta ruta?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${import.meta.env.VITE_API_URL}/sessions/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSessions((prev) => prev.filter((s) => s._id !== id));
      alert("Ruta eliminada correctamente");
    } catch (err) {
      console.error("Error al eliminar sesión:", err);
      alert("Error al eliminar la ruta");
    }
  };

  const formatDuration = (sec?: number) => {
    if (!sec) return "00:00:00";
    const hrs = String(Math.floor(sec / 3600)).padStart(2, "0");
    const mins = String(Math.floor((sec % 3600) / 60)).padStart(2, "0");
    const secs = String(sec % 60).padStart(2, "0");
    return `${hrs}:${mins}:${secs}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-16 px-4">
      <h1 className="text-2xl font-bold my-6 text-center">Historial de Rutas</h1>
      {loading ? (
        <p className="text-center text-gray-500">Cargando...</p>
      ) : sessions.length === 0 ? (
        <p className="text-center text-gray-500">No tienes rutas completadas aún.</p>
      ) : (
        <ul className="space-y-4">
          {sessions.map((s) => (
            <li key={s._id} className="bg-white shadow-md rounded-lg p-4">
              <p className="text-gray-600 text-sm">
                Fecha: {new Date(s.startTime).toLocaleString()}
              </p>
              <p>Duración: {formatDuration(s.duration)}</p>
            

              <button
                onClick={() => handleDelete(s._id)}
                className="mt-3 bg-red-500 hover:bg-red-600 text-white text-sm px-3 py-1 rounded-md"
              >
                🗑️ Eliminar
              </button>
            </li>
          ))}
        </ul>
      )}
      <BottomNav />
    </div>
  );
};

export default HistoryPage;
