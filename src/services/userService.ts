const API_URL = "http://localhost:4000/api/users";

export const getUserProfile = async (token: string) => {
  const response = await fetch(`${API_URL}/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error("Error al obtener perfil");
  return response.json();
};

export const updateUserProfile = async (token: string, data: any) => {
  const response = await fetch(`${API_URL}/me`, {
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
