import React from "react";
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
export declare const ActivityProvider: React.FC<{
    children: React.ReactNode;
}>;
export declare const useActivity: () => ActivityContextValue;
export {};
