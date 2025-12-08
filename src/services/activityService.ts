import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

export const getUserActivities = async (token: string) => {
  try {
    const response = await axios.get(`${API_URL}/sessions/history`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data; // ⚡ se asume que el backend devuelve un array
  } catch (error) {
    console.error("Error al obtener las actividades del usuario:", error);
    return []; // ⚡ evitar que rompa la UI
  }
};
