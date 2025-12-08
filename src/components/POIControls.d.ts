import React from "react";
export type POICategory = "ten_precaucion" | "reduce_velocidad" | "cuidado";
interface POIControlsProps {
    mode: "idle" | "adding" | "editing";
    initialCategory?: POICategory;
    onCancel: () => void;
    onSave: (category: POICategory) => void;
}
declare const POIControls: React.FC<POIControlsProps>;
export default POIControls;
