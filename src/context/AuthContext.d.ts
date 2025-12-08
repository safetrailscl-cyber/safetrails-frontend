import React from "react";
interface AuthContextValue {
    token: string | null;
    user: any | null;
    logout: () => void;
}
export declare const AuthProvider: React.FC<{
    children: React.ReactNode;
}>;
export declare const useAuth: () => AuthContextValue;
export {};
