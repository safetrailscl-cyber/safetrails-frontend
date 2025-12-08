import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const LoginPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // ✅ Aquí tomamos la IP del backend desde tu .env
      const API = import.meta.env.VITE_API_URL;
      const url = isLogin ? `${API}/users/login` : `${API}/users/register`;

      // 📦 Enviar los datos dependiendo si es login o registro
      const body = isLogin
        ? { email, password }
        : { name, email, password };

      const res = await axios.post(url, body);

      // 💾 Guardar token y usuario en localStorage
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      // ✅ Redirigir al mapa
      navigate("/map");
    } catch (err: any) {
      console.error("⚠️ Error en autenticación:", err.response?.data);
      setError(err.response?.data?.message || "Error desconocido");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-200 to-blue-200">
      <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-md">
        <h2 className="text-3xl font-bold text-center text-green-600 mb-6">
          {isLogin ? "Iniciar Sesión" : "Registrarse"}
        </h2>

        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          {!isLogin && (
            <input
              type="text"
              placeholder="Nombre completo"
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-400"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          )}

          <input
            type="email"
            placeholder="Correo electrónico"
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-400"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Contraseña"
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-400"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button
            type="submit"
            className="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-lg transition"
          >
            {isLogin ? "Entrar" : "Registrarme"}
          </button>
        </form>

        <p className="text-center text-gray-600 mt-4">
          {isLogin ? "¿No tienes cuenta?" : "¿Ya tienes una cuenta?"}
          <button
            className="text-green-600 font-semibold ml-1"
            onClick={() => {
              setIsLogin(!isLogin);
              setError("");
            }}
          >
            {isLogin ? "Regístrate aquí" : "Inicia sesión"}
          </button>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
