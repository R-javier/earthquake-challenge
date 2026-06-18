export interface Earthquake {
  properties: {
    mag: number;
    place: string;
    time: number;
  };
  geometry: {
    coordinates: [number, number];
  };
}

export interface Filters {
  starttime: string;
  endtime: string;
  minmagnitude: string;
}
