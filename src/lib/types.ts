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
    /** Absolute bike-count cutoffs at P20/P40/P60/P80. */
    ratingCutoffs?: {
      weekday: Record<string, number>;
      weekend: Record<string, number>;
    };
    /** @deprecated Hourly color uses live percentile rank; kept for older JSON. */
    colorBikeStops?: number[];
    /** Provenance / blend metadata from the aggregator. */
    sources?: {
      historical?: string;
      mined?: string;
      minedDays?: string[];
      minedSnapshots?: number;
      histSnapshots?: number;
      blend?: {
        histWeight: number;
        minedWeight: number;
        matchRadiusM: number;
        matched: number;
        histOnly: number;
        gbfsOnly: number;
      };
    };
  };
  stations: StationMeta[];
  /** Mean available bikes per hour (not fill rate). */
  profiles: {
    weekday: (number | null)[][];
    weekend: (number | null)[][];
  };
  /** Mean bikes over ratingHours (06–23) per station, parallel to `stations`. */
  meanBikes: {
    weekday: (number | null)[];
    weekend: (number | null)[];
  };
  /** Empirical percentile of mean bikes among stations. */
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
