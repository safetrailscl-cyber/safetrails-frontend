import React, { createContext, useState, useEffect, useContext } from "react";
import axios from "axios";

interface SessionContextType {
  isActive: boolean;
  sessionId: string | null;
  startSession: () => Promise<void>;
  stopSession: () => Promise<void>;
  elapsedTime: number;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const SessionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isActive, setIsActive] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [startTime, setStartTime] = useState<Date | null>(null);

  // ⏱️ Cronómetro
  useEffect(() => {
    let interval: any;
    if (isActive && startTime) {
      interval = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTime.getTime()) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive, startTime]);

  // 🚀 Iniciar sesión
  const startSession = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/sessions/start`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setIsActive(true);
      setSessionId(res.data._id);
      setStartTime(new Date());
      setElapsedTime(0);
    } catch (error) {
      console.error("Error al iniciar sesión:", error);
    }
  };

  // 🛑 Detener sesión
  const stopSession = async () => {
    try {
      if (!sessionId) return;
      const token = localStorage.getItem("token");
      await axios.patch(
        `${import.meta.env.VITE_API_URL}/sessions/stop/${sessionId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setIsActive(false);
      setSessionId(null);
    } catch (error) {
      console.error("Error al detener sesión:", error);
    }
  };

  return (
    <SessionContext.Provider value={{ isActive, sessionId, startSession, stopSession, elapsedTime }}>
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = () => {
  const context = useContext(SessionContext);
  if (!context) throw new Error("useSession debe usarse dentro de un SessionProvider");
  return context;
};
