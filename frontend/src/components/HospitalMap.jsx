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

// 🌍 Distance
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

// Icons
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

  // 🔹 Fetch hospitals
  useEffect(() => {
    if (!location || role === "doctor") return;

    fetch(
      `http://localhost:5000/api/hospitals/nearby?lat=${location.lat}&lng=${location.lng}`
    )
      .then((res) => res.json())
      .then((data) => {
        console.log("API Response:", data);

        // ✅ FIX: Ensure array
        let hospitalArray = [];

        if (Array.isArray(data)) {
          hospitalArray = data;
        } else if (data.hospitals && Array.isArray(data.hospitals)) {
          hospitalArray = data.hospitals;
        } else {
          console.error("Invalid API format:", data);
          setError("Invalid hospital data");
          return;
        }

        setHospitals(hospitalArray);
        findNearest(hospitalArray);
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to fetch hospitals");
      });
  }, [location, role]);

  // 🔹 Find nearest
  const findNearest = (data) => {
    if (!Array.isArray(data)) return;

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

  // 🔹 Routing
  const getRoute = async (destLat, destLng) => {
    try {
      const res = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${location.lng},${location.lat};${destLng},${destLat}?overview=full&geometries=polyline`
      );

      const data = await res.json();

      if (!data.routes || data.routes.length === 0) return;

      const decoded = polyline.decode(data.routes[0].geometry);
      setRoute(decoded);

      setDistance((data.routes[0].distance / 1000).toFixed(2));
      setDuration((data.routes[0].duration / 60).toFixed(0));
    } catch (err) {
      console.error("Route error:", err);
    }
  };

  // 🔔 Emergency trigger
  useEffect(() => {
    if (!severity || !nearest) return;

    if (
      severity.toLowerCase().includes("severe") ||
      severity.toLowerCase().includes("proliferative")
    ) {
      alert("⚠️ Emergency detected. Routing to nearest hospital.");
      getRoute(nearest.lat, nearest.lon);
    }
  }, [severity, nearest]);

  // ❌ Prevent crash
  if (!Array.isArray(hospitals)) {
    return <div>Loading hospitals...</div>;
  }

  if (role === "doctor") return null;

  return (
    <div className="bg-slate-900 p-4 rounded-2xl space-y-4">
      <h2 className="text-xl text-cyan-400 font-bold">
        Nearby Eye Hospitals
      </h2>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <MapContainer
        center={[location?.lat || 28.6, location?.lng || 77.2]}
        zoom={13}
        style={{ height: "60vh", width: "100%" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {location && (
          <Marker position={[location.lat, location.lng]} icon={defaultIcon}>
            <Popup>Your Location</Popup>
          </Marker>
        )}

        {/* ✅ SAFE MAP */}
        {Array.isArray(hospitals) &&
          hospitals.map((h, index) => (
            <Marker
              key={index}
              position={[h.lat, h.lon]}
              icon={
                nearest && h.id === nearest.id
                  ? nearestIcon
                  : defaultIcon
              }
              eventHandlers={{
                click: () => getRoute(h.lat, h.lon),
              }}
            >
              <Popup>
                <strong>{h.tags?.name || "Hospital"}</strong>
                <br />
                {nearest && h.id === nearest.id && "⭐ Nearest"}
              </Popup>
            </Marker>
          ))}

        {route.length > 0 && (
          <Polyline positions={route} color="red" />
        )}
      </MapContainer>

      {nearest && (
        <div>
          <p>⭐ Nearest: {nearest.tags?.name}</p>
          <p>Distance: {nearest.distance} km</p>
        </div>
      )}

      {distance && (
        <div>
          <p>Distance: {distance} km</p>
          <p>Time: {duration} mins</p>
        </div>
      )}

      {nearest && (
        <button onClick={() => getRoute(nearest.lat, nearest.lon)}>
          🚑 Emergency Route
        </button>
      )}
    </div>
  );
}