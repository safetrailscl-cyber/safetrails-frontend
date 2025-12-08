import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

export const getUserActivities = async (userId: string) => {
  try {
    const response = await axios.get(`${API_URL}/user/${userId}`);
    return response.data;
  } catch (error) {
    console.error("Error al obtener las actividades del usuario:", error);
    throw error;
  }
};