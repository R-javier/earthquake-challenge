import { useState, type FormEvent, type ChangeEvent } from "react";
import type { Filters } from "../types";

const DEFAULT_FILTERS = {
  starttime: "2024-01-01",
  endtime: "2024-01-31",
  minmagnitude: "4",
};

interface SidebarProps {
  onSearch: (filters: Filters) => void;
  loading: boolean;
  resultCount?: number;
}

export default function Sidebar({
  onSearch,
  loading,
  resultCount,
}: SidebarProps) {
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isFormOpen, setIsFormOpen] = useState<boolean>(true);

  const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = (): Record<string, string> => {
    const newErrors: Record<string, string> = {};
    if (!filters.starttime) newErrors.starttime = "Start time is required";
    if (!filters.endtime) newErrors.endtime = "End time is required";
    if (filters.starttime && filters.endtime) {
      if (filters.starttime > filters.endtime) {
        newErrors.endtime = "End time must be after start date";
      }

      const start = new Date(filters.starttime);
      const end = new Date(filters.endtime);
      const days = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
      if (days > 30) {
        newErrors.endtime = "Date range cannot exceed 30 days";
      }
    }

    const mag = parseFloat(filters.minmagnitude);
    if (isNaN(mag) || mag < 0 || mag > 10) {
      newErrors.minmagnitude =
        "Minimum magnitude must be a number between 0 and 10";
    }
    return newErrors;
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    onSearch(filters);
  };

  return (
    <aside className={`sidebar ${isOpen ? "open" : ""}`}>
      <div className="sidebar-header">
        <h1>🌎 EagleView Seismic</h1>
        <button
          className="sidebar-toggle"
          onClick={() => setIsOpen((prev) => !prev)}
          aria-label="Toggle filters"
        >
          {isOpen ? "✕" : "☰"}
        </button>
      </div>

      <div className="sidebar-body">
        <div className="form-header">
          <h2>Filters</h2>
          <button
            className="form-toggle"
            onClick={() => setIsFormOpen(!isFormOpen)}
            aria-label="Toggle filter form"
          >
            <span className={`toggle-arrow ${isFormOpen ? "open" : ""}`}>
              →
            </span>
          </button>
        </div>

        {isFormOpen && (
          <form className="filter-form" onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label htmlFor="starttime">Start Time</label>
              <input
                type="date"
                id="starttime"
                name="starttime"
                value={filters.starttime}
                onChange={handleChange}
              />
              {errors.starttime && (
                <span className="field-error">{errors.starttime}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="endtime">End Time</label>
              <input
                type="date"
                id="endtime"
                name="endtime"
                value={filters.endtime}
                onChange={handleChange}
              />
              {errors.endtime && (
                <span className="field-error">{errors.endtime}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="minmagnitude">Minimum Magnitude</label>
              <input
                type="number"
                id="minmagnitude"
                name="minmagnitude"
                min="0"
                max="10"
                step="0.1"
                value={filters.minmagnitude}
                onChange={handleChange}
              />
              {errors.minmagnitude && (
                <span className="field-error">{errors.minmagnitude}</span>
              )}
            </div>

            <button className="btn-search" type="submit" disabled={loading}>
              {loading ? "Searching..." : "Search for Earthquakes"}
            </button>
          </form>
        )}

        {resultCount !== undefined && (
          <div className="results-info">
            <span className="result-count">
              {resultCount === 0
                ? "No earthquakes found"
                : `${resultCount} earthquake${resultCount !== 1 ? "s" : ""} found${resultCount !== 1 ? "s" : ""}`}
            </span>
            {resultCount === 0 && (
              <p>Try a wider date range or a smaller magnitude</p>
            )}
          </div>
        )}
      </div>
    </aside>
  );
}
