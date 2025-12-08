import L from "leaflet";

export const POIIcons: Record<string, L.Icon> = {
  ten_precaucion: new L.Icon({
    iconUrl: "/icons/ten_precaucion.png",
    iconSize: [64, 64],
    iconAnchor: [32, 64],
  }),
  reduce_velocidad: new L.Icon({
    iconUrl: "/icons/reduce_velocidad.png",
    iconSize: [64, 64],
    iconAnchor: [32, 64],
  }),
  cuidado: new L.Icon({
    iconUrl: "/icons/cuidado.png",
    iconSize: [64, 64],
    iconAnchor: [32, 64],
  }),
};
