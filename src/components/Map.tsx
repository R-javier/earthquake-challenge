import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import type { Earthquake } from "../types";
import "maplibre-gl/dist/maplibre-gl.css";

function createCircle(mag: number): HTMLDivElement {
  const el = document.createElement("div");
  el.style.width = Math.max(8, mag * 5) + "px";
  el.style.height = Math.max(8, mag * 5) + "px";
  el.style.borderRadius = "50%";
  el.style.border = "2px solid white";
  el.style.cursor = "pointer";
  el.style.opacity = "0.85";
  el.style.background = mag >= 7 ? "#e53e3e" : mag >= 5 ? "#d69e2e" : "#38a169";
  return el;
}

function createPopup(
  place: string,
  mag: number,
  time: number,
): maplibregl.Popup {
  const date = new Date(time).toLocaleString("en-US");
  const magClass = mag >= 7 ? "mag-high" : mag >= 5 ? "mag-mid" : "mag-low";

  return new maplibregl.Popup().setHTML(`
    <div class="popup-place">${place || "Unknown Location"}</div>
    <div class="popup-row">
      <span>Magnitude:</span>
      <span class="popup-value ${magClass}">${mag?.toFixed(1) || "N/A"}</span>
    </div>
    <div class="popup-row">
      <span>Date:</span>
      <span class="popup-value">${date}</span>
    </div>
  `);
}

export default function Map({
  earthquakes,
  loading,
  error,
}: {
  earthquakes: Earthquake[];
  loading: boolean;
  error?: string;
}) {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const markers = useRef<maplibregl.Marker[]>([]);
  const maxMagnitude =
    earthquakes.length > 0
      ? Math.max(
          ...earthquakes.map((earthquake) => earthquake.properties.mag || 0),
        ).toFixed(1)
      : "-";

  useEffect(() => {
    if (!mapContainer.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: "https://tiles.openfreemap.org/styles/liberty",
      center: [0, 20],
      zoom: 2,
    });
    map.current.addControl(new maplibregl.NavigationControl());
    return () => map.current?.remove();
  }, []);

  useEffect(() => {
    if (!map.current) return;

    markers.current.forEach((m) => m.remove());
    markers.current = [];

    earthquakes.forEach((eq) => {
      const { mag, place, time } = eq.properties;
      const [lng, lat] = eq.geometry.coordinates;

      const marker = new maplibregl.Marker({ element: createCircle(mag) })
        .setLngLat([lng, lat])
        .setPopup(createPopup(place, mag, time))
        .addTo(map.current!);

      markers.current.push(marker);
    });
  }, [earthquakes]);

  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      <div ref={mapContainer} style={{ width: "100%", height: "100%" }} />

      <div className="map-stats">
        <div className="stat-row">
          <span>🌎 Earthquakes</span>
          <strong>{earthquakes.length}</strong>
        </div>

        <div className="stat-row">
          <span>📈 Max Mag</span>
          <strong>{maxMagnitude}</strong>
        </div>
      </div>

      {loading && (
        <div className="map-overlay">
          <div className="spinner" />
          <p className="overlay-title">Loading data...</p>
          <p className="overlay-sub">Fetching from USGS API</p>
        </div>
      )}

      {error && !loading && (
        <div className="map-overlay error">
          <p className="overlay-title">Failed to load</p>
          <p className="overlay-sub">{error}</p>
        </div>
      )}

      {!loading && !error && earthquakes.length === 0 && (
        <div className="map-overlay">
          <p className="overlay-title">No results</p>
          <p className="overlay-sub">
            Try a wider date range or lower magnitude.
          </p>
        </div>
      )}

      <div className="map-legend">
        <h4>Magnitude</h4>

        <div className="legend-item">
          <span className="legend-dot low"></span>
          <span>4 - 5</span>
        </div>

        <div className="legend-item">
          <span className="legend-dot mid"></span>
          <span>5 - 7</span>
        </div>

        <div className="legend-item">
          <span className="legend-dot high"></span>
          <span>7+</span>
        </div>
      </div>
    </div>
  );
}
