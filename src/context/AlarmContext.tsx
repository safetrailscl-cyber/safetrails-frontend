// src/context/AlarmContext.tsx
import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import type { Coordinate } from "./ActivityContext"; // solo tipo
import { usePOI } from "./POIContext";
import type { POIType, POICategory, RadiusConfig } from "./POIContext";

export type AlarmType = "vibracion" | "sonido" | "ambos";

interface AlarmContextValue {
  alarmaActiva: boolean;
  setAlarmaActiva: (v: boolean) => void;
  tipoAlarma: AlarmType;
  setTipoAlarma: (v: AlarmType) => void;
  singleTrigger: boolean;
  setSingleTrigger: (v: boolean) => void;
  checkProximityAlarm: (coord: Coordinate) => void;
}

const defaults = {
  alarmaActiva: true,
  tipoAlarma: "vibracion" as AlarmType,
  singleTrigger: true,
};

const LOCAL_KEY = "safetrails_alarm_settings_v1";

const AlarmContext = createContext<AlarmContextValue>({
  alarmaActiva: defaults.alarmaActiva,
  setAlarmaActiva: () => {},
  tipoAlarma: defaults.tipoAlarma,
  setTipoAlarma: () => {},
  singleTrigger: defaults.singleTrigger,
  setSingleTrigger: () => {},
  checkProximityAlarm: () => {},
});

export const AlarmProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { pois, radiusConfig } = usePOI();
  const alarmLockRef = useRef(false);

  const [alarmaActiva, _setAlarmaActiva] = useState(defaults.alarmaActiva);
  const [tipoAlarma, _setTipoAlarma] = useState<AlarmType>(defaults.tipoAlarma);
  const [singleTrigger, _setSingleTrigger] = useState(defaults.singleTrigger);

  // Persistir configuración
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LOCAL_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (typeof parsed.alarmaActiva === "boolean") _setAlarmaActiva(parsed.alarmaActiva);
        if (parsed.tipoAlarma) _setTipoAlarma(parsed.tipoAlarma);
        if (typeof parsed.singleTrigger === "boolean") _setSingleTrigger(parsed.singleTrigger);
      }
    } catch (e) {
      console.warn("Error leyendo Alarm settings", e);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(
        LOCAL_KEY,
        JSON.stringify({ alarmaActiva, tipoAlarma, singleTrigger })
      );
    } catch (e) {
      console.warn("Error guardando Alarm settings", e);
    }
  }, [alarmaActiva, tipoAlarma, singleTrigger]);

  const setAlarmaActiva = (v: boolean) => _setAlarmaActiva(v);
  const setTipoAlarma = (v: AlarmType) => _setTipoAlarma(v);
  const setSingleTrigger = (v: boolean) => _setSingleTrigger(v);

  const severityOrder: Record<POICategory, number> = {
    ten_precaucion: 1,
    reduce_velocidad: 2,
    cuidado: 3,
  };

  const checkProximityAlarm = (coord: Coordinate) => {
    if (!alarmaActiva || pois.length === 0) return;

    let mostSevere: POIType | null = null;

    for (const poi of pois) {
      const dist = getDistanceFromLatLonInMeters(coord.lat, coord.lng, poi.lat, poi.lng);
      // ✅ Indicar clave explícita
      const radius = radiusConfig[poi.category as keyof RadiusConfig] ?? 15;
      if (dist <= radius) {
        if (!mostSevere) mostSevere = poi;
        else if (severityOrder[poi.category] > severityOrder[mostSevere.category]) mostSevere = poi;
      }
    }

    if (mostSevere) {
      if (!alarmLockRef.current || !singleTrigger) {
        alarmLockRef.current = true;

        const ev = new CustomEvent("play-alarm", {
          detail: { category: mostSevere.category, poiId: mostSevere._id },
        });
        window.dispatchEvent(ev);
      }
      return;
    }

    alarmLockRef.current = false;
  };

  return (
    <AlarmContext.Provider
      value={{
        alarmaActiva,
        setAlarmaActiva,
        tipoAlarma,
        setTipoAlarma,
        singleTrigger,
        setSingleTrigger,
        checkProximityAlarm,
      }}
    >
      {children}
    </AlarmContext.Provider>
  );
};

export const useAlarm = () => useContext(AlarmContext);

// ---- Helpers ----
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
