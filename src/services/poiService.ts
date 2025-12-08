import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

export interface POIData {
  lat: number;
  lng: number;
  radius?: number;
  category: "ten_precaucion" | "reduce_velocidad" | "cuidado";
}

export const poiService = {
  async getAll(token: string) {
    return axios.get(`${API_URL}/poi/my`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  async create(data: POIData, token: string) {
    return axios.post(`${API_URL}/poi`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  async update(id: string, data: POIData, token: string) {
    return axios.put(`${API_URL}/poi/${id}`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  async delete(id: string, token: string) {
    return axios.delete(`${API_URL}/poi/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },
};
