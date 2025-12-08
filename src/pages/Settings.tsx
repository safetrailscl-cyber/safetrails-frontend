// src/pages/Settings.tsx
import React, { useState } from "react";
import BottomNav from "../components/BottomNav";
import { usePOI, type RadiusConfig } from "../context/POIContext";

const Settings: React.FC = () => {
  const { radiusConfig, setRadiusConfig } = usePOI();

  // Consentimiento de ubicación guardado en localStorage
  const [locationConsent, setLocationConsent] = useState<boolean>(() => {
    const saved = localStorage.getItem("locationConsent");
    return saved === "true";
  });

  const handleRadiusChange = (key: keyof RadiusConfig, value: number) => {
    setRadiusConfig((prev) => ({ ...prev, [key]: value }));
  };

  const handleConsentChange = () => {
    const newValue = !locationConsent;
    setLocationConsent(newValue);
    localStorage.setItem("locationConsent", String(newValue));
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="p-4 bg-white dark:bg-gray-800 shadow-sm">
        <h1 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
          Configuración de SafeTrails
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Revisa la política de privacidad y ajusta tus alertas.
        </p>
      </div>

      <div className="flex-1 p-4 space-y-6">

        {/* --- TEXTO LEGAL ARRIBA --- */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4">
          <h2 className="font-medium text-gray-800 dark:text-gray-100 mb-2">
            Uso de Datos y Privacidad
          </h2>

          <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
            SafeTrails utiliza tu ubicación en tiempo real únicamente para entregar
            alertas de seguridad durante tu recorrido.
            <br /><br />
            De acuerdo con la <strong>Ley 19.628 sobre Protección de Datos Personales</strong> en Chile,
            te informamos que:
            <br />• Tu ubicación no se almacena en servidores externos.  
            <br />• No se comparte con terceros.  
            <br />• Solo se usa mientras la app está en funcionamiento.
          </p>

          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={locationConsent}
              onChange={handleConsentChange}
              className="w-4 h-4 accent-green-600"
            />
            <span className="text-gray-700 dark:text-gray-300">
              Acepto el uso de mi ubicación según la Ley 19.628
            </span>
          </label>
        </div>

        {/* --- DISTANCIAS ABAJO --- */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 space-y-5">
          <h2 className="font-medium text-gray-800 dark:text-gray-100 mb-2">
            Distancias de alerta por tipo de POI
          </h2>

          {(["ten_precaucion", "reduce_velocidad", "cuidado"] as const).map((key) => (
            <div key={key}>
              <p className="text-gray-700 dark:text-gray-300 capitalize">
                {key.replace("_", " ")}: {radiusConfig[key]} m
              </p>

              <input
                type="range"
                min={10}
                max={40}
                value={radiusConfig[key]}
                onChange={(e) => handleRadiusChange(key, Number(e.target.value))}
                className="w-full accent-green-600"
              />
            </div>
          ))}
        </div>

      </div>

      <BottomNav />
    </div>
  );
};

export default Settings;
