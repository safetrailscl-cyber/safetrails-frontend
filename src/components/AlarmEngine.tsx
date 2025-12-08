// src/components/AlarmEngine.tsx
import React, { useEffect, useRef, useState } from "react";
import { useAlarm } from "../context/AlarmContext";
import type { POICategory } from "../context/POIContext";

const AlarmEngine: React.FC = () => {
  const { tipoAlarma } = useAlarm();

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timeoutRef = useRef<number | null>(null);

  const [bannerVisible, setBannerVisible] = useState(false);
  const [bannerCategory, setBannerCategory] = useState<POICategory | null>(null);

  useEffect(() => {
    const handler = (event: Event) => {
      const ce = event as CustomEvent<{ category: POICategory }>;
      const category = ce.detail?.category;

      if (!category) return; // seguridad

      /* === 1. Duraciones por categoría === */
      const defaultDurations: Record<POICategory, number> = {
        ten_precaucion: 1500,
        reduce_velocidad: 3500,
        cuidado: 6000,
      };

      let durations = { ...defaultDurations };

      try {
        const stored = JSON.parse(localStorage.getItem("alarmDurations") || "null");
        if (stored) durations = { ...durations, ...stored };
      } catch {}

      const durationMs = durations[category] ?? 2000;

      /* === 2. Banner visual === */
      setBannerCategory(category);
      setBannerVisible(true);

      setTimeout(() => setBannerVisible(false), durationMs);

      /* === 3. Sonido === */
      if (tipoAlarma === "sonido" || tipoAlarma === "ambos") {
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
        }

        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }

        const audio = new Audio("/alarm.mp3");
        audioRef.current = audio;

        audio.play().catch(() => {});

        timeoutRef.current = window.setTimeout(() => {
          audio.pause();
          audio.currentTime = 0;
        }, durationMs);
      }

      /* === 4. Vibración === */
      if (tipoAlarma === "vibracion" || tipoAlarma === "ambos") {
        if (navigator.vibrate) navigator.vibrate(durationMs);
      }
    };

    window.addEventListener("play-alarm", handler);

    return () => {
      window.removeEventListener("play-alarm", handler);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [tipoAlarma]);

  /* === Banner === */
  return bannerVisible ? (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-red-500 text-white px-4 py-2 rounded-xl shadow-md z-[9999]">
      ⚠️ Alerta: {bannerCategory?.replace("_", " ")}
    </div>
  ) : null;
};

export default AlarmEngine;
