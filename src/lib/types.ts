export type StationMeta = {
  id: number;
  name: string;
  lat: number;
  lon: number;
  totalBases: number;
};

/** Precomputed at deploy by scripts/aggregate_stations_summer2022.py */
export type RatingTier = 'veryBad' | 'bad' | 'fair' | 'good' | 'veryGood';

export type StationDataset = {
  meta: {
    season: string;
    year: number;
    months: string[];
    metric: string;
    dayTypes: string[];
    hours: number[];
    /** Hours included in Rating mean (overnight excluded). */
    ratingHours?: number[];
    n_snapshots: number;
    n_stations: number;
    ratingTiers?: RatingTier[];
    ratingPercentileEdges?: number[];
    ratingCutoffs?: {
      weekday: Record<string, number>;
      weekend: Record<string, number>;
    };
  };
  stations: StationMeta[];
  profiles: {
    weekday: (number | null)[][];
    weekend: (number | null)[][];
  };
  /** Mean occupancy over ratingHours (06–23) per station, parallel to `stations`. */
  meanOccupancy: {
    weekday: (number | null)[];
    weekend: (number | null)[];
  };
  /** Empirical percentile of mean occupancy among stations. */
  percentile: {
    weekday: (number | null)[];
    weekend: (number | null)[];
  };
  /** Quintile label from percentile (precomputed). */
  rating: {
    weekday: (RatingTier | null)[];
    weekend: (RatingTier | null)[];
  };
};

export type ViewMode = 'hourly' | 'dayPulse';

export type MapState = {
  hour: number;
  dayType: 'weekday' | 'weekend';
  season: 'summer';
  viewMode: ViewMode;
};
