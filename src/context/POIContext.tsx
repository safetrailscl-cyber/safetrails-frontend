// src/context/POIContext.tsx

import React, { createContext, useContext, useEffect, useState } from "react";
import type { POIData } from "../services/poiService";
import { poiService } from "../services/poiService";
import { useAuth } from "./AuthContext";

/* ---------------- Tipos ---------------- */

export type POICategory = "ten_precaucion" | "reduce_velocidad" | "cuidado";

export type RadiusConfig = Record<POICategory, number>;

export type POIType = {
  _id?: string;
  lat: number;
  lng: number;
  radius?: number;
  category: POICategory;
  createdBy?: string;
};

interface POIContextType {
  pois: POIType[];
  radiusConfig: RadiusConfig;
  setRadiusConfig: (
    config: RadiusConfig | ((prev: RadiusConfig) => RadiusConfig)
  ) => void;

  loading: boolean;
  error: string | null;

  fetchPOI: () => Promise<void>;
  createPOI: (data: POIData) => Promise<void>;
  updatePOI: (id: string, data: Partial<POIData>) => Promise<void>;
  deletePOI: (id: string) => Promise<void>;
}

/* ---------------- Valores por defecto ---------------- */

const DEFAULT_RADIUS: RadiusConfig = {
  ten_precaucion: 5,
  reduce_velocidad: 10,
  cuidado: 15,
};

/* ---------------- Contexto ---------------- */

const POIContext = createContext<POIContextType | undefined>(undefined);

export const POIProvider = ({ children }: { children: React.ReactNode }) => {
  const { token } = useAuth();

  const [pois, setPois] = useState<POIType[]>([]);
  const [radiusConfig, _setRadiusConfig] = useState<RadiusConfig>(DEFAULT_RADIUS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* Permite setState tradicional Y versión con función updater */
  const setRadiusConfig = (
    config: RadiusConfig | ((prev: RadiusConfig) => RadiusConfig)
  ) => {
    if (typeof config === "function") {
      _setRadiusConfig((prev) => (config as (p: RadiusConfig) => RadiusConfig)(prev));
    } else {
      _setRadiusConfig(config);
    }
  };

  /* Normalización segura */
  const normalizePOI = (raw: any): POIType => {
    const lat = Number(raw.lat);
    const lng = Number(raw.lng);

    const category: POICategory =
      raw.category === "ten_precaucion" ||
      raw.category === "reduce_velocidad" ||
      raw.category === "cuidado"
        ? raw.category
        : "ten_precaucion";

    const radius =
      raw.radius != null ? Number(raw.radius) : radiusConfig[category];

    return {
      _id: raw._id ?? raw.id,
      lat,
      lng,
      radius,
      category,
      createdBy: raw.createdBy ?? raw.user,
    };
  };

  /* Cargar POI */
  const fetchPOI = async () => {
    if (!token) return;

    try {
      setLoading(true);
      const res = await poiService.getAll(token);
      const arr = res.data?.data ?? res.data ?? [];

      setPois(Array.isArray(arr) ? arr.map(normalizePOI) : []);
    } catch (err) {
      console.error(err);
      setError("Error al cargar POI");
    } finally {
      setLoading(false);
    }
  };

  /* Crear */
  const createPOI = async (data: POIData) => {
    if (!token) return;

    const res = await poiService.create(data, token);
    const poi = normalizePOI(res.data?.data ?? res.data);

    setPois((prev) => [...prev, poi]);
  };

  /* Editar */
  const updatePOI = async (id: string, data: Partial<POIData>) => {
    if (!token) return;

    const res = await poiService.update(id, data as POIData, token);
    const poi = normalizePOI(res.data?.data ?? res.data);

    setPois((prev) => prev.map((p) => (p._id === id ? poi : p)));
  };

  /* Eliminar */
  const deletePOI = async (id: string) => {
    if (!token) return;

    await poiService.delete(id, token);
    setPois((prev) => prev.filter((p) => p._id !== id));
  };

  useEffect(() => {
    fetchPOI();
  }, [token]);

  return (
    <POIContext.Provider
      value={{
        pois,
        radiusConfig,
        setRadiusConfig,
        loading,
        error,
        fetchPOI,
        createPOI,
        updatePOI,
        deletePOI,
      }}
    >
      {children}
    </POIContext.Provider>
  );
};

export const usePOI = () => {
  const ctx = useContext(POIContext);
  if (!ctx) throw new Error("usePOI debe usarse dentro de POIProvider");
  return ctx;
};
