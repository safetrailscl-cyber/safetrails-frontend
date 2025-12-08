// src/pages/MapPage.tsx
import React, { useEffect, useRef, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  Circle,
  useMap,
  useMapEvent,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import { useActivity } from "../context/ActivityContext";
import { useAuth } from "../context/AuthContext";
import {
  usePOI,
  type POIType,
  type POICategory,
} from "../context/POIContext";

import POIControls from "../components/POIControls";
import AlarmBanner from "../components/AlarmBanner";
import { POIIcons } from "../utils/POIIcons";

/* ---------- Helpers ---------- */

const RecenterMap: React.FC<{ position: [number, number] | null }> = ({
  position,
}) => {
  const map = useMap();
  useEffect(() => {
    if (position) map.setView(position, map.getZoom());
  }, [position, map]);
  return null;
};

const MapClickHandler: React.FC<{
  onClick: (e: L.LeafletMouseEvent) => void;
}> = ({ onClick }) => {
  useMapEvent("click", onClick);
  return null;
};

const MapSetter: React.FC<{
  mapRef: React.MutableRefObject<L.Map | null>;
}> = ({ mapRef }) => {
  const map = useMap();
  useEffect(() => {
    mapRef.current = map;
  }, [map, mapRef]);
  return null;
};

/* ---------- Página principal ---------- */

export default function MapPage() {
  const { user } = useAuth();
  const {
    isSharing,
    elapsedTimeFormatted,
    startActivity,
    stopActivity,
    coordinates,
  } = useActivity();

  const { pois, radiusConfig, createPOI, updatePOI, deletePOI } = usePOI();

  const [position, setPosition] = useState<[number, number] | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [tempMarkerPos, setTempMarkerPos] = useState<[number, number] | null>(
    null
  );
  const [editingPoi, setEditingPoi] = useState<POIType | null>(null);
  const mapRef = useRef<L.Map | null>(null);

  const [bannerVisible, setBannerVisible] = useState(false);
  const [bannerCategory, setBannerCategory] = useState<POICategory | null>(
    null
  );

  // POI activo para evitar spam
  const activePOIRef = useRef<string | null>(null);

  /* ---------- Eventos mapa ---------- */

  const onTempDrag = (e: L.LeafletEvent) => {
    const target = e.target as L.Marker;
    const latlng = target.getLatLng();
    setTempMarkerPos([latlng.lat, latlng.lng]);
  };

  const onMapClick = (e: L.LeafletMouseEvent) => {
    if (!isAdding) return;
    setTempMarkerPos([e.latlng.lat, e.latlng.lng]);
  };

  const handleStartAdd = () => {
    if (!mapRef.current) {
      setIsAdding(true);
      return;
    }
    const center = mapRef.current.getCenter();
    setTempMarkerPos([center.lat, center.lng]);
    setIsAdding(true);
    setEditingPoi(null);
  };

  const handleCancel = () => {
    setIsAdding(false);
    setTempMarkerPos(null);
    setEditingPoi(null);
  };

  const handleSaveNew = async (category: POICategory) => {
    if (!tempMarkerPos) return;

    const payload: POIType = {
      lat: tempMarkerPos[0],
      lng: tempMarkerPos[1],
      radius: radiusConfig[category],
      category,
      createdBy: user?.id ?? user?._id ?? undefined,
    };

    await createPOI(payload);

    setIsAdding(false);
    setTempMarkerPos(null);
  };

  const handleEdit = (poi: POIType) => {
    setBannerCategory(poi.category);
    setBannerVisible(true);
    setEditingPoi(poi);
    setTempMarkerPos([poi.lat, poi.lng]);
    setIsAdding(true);
  };

  const handleSaveEdit = async (category: POICategory) => {
    if (!editingPoi || !editingPoi._id || !tempMarkerPos) return;

    const payload: Partial<POIType> = {
      lat: tempMarkerPos[0],
      lng: tempMarkerPos[1],
      category,
      radius: radiusConfig[category],
    };

    await updatePOI(editingPoi._id, payload);
    setEditingPoi(null);
    setTempMarkerPos(null);
    setIsAdding(false);
    setBannerVisible(false);
  };

  /* ---------- GPS ---------- */

  useEffect(() => {
    if (!navigator.geolocation) return;

    const watcher = navigator.geolocation.watchPosition(
      (pos) => {
        setPosition([pos.coords.latitude, pos.coords.longitude]);
      },
      (err) => console.warn("Geolocation error:", err),
      { enableHighAccuracy: true }
    );

    return () => navigator.geolocation.clearWatch(watcher);
  }, []);

  /* ---------- SISTEMA DE ALARMAS ---------- */

  useEffect(() => {
    if (!position || pois.length === 0) return;

    let enteredAny = false;

    for (const poi of pois) {
      const radius =
        poi.radius && !isNaN(Number(poi.radius))
          ? Number(poi.radius)
          : Number(radiusConfig[poi.category] ?? 0);

      const dist = L.latLng(position).distanceTo(
        L.latLng(poi.lat, poi.lng)
      );

      if (dist <= radius) {
        enteredAny = true;

        if (activePOIRef.current !== (poi._id ?? "noid")) {
          activePOIRef.current = poi._id ?? "noid";

          window.dispatchEvent(
            new CustomEvent("play-alarm", {
              detail: { category: poi.category },
            })
          );

          setBannerCategory(poi.category);
          setBannerVisible(true);
        }

        break;
      }
    }

    if (!enteredAny) {
      activePOIRef.current = null;
      setBannerVisible(false);
    }
  }, [position, pois, radiusConfig]);

  /* ---------- Render ---------- */

  return (
    <div className="relative h-screen w-full">
      <AlarmBanner
        visible={bannerVisible}
        category={bannerCategory}
        onClose={() => setBannerVisible(false)}
      />

      {isAdding && (
        <POIControls
          mode={editingPoi ? "editing" : "adding"}
          initialCategory={editingPoi?.category}
          onCancel={handleCancel}
          onSave={editingPoi ? handleSaveEdit : handleSaveNew}
        />
      )}

      <MapContainer
        center={position ?? [-33.45, -70.66]}
        zoom={17}
        className="h-full w-full z-0"
      >
        <MapSetter mapRef={mapRef} />

        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        <RecenterMap position={position} />
        <MapClickHandler onClick={onMapClick} />

        {position && (
          <Circle
            center={position}
            radius={25}
            pathOptions={{
              color: "#2563eb",
              fillColor: "#3b82f6",
              fillOpacity: 0.15,
            }}
          />
        )}

        {!isSharing && coordinates.length > 0 && (
          <Polyline
            positions={coordinates.map(
              (c) => [c.lat, c.lng] as [number, number]
            )}
          />
        )}

        {isAdding && tempMarkerPos && (
          <Marker
            position={tempMarkerPos}
            draggable
            eventHandlers={{
              dragend: onTempDrag,
            }}
            icon={
              new L.Icon({
                iconUrl:
                  "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
                iconSize: [25, 41],
                iconAnchor: [12, 41],
              })
            }
          />
        )}

        {pois.map((p) => (
          <React.Fragment key={p._id ?? `${p.lat}-${p.lng}`}>
            <Marker
              position={[p.lat, p.lng]}
              icon={POIIcons[p.category]}
              eventHandlers={{ click: () => handleEdit(p) }}
            >
              <Popup>
                <div className="flex flex-col gap-2">
                  <div className="font-semibold">
                    {p.category === "ten_precaucion"
                      ? "Ten precaución"
                      : p.category === "reduce_velocidad"
                      ? "Reduce la velocidad"
                      : "Cuidado"}
                  </div>

                  <p className="text-sm">
                    <strong>Radio:</strong>{" "}
                    {radiusConfig[p.category]} m
                  </p>

                  <div className="flex gap-2 mt-2">
                    <button
                      className="px-2 py-1 rounded bg-yellow-500 text-white"
                      onClick={() => handleEdit(p)}
                    >
                      Editar
                    </button>
                    <button
                      className="px-2 py-1 rounded bg-red-600 text-white"
                      onClick={() => p._id && deletePOI(p._id)}
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              </Popup>
            </Marker>

            <Circle
              center={[p.lat, p.lng]}
              radius={radiusConfig[p.category]}
              pathOptions={{
                color:
                  p.category === "ten_precaucion"
                    ? "#00a859"
                    : p.category === "reduce_velocidad"
                    ? "#f2c94c"
                    : "#e53935",
                fillOpacity: 0.05,
              }}
            />
          </React.Fragment>
        ))}
      </MapContainer>

      <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 z-[999] flex gap-3">
        {isSharing ? (
          <button
            onClick={stopActivity}
            className="bg-red-500 text-white px-4 py-2 rounded shadow"
          >
            Detener ruta
          </button>
        ) : (
          <button
            onClick={startActivity}
            className="bg-green-500 text-white px-4 py-2 rounded shadow"
          >
            Iniciar ruta
          </button>
        )}

        <button
          onClick={handleStartAdd}
          className="bg-blue-600 text-white px-4 py-2 rounded shadow"
          title="Agregar punto"
        >
          Agregar POI
        </button>
      </div>

      {isSharing && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-white shadow-md rounded-lg px-4 py-2">
          <span className="font-semibold text-gray-800">
            Ruta activa
          </span>
          <span className="ml-3 text-gray-600">
            {elapsedTimeFormatted}
          </span>
        </div>
      )}
    </div>
  );
}
