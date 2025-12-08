// src/components/AlarmBanner.tsx
//import React from "react";

type Props = {
  visible: boolean;
  category: string | null;
  onClose: () => void;
};

const colors: Record<string, string> = {
  ten_precaucion: "bg-yellow-500",
  reduce_velocidad: "bg-orange-500",
  cuidado: "bg-red-600",
};

const titles: Record<string, string> = {
  ten_precaucion: "⚠️ Ten Precaución",
  reduce_velocidad: "⚠️ Reduce Velocidad",
  cuidado: "🚨 CUIDADO",
};

export default function AlarmBanner({ visible, category, onClose }: Props) {
  if (!visible || !category) return null;

  return (
    <div
      className={`${colors[category]} text-white text-center py-3 px-4 fixed top-4 left-1/2 
      -translate-x-1/2 rounded-xl shadow-lg font-bold text-lg z-[9999] animate-pulse`}
      onClick={onClose}
    >
      {titles[category]}
    </div>
  );
}
