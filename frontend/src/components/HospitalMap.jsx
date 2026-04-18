import React, { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
} from "react-leaflet";
import L from "leaflet";
import polyline from "@mapbox/polyline";
import "leaflet/dist/leaflet.css";

/* 🌍 DISTANCE */
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;

  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

/* 📍 ICONS */
const defaultIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const nearestIcon = new L.Icon({
  iconUrl: "https://maps.google.com/mapfiles/ms/icons/green-dot.png",
  iconSize: [32, 32],
});

export default function HospitalMap({ location, role, severity }) {
  const [hospitals, setHospitals] = useState([]);
  const [nearest, setNearest] = useState(null);
  const [route, setRoute] = useState([]);
  const [distance, setDistance] = useState(null);
  const [duration, setDuration] = useState(null);
  const [error, setError] = useState("");

  /* ================= FETCH ================= */
  useEffect(() => {
    if (!location || role === "doctor") return;

    fetch(
      `http://localhost:5001/api/hospitals/nearby?lat=${location.lat}&lng=${location.lng}`
    )
      .then((res) => res.json())
      .then((data) => {
        let hospitalArray = [];

        if (Array.isArray(data)) hospitalArray = data;
        else if (data.hospitals) hospitalArray = data.hospitals;
        else {
          setError("Invalid hospital data");
          return;
        }

        setHospitals(hospitalArray);
        findNearest(hospitalArray);
      })
      .catch(() => setError("Failed to fetch hospitals"));
  }, [location, role]);

  /* ================= NEAREST ================= */
  const findNearest = (data) => {
    let min = Infinity;
    let closest = null;

    data.forEach((h) => {
      if (!h.lat || !h.lon) return;

      const dist = calculateDistance(
        location.lat,
        location.lng,
        h.lat,
        h.lon
      );

      if (dist < min) {
        min = dist;
        closest = { ...h, distance: dist.toFixed(2) };
      }
    });

    setNearest(closest);
  };

  /* ================= ROUTE ================= */
  const getRoute = async (destLat, destLng) => {
    try {
      const res = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${location.lng},${location.lat};${destLng},${destLat}?overview=full&geometries=polyline`
      );

      const data = await res.json();

      if (!data.routes?.length) return;

      const decoded = polyline.decode(data.routes[0].geometry);
      setRoute(decoded);

      setDistance((data.routes[0].distance / 1000).toFixed(2));
      setDuration((data.routes[0].duration / 60).toFixed(0));
    } catch (err) {
      console.error(err);
    }
  };

  /* 🚑 EMERGENCY */
  useEffect(() => {
    if (!severity || !nearest) return;

    const sev = severity.toLowerCase();

    if (sev.includes("severe") || sev.includes("proliferative")) {
      getRoute(nearest.lat, nearest.lon);
    }
  }, [severity, nearest]);

  if (!location || role === "doctor") return null;

  return (
    <div className="bg-slate-900/70 backdrop-blur-xl border border-slate-800 rounded-3xl p-5 space-y-4 shadow-lg">

      <h2 className="text-xl font-bold text-cyan-400">
        Nearby Eye Hospitals
      </h2>

      {error && <p className="text-red-400 text-sm">{error}</p>}

      {/* MAP */}
      <div className="rounded-xl overflow-hidden">
        <MapContainer
          center={[location.lat, location.lng]}
          zoom={13}
          style={{ height: "50vh", width: "100%" }}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

          {/* USER */}
          <Marker position={[location.lat, location.lng]} icon={defaultIcon}>
            <Popup>Your Location</Popup>
          </Marker>

          {/* HOSPITALS */}
          {hospitals.map((h, i) => (
            <Marker
              key={i}
              position={[h.lat, h.lon]}
              icon={nearest?.id === h.id ? nearestIcon : defaultIcon}
              eventHandlers={{
                click: () => getRoute(h.lat, h.lon),
              }}
            >
              <Popup>
                <strong>{h.tags?.name || "Hospital"}</strong>
                <br />
                {nearest?.id === h.id && "⭐ Nearest"}
              </Popup>
            </Marker>
          ))}

          {/* ROUTE */}
          {route.length > 0 && (
            <Polyline positions={route} color="#ef4444" />
          )}
        </MapContainer>
      </div>

      {/* INFO PANEL */}
      {nearest && (
        <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 text-sm">
          <p className="text-cyan-400 font-semibold">
            ⭐ {nearest.tags?.name || "Nearest Hospital"}
          </p>
          <p className="text-slate-400">
            Distance: {nearest.distance} km
          </p>
        </div>
      )}

      {(distance || duration) && (
        <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 text-sm">
          <p>🚗 Distance: {distance} km</p>
          <p>⏱ Time: {duration} mins</p>
        </div>
      )}

      {/* 🚑 BUTTON */}
      {nearest && (
        <button
          onClick={() => getRoute(nearest.lat, nearest.lon)}
          className="w-full py-3 rounded-xl font-semibold 
                     bg-gradient-to-r from-red-500 to-pink-600 
                     hover:scale-105 transition-all shadow-lg"
        >
          🚑 Navigate to Nearest Hospital
        </button>
      )}
    </div>
  );
}