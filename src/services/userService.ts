const API_URL = import.meta.env.VITE_API_URL; // apunta al backend en Render

export const getUserProfile = async (token: string) => {
  const response = await fetch(`${API_URL}/users/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error("Error al obtener perfil");
  return response.json();
};

export const updateUserProfile = async (token: string, data: any) => {
  const response = await fetch(`${API_URL}/users/me`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Error al actualizar perfil");
  return response.json();
};
