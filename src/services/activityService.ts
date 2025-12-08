import axios from "axios";

const API_URL = "http://localhost:4000/api/activities"; // 👈 cambia si tu backend usa otro dominio o puerto

// Obtener todas las rutas de un usuario
export const getUserActivities = async (userId: string) => {
  try {
    const response = await axios.get(`${API_URL}/user/${userId}`);
    return response.data;
  } catch (error) {
    console.error("Error al obtener las actividades del usuario:", error);
    throw error;
  }
};
