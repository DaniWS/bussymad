export type StationMeta = {
  id: number;
  name: string;
  lat: number;
  lon: number;
  totalBases: number;
};

export type StationDataset = {
  meta: {
    season: string;
    year: number;
    months: string[];
    metric: string;
    dayTypes: string[];
    hours: number[];
    n_snapshots: number;
    n_stations: number;
  };
  stations: StationMeta[];
  profiles: {
    weekday: (number | null)[][];
    weekend: (number | null)[][];
  };
};

export type ViewMode = 'hourly' | 'dayPulse';

export type MapState = {
  hour: number;
  dayType: 'weekday' | 'weekend';
  season: 'summer';
  viewMode: ViewMode;
};
