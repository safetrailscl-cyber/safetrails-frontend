import React from "react";

export type POICategory = "ten_precaucion" | "reduce_velocidad" | "cuidado";

interface POIControlsProps {
  mode: "idle" | "adding" | "editing";
  initialCategory?: POICategory;
  onCancel: () => void;
  onSave: (category: POICategory) => void;
}

const categoryLabels: Record<POICategory, string> = {
  ten_precaucion: "Ten precaución",
  reduce_velocidad: "Reduce la velocidad",
  cuidado: "Cuidado",
};

const POIControls: React.FC<POIControlsProps> = ({
  mode,
  initialCategory,
  onCancel,
  onSave,
}) => {
  const [category, setCategory] = React.useState<POICategory>(
    initialCategory ?? "ten_precaucion"
  );

  React.useEffect(() => {
    setCategory(initialCategory ?? "ten_precaucion");
  }, [initialCategory, mode]);

  return (
    <div className="fixed left-1/2 transform -translate-x-1/2 top-4 z-[9999]">
      <div className="bg-white shadow-lg rounded-lg px-4 py-3 w-[min(520px,96%)]">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="flex gap-2 items-center flex-wrap">
            {(["ten_precaucion", "reduce_velocidad", "cuidado"] as POICategory[]).map(
              (c) => (
                <button
                  key={c}
                  onClick={() => setCategory(c)}
                  className={`px-3 py-2 rounded-full font-medium border transition ${
                    category === c
                      ? "bg-black text-white"
                      : "bg-white text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <span
                    className="inline-block mr-2 w-3 h-3 rounded-full"
                    style={{
                      background:
                        c === "ten_precaucion"
                          ? "#00a859"
                          : c === "reduce_velocidad"
                          ? "#f2c94c"
                          : "#e53935",
                    }}
                  />
                  {categoryLabels[c]}
                </button>
              )
            )}
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => onCancel()}
              className="px-3 py-2 rounded-md bg-gray-200 hover:bg-gray-300"
            >
              Cancelar
            </button>
            <button
              onClick={() => onSave(category)}
              className="px-3 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
            >
              Guardar punto
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default POIControls;



