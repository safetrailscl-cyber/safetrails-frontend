import React from "react";
import type { Coordinate } from "./ActivityContext";
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
export declare const AlarmProvider: React.FC<{
    children: React.ReactNode;
}>;
export declare const useAlarm: () => AlarmContextValue;
export {};
