import type { ExpressionSpecification } from 'maplibre-gl';

/** MapLibre circle-color expression from occupancy 0→1 (red → green). */
export function occupancyColorExpression(dark: boolean): ExpressionSpecification {
  const nullColor = dark ? '#636b74' : '#b0b8c0';

  const stops: ExpressionSpecification = dark
    ? [
        'interpolate',
        ['linear'],
        ['get', 'occupancy'],
        0,
        '#f07167',
        0.25,
        '#f4a261',
        0.5,
        '#e9c46a',
        0.75,
        '#52b788',
        1,
        '#2dd4a0',
      ]
    : [
        'interpolate',
        ['linear'],
        ['get', 'occupancy'],
        0,
        '#e63946',
        0.25,
        '#f4845f',
        0.45,
        '#f4a261',
        0.65,
        '#52b788',
        1,
        '#2a9d8f',
      ];

  return ['case', ['<', ['get', 'occupancy'], 0], nullColor, stops];
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
