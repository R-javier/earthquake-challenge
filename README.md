# EagleView – Condor Team Candidate Challenge

A web app that displays earthquake data on an interactive map with a filterable sidebar, built with React and MapLibre GL JS.

## Tech stack

React + Vite, MapLibre GL JS, OpenFreeMap tiles, plain CSS (no UI framework).

## Run locally

```bash
git clone <repo-url>
cd earthquakes-app
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Project structure

```
src/
├── services/earthquakeService.js   ← API calls + caching
├── components/Map.jsx              ← map rendering, markers, popups
├── components/Sidebar.jsx          ← filter form + validation
├── App.jsx                         ← shared state
```

Data flow: Sidebar submits filters → App calls the service → service fetches from USGS → App stores results → Map renders them.

## Key decisions

- **Markers as HTML elements** (not a GeoJSON layer) — simpler to read and debug, sized/colored by magnitude.
- **30-day range limit + 500-result cap** — without this, broad date ranges return tens of thousands of points and the map slows down. A deliberate tradeoff: a fast, readable map over an exhaustive but sluggish one.
- **Validation**: required dates, end after start, max 30-day range, magnitude between 0–10. Errors show inline, no request fires until valid.
- **Loading / error / empty states** shown as overlays on the map.
- **Responsive**: sidebar collapses into a toggleable panel below 768px.

## Bonus: caching with `localStorage`

Implemented a simplified cache instead of IndexedDB. Each search builds a key from `starttime + endtime + minmagnitude`; if that key exists in `localStorage`, results are served instantly with no network call. Otherwise it fetches from USGS and stores the result.

**Why localStorage instead of IndexedDB**: for caching a handful of small JSON responses, localStorage gets the same practical result (instant repeat searches) with far less code. IndexedDB's indexing and transactions would be overkill here.

**Cache invalidation**: none — past earthquake data never changes, so cached entries stay valid indefinitely.

## Not implemented

Web Worker and Service Worker bonuses were skipped — with the result cap already in place, the main thread never gets blocked enough to justify the added complexity, and offline support didn't fit this app's use case.
