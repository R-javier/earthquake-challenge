import type { Earthquake, Filters } from "../types";

export async function getEarthquakes(filters: Filters): Promise<Earthquake[]> {
  const cacheKey = `quakes_${filters.starttime}_${filters.endtime}_${filters.minmagnitude}`;

  const cached = localStorage.getItem(cacheKey);
  if (cached) {
    console.log("Served from cache:", cacheKey);
    return JSON.parse(cached);
  }

  const params = new URLSearchParams({
    format: "geojson",
    starttime: filters.starttime,
    endtime: filters.endtime,
    minmagnitude: filters.minmagnitude,
    limit: "100",
  });

  const res = await fetch(
    `https://earthquake.usgs.gov/fdsnws/event/1/query?${params}`,
  );

  if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);

  const data = await res.json();

  localStorage.setItem(cacheKey, JSON.stringify(data.features));

  return data.features;
}
