import type { ExpressionSpecification } from 'maplibre-gl';

/**
 * Feature property driving the red→green scale.
 * Both modes write an empirical percentile 0→1 into `percentile`
 * (hourly: vs stations at that hour; rating: vs daytime mean bikes).
 */
export type ColorMetricProperty = 'percentile';

const LIGHT_COLORS = ['#e63946', '#f4845f', '#f4a261', '#52b788', '#2a9d8f'] as const;
const DARK_COLORS = ['#f07167', '#f4a261', '#e9c46a', '#52b788', '#2dd4a0'] as const;

const UNIT_STOPS = [0, 0.25, 0.5, 0.75, 1] as const;

/** MapLibre circle-color expression (red → green) from percentile 0→1. */
export function metricColorExpression(
  dark: boolean,
  property: ColorMetricProperty = 'percentile',
): ExpressionSpecification {
  const nullColor = dark ? '#636b74' : '#b0b8c0';
  const palette = dark ? DARK_COLORS : LIGHT_COLORS;

  const interpolate: ExpressionSpecification = ['interpolate', ['linear'], ['get', property]];
  for (let i = 0; i < palette.length; i++) {
    interpolate.push(UNIT_STOPS[i]!, palette[i]!);
  }

  return ['case', ['<', ['get', property], 0], nullColor, interpolate];
}

export const MAP_STYLES = {
  light: 'https://tiles.openfreemap.org/styles/liberty',
  dark: 'https://tiles.openfreemap.org/styles/fiord',
} as const;

export const MAP_THEME = {
  light: {
    stroke: 'rgba(255, 255, 255, 0.92)',
    strokeWidth: 1.75,
    glowOpacity: 0.28,
    circleOpacity: 0.94,
  },
  dark: {
    stroke: 'rgba(246, 243, 236, 0.88)',
    strokeWidth: 1.5,
    glowOpacity: 0.32,
    circleOpacity: 0.96,
  },
} as const;
