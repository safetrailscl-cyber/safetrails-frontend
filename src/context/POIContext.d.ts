import React from "react";
import type { POIData } from "../services/poiService";
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
    setRadiusConfig: (config: RadiusConfig | ((prev: RadiusConfig) => RadiusConfig)) => void;
    loading: boolean;
    error: string | null;
    fetchPOI: () => Promise<void>;
    createPOI: (data: POIData) => Promise<void>;
    updatePOI: (id: string, data: Partial<POIData>) => Promise<void>;
    deletePOI: (id: string) => Promise<void>;
}
export declare const POIProvider: ({ children }: {
    children: React.ReactNode;
}) => import("react/jsx-runtime").JSX.Element;
export declare const usePOI: () => POIContextType;
export {};
