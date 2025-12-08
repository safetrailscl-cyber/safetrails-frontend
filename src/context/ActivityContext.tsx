import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import axios from "axios";
import { useAlarm } from "./AlarmContext";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

export interface Coordinate {
  lat: number;
  lng: number;
  altitude?: number;
  timestamp: Date;
}

interface ActivityContextValue {
  isSharing: boolean;
  seconds: number;
  elapsedTimeFormatted: string;
  sessionId: string | null;
  coordinates: Coordinate[];
  startActivity: () => Promise<void>;
  stopActivity: () => Promise<void>;
  addCoordinate: (coord: Coordinate) => void;
}

const ActivityContext = createContext<ActivityContextValue>({
  isSharing: false,
  seconds: 0,
  elapsedTimeFormatted: "00:00:00",
  sessionId: null,
  coordinates: [],
  startActivity: async () => {},
  stopActivity: async () => {},
  addCoordinate: () => {},
});

export const ActivityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { checkProximityAlarm } = useAlarm();

  const [isSharing, setIsSharing] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [sessionId, setSessionId] = useState<string | null>(() =>
    localStorage.getItem("activeSessionId")
  );
  const [coordinates, setCoordinates] = useState<Coordinate[]>([]);

  const intervalRef = useRef<number | null>(null);
  const stoppingRef = useRef(false);

  // === TIMER ===
  const format = (s: number) => {
    const hrs = String(Math.floor(s / 3600)).padStart(2, "0");
    const mins = String(Math.floor((s % 3600) / 60)).padStart(2, "0");
    const secs = String(s % 60).padStart(2, "0");
    return `${hrs}:${mins}:${secs}`;
  };

  const startInterval = () => {
    if (intervalRef.current) return;
    intervalRef.current = window.setInterval(
      () => setSeconds((prev) => prev + 1),
      1000
    );
  };

  const clearIntervalRef = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  // === RESTAURACIÓN DE SESIÓN ===
  useEffect(() => {
    const savedSessionId = localStorage.getItem("activeSessionId");
    const savedStart = localStorage.getItem("activeSessionStart");

    if (savedSessionId && savedStart) {
      const diffSec = Math.floor((Date.now() - new Date(savedStart).getTime()) / 1000);

      // evitar sesiones antiguas
      if (diffSec > 60 * 60 * 12) {
        localStorage.removeItem("activeSessionId");
        localStorage.removeItem("activeSessionStart");
        return;
      }

      setSessionId(savedSessionId);
      setSeconds(diffSec >= 0 ? diffSec : 0);
      setIsSharing(true);
      startInterval();
    }

    return () => clearIntervalRef();
  }, []);

  // === INICIAR ACTIVIDAD ===
  const startActivity = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No auth token");

      const res = await axios.post(
        `${BASE_URL}/sessions/start`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const sid = res.data._id;
      const startTime = res.data.startTime;

      localStorage.setItem("activeSessionId", sid);
      localStorage.setItem("activeSessionStart", startTime);

      setSessionId(sid);
      setIsSharing(true);
      setCoordinates([]);
      setSeconds(0);
      stoppingRef.current = false;

      clearIntervalRef();
      startInterval();
    } catch (err) {
      console.error("Error starting activity", err);
    }
  };

  // === DETENER ACTIVIDAD ===
  const stopActivity = async () => {
    if (stoppingRef.current) return;
    stoppingRef.current = true;

    try {
      const token = localStorage.getItem("token");
      if (!token || !sessionId) return;

      const filteredCoords = coordinates;
      const totalDistance = calculateDistance(filteredCoords);

      let elevationGain = 0;
      if (filteredCoords.length > 0) {
        const altitudes = filteredCoords.map((c) => c.altitude ?? 0);
        elevationGain = Math.max(...altitudes) - Math.min(...altitudes);
      }

      await axios.patch(
        `${BASE_URL}/sessions/stop`,
        {
          sessionId,
          coordinates: filteredCoords,
          distance: totalDistance,
          elevationGain,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setIsSharing(false);
      setSessionId(null);
      setCoordinates([]);
      setSeconds(0);

      localStorage.removeItem("activeSessionId");
      localStorage.removeItem("activeSessionStart");
      clearIntervalRef();
    } catch (err) {
      console.error("Error stopping activity", err);
    } finally {
      stoppingRef.current = false;
    }
  };

  // === AGREGAR COORDENADA + ALARMA DE PROXIMIDAD ===
  const addCoordinate = (newCoord: Coordinate) => {
    setCoordinates((prev) => {
      if (prev.length > 0) {
        const last = prev[prev.length - 1];
        const dist = getDistanceFromLatLonInMeters(last.lat, last.lng, newCoord.lat, newCoord.lng);

        if (dist < 5) return prev; // ignorar movimientos pequeños
      }

      // 🔔 Aquí disparamos la alarma correctamente
      checkProximityAlarm(newCoord);

      return [...prev, newCoord];
    });
  };

  return (
    <ActivityContext.Provider
      value={{
        isSharing,
        seconds,
        elapsedTimeFormatted: format(seconds),
        sessionId,
        coordinates,
        startActivity,
        stopActivity,
        addCoordinate,
      }}
    >
      {children}
    </ActivityContext.Provider>
  );
};

export const useActivity = () => useContext(ActivityContext);

// === HELPERS ===
function calculateDistance(coords: Coordinate[]) {
  if (!coords || coords.length < 2) return 0;

  let total = 0;
  for (let i = 1; i < coords.length; i++) {
    const a = coords[i - 1];
    const b = coords[i];
    total += getDistanceFromLatLonInMeters(a.lat, a.lng, b.lat, b.lng);
  }
  return total;
}

function getDistanceFromLatLonInMeters(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371000;
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function deg2rad(deg: number) {
  return deg * (Math.PI / 180);
}
