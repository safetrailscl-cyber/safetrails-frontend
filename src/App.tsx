// src/App.tsx
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { useEffect, useRef } from "react";

import MapPage from "./pages/MapPage";
import LoginPage from "./pages/LoginPage";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import HistoryPage from "./pages/HistoryPage";

import BottomNav from "./components/BottomNav";

import { ActivityProvider } from "./context/ActivityContext";
import { AuthProvider } from "./context/AuthContext";
import { POIProvider } from "./context/POIContext";
import { AlarmProvider } from "./context/AlarmContext";

// ⭐ CORRECTO: AlarmEngine es un COMPONENTE, NO un hook
import AlarmEngine from "./components/AlarmEngine";


// ----------------------
// AppContent
// ----------------------
function AppContent() {
  const location = useLocation();
  const hideNav = location.pathname === "/";

  return (
    <div className="relative h-screen w-full">
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/map" element={<MapPage />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/history" element={<HistoryPage />} />
      </Routes>

      {!hideNav && <BottomNav />}
    </div>
  );
}


// ----------------------
// App principal
// ----------------------
export default function App() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timeoutRef = useRef<number | null>(null);

  // ----------------------
  // Listener de alarmas
  // ----------------------
  useEffect(() => {
    const playAlarm = (event: Event) => {
      const ce = event as CustomEvent<{ category?: string }>;
      const category = ce?.detail?.category;
      if (!category) return;

      let parsed: any = null;
      try {
        const raw = localStorage.getItem("alarmDurations");
        if (raw) parsed = JSON.parse(raw);
      } catch {
        parsed = null;
      }

      let durationMs = 2000;

      switch (category) {
        case "ten_precaucion":
          durationMs = parsed?.ten_precaucion ?? 1500;
          break;
        case "reduce_velocidad":
          durationMs = parsed?.reduce_velocidad ?? 3500;
          break;
        case "cuidado":
          durationMs = parsed?.cuidado ?? 6000;
          break;
        default:
          durationMs = parsed?.default ?? 2000;
      }

      // Detener alarma previa
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }

      // Reproducir alarma
      const audio = new Audio("/alarm.mp3");
      audioRef.current = audio;
      audio.play().catch((err) => console.error("Error reproducir alarma:", err));

      timeoutRef.current = window.setTimeout(() => {
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
        }
        timeoutRef.current = null;
      }, durationMs);
    };

    window.addEventListener("play-alarm", playAlarm);

    return () => {
      window.removeEventListener("play-alarm", playAlarm);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);


  // ----------------------
  // Render
  // ----------------------
  return (
    <Router>
      <AuthProvider>
        <ActivityProvider>
          <POIProvider>
            <AlarmProvider>

              {/* ⭐ INTEGRACIÓN CORRECTA DE ALARMENGINE */}
              <AlarmEngine />

              <AppContent />

            </AlarmProvider>
          </POIProvider>
        </ActivityProvider>
      </AuthProvider>
    </Router>
  );
}
