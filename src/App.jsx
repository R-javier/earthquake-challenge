import { useState } from "react";
import Map from "./components/Map";
import Sidebar from "./components/Sidebar";
import { getEarthquakes } from "./services/earthquakeService";
import "./App.css";

export default function App() {
  const [earthquakes, setEarthquakes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (filters) => {
    setLoading(true);
    setError(null);

    try {
      const features = await getEarthquakes(filters);
      setEarthquakes(features);
      setHasSearched(true);
    } catch (err) {
      setError(err.message);
      setEarthquakes([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-layout">
      <Sidebar
        onSearch={handleSearch}
        loading={loading}
        resultCount={hasSearched ? earthquakes.length : undefined}
      />
      <main className="map-container">
        <Map earthquakes={earthquakes} loading={loading} error={error} />
      </main>
    </div>
  );
}
