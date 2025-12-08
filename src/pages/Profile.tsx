import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import BottomNav from "../components/BottomNav";
import { getUserProfile, updateUserProfile } from "../services/userService";
import { poiService } from "../services/poiService";

interface UserData {
  id: string;
  name: string;
  email: string;
  phoneNumber?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
}

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<UserData | null>(null);
  const [poiCount, setPoiCount] = useState<number>(0);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Datos del usuario
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/");
          return;
        }
        const data = await getUserProfile(token);
        setUser(data);
      } catch (error) {
        console.error("❌ Error al obtener datos del usuario:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, [navigate]);

  // POIs del usuario (no tocar)
  useEffect(() => {
    const fetchPOIs = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const { data } = await poiService.getAll(token);
        if (Array.isArray(data)) setPoiCount(data.length);
      } catch (err) {
        console.error("❌ Error al obtener POIs:", err);
      }
    };
    fetchPOIs();
  }, []);

  // Funciones para editar perfil
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!user) return;
    const { name, value } = e.target;
    setUser({ ...user, [name]: value });
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem("token");
      if (!token || !user) return;

      const updated = await updateUserProfile(token, {
        name: user.name,
        phoneNumber: user.phoneNumber,
        emergencyContactName: user.emergencyContactName,
        emergencyContactPhone: user.emergencyContactPhone,
      });

      setUser(updated);
      setIsEditing(false);
      alert("✅ Perfil actualizado correctamente");
    } catch (error) {
      alert("❌ Error al actualizar el perfil");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-gray-500">Cargando perfil...</p>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-8 px-4 pb-16">
      {/* Header */}
      <div className="w-full max-w-md flex flex-col items-center mb-6">
        <h1 className="text-3xl font-semibold">{user?.name || "Cargando..."}</h1>
        <p className="text-gray-500">{user?.email || ""}</p>
      </div>

      {/* Stats */}
      <div className="w-full max-w-md grid grid-cols-2 gap-4 mb-8">
        <div
          onClick={() => navigate("/history")}
          className="bg-white shadow-md rounded-lg p-4 flex items-center justify-center cursor-pointer hover:bg-gray-100 transition h-24"
        >
          <span className="text-gray-400 text-sm text-center">Rutas Completadas</span>
        </div>

        <div className="bg-white shadow-md rounded-lg p-4 flex flex-col items-center">
          <span className="text-gray-400 text-sm">POIs Creados</span>
          <span className="text-xl font-bold mt-2">{poiCount}</span>
        </div>
      </div>

      {/* Configuración */}
      <div className="w-full max-w-md bg-white shadow-md rounded-lg p-6 mb-8">
        <h2 className="text-lg font-semibold mb-4">Información personal</h2>

        <div className="space-y-3">
          <div>
            <label className="text-gray-600 font-medium">Nombre</label>
            <input
              type="text"
              name="name"
              value={user?.name || ""}
              onChange={handleChange}
              disabled={!isEditing}
              className="w-full mt-1 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 disabled:bg-gray-100"
            />
          </div>

          <div>
            <label className="text-gray-600 font-medium">Teléfono</label>
            <input
              type="text"
              name="phoneNumber"
              value={user?.phoneNumber || ""}
              onChange={handleChange}
              disabled={!isEditing}
              className="w-full mt-1 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 disabled:bg-gray-100"
            />
          </div>

          <div>
            <label className="text-gray-600 font-medium">Contacto de emergencia</label>
            <input
              type="text"
              name="emergencyContactName"
              value={user?.emergencyContactName || ""}
              onChange={handleChange}
              disabled={!isEditing}
              className="w-full mt-1 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 disabled:bg-gray-100"
            />
          </div>

          <div>
            <label className="text-gray-600 font-medium">Teléfono de emergencia</label>
            <input
              type="text"
              name="emergencyContactPhone"
              value={user?.emergencyContactPhone || ""}
              onChange={handleChange}
              disabled={!isEditing}
              className="w-full mt-1 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 disabled:bg-gray-100"
            />
          </div>
        </div>

        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="mt-4 w-full bg-gray-800 text-white py-2 px-4 rounded hover:bg-gray-900 transition"
          >
            Editar Perfil
          </button>
        ) : (
          <button
            onClick={handleSave}
            disabled={saving}
            className="mt-4 w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 transition"
          >
            {saving ? "Guardando..." : "Guardar Cambios"}
          </button>
        )}
      </div>

      <button
        onClick={handleLogout}
        className="w-full max-w-md bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 transition"
      >
        Cerrar sesión
      </button>

      <BottomNav />
    </div>
  );
};

export default Profile;
