import React from "react";
interface SessionContextType {
    isActive: boolean;
    sessionId: string | null;
    startSession: () => Promise<void>;
    stopSession: () => Promise<void>;
    elapsedTime: number;
}
export declare const SessionProvider: React.FC<{
    children: React.ReactNode;
}>;
export declare const useSession: () => SessionContextType;
export {};
