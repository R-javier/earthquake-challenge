import { useState } from "react";
import Map from "./components/Map";
import Sidebar from "./components/Sidebar";
import { getEarthquakes } from "./services/earthquakeService";
import type { Earthquake, Filters } from "./types";
import "./App.css";

export default function App() {
  const [earthquakes, setEarthquakes] = useState<Earthquake[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const [hasSearched, setHasSearched] = useState<boolean>(false);

  const handleSearch = async (filters: Filters): Promise<void> => {
    setLoading(true);
    setError(undefined);

    try {
      const features = await getEarthquakes(filters);
      setEarthquakes(features);
      setHasSearched(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
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
