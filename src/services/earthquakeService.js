export async function getEarthquakes({starttime, endtime, minmagnitude}) {
    const params = new URLSearchParams({
        format: "geojson",
        starttime,
        endtime,
        minmagnitude,
        limit: 100,
    })

    const res = await fetch(
        `https://earthquake.usgs.gov/fdsnws/event/1/query?${params}`
    );

    if(!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);

    const data = await res.json();
    return data.features;
}