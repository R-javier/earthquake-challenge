import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";


function createCircle(mag) {
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

function createPopup(place, mag, time) {
  const date = new Date(time).toLocaleString("en-US");
  return new maplibregl.Popup().setHTML(`
    <b>${place || "Unknown location"}</b><br/>
    Magnitude: ${mag?.toFixed(1)}<br/>
    Date: ${date}
  `);
}


export default function Map({ earthquakes, loading, error }) {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const markers = useRef([]);


  useEffect(() => {
    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: "https://tiles.openfreemap.org/styles/liberty",
      center: [0, 20],
      zoom: 2,
    });
    map.current.addControl(new maplibregl.NavigationControl());
    return () => map.current.remove();
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
        .addTo(map.current);

      markers.current.push(marker);
    });
  }, [earthquakes]);

  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      <div ref={mapContainer} style={{ width: "100%", height: "100%" }} />

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
          <p className="overlay-sub">Try a wider date range or lower magnitude.</p>
        </div>
      )}
    </div>
  );
}