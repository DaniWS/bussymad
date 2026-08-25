import maplibregl from 'maplibre-gl';
import type { Copy } from './translations';
import { occupancyColorExpression, MAP_STYLES, MAP_THEME } from './colors';
import type { MapState, StationDataset } from './types';
import type { Locale } from './i18n';

type LocaleStrings = Pick<Copy, 'occupancy' | 'bikes' | 'docks' | 'noData' | 'attribution'>;

let map: maplibregl.Map | null = null;
let dataset: StationDataset | null = null;
let state: MapState = { hour: 8, dayType: 'weekday', season: 'summer' };
let mapLocale: Locale = 'es';
let localeStrings: LocaleStrings = {
  occupancy: 'Occupancy',
  bikes: 'bikes',
  docks: 'docks',
  noData: 'No data',
  attribution: '© OpenStreetMap · BiciMAD data',
};
let popup: maplibregl.Popup | null = null;

const SOURCE_ID = 'stations';
const LAYER_CIRCLES = 'stations-circles';
const LAYER_GLOW = 'stations-glow';

/** Madrid municipality, padded just enough to keep every 2022 station on-screen. */
const MADRID_BOUNDS: maplibregl.LngLatBoundsLike = [
  [-3.86, 40.31],
  [-3.53, 40.54],
];

function isDark(): boolean {
  return document.documentElement.getAttribute('data-theme') === 'dark';
}

function mapTheme() {
  return isDark() ? MAP_THEME.dark : MAP_THEME.light;
}

function localeTag(): string {
  return mapLocale === 'es' ? 'es-ES' : 'en-GB';
}

function buildGeoJSON(data: StationDataset, hour: number, dayType: 'weekday' | 'weekend') {
  const profile = data.profiles[dayType];
  return {
    type: 'FeatureCollection' as const,
    features: data.stations.map((st, i) => {
      const occ = profile[i]?.[hour] ?? null;
      return {
        type: 'Feature' as const,
        geometry: {
          type: 'Point' as const,
          coordinates: [st.lon, st.lat],
        },
        properties: {
          id: st.id,
          name: st.name,
          totalBases: st.totalBases,
          occupancy: occ === null ? -1 : occ,
        },
      };
    }),
  };
}

function updateSource() {
  if (!map || !dataset) return;
  const geojson = buildGeoJSON(dataset, state.hour, state.dayType);
  const source = map.getSource(SOURCE_ID) as maplibregl.GeoJSONSource | undefined;
  source?.setData(geojson);
}

function resolveStyle() {
  return isDark() ? MAP_STYLES.dark : MAP_STYLES.light;
}

function applyPlaceNames() {
  if (!map || mapLocale !== 'en') return;
  for (const layer of map.getStyle().layers) {
    if (layer.type !== 'symbol') continue;
    let field: unknown;
    try {
      field = map.getLayoutProperty(layer.id, 'text-field');
    } catch {
      continue;
    }
    if (!field) continue;
    if (!JSON.stringify(field).includes('name')) continue;
    map.setLayoutProperty(layer.id, 'text-field', [
      'coalesce',
      ['get', 'name:en'],
      ['get', 'name:latin'],
      ['get', 'name'],
    ]);
  }
}

function resolveStyleAndLayers() {
  addStationLayers();
  applyPlaceNames();
  updateSource();
}

function swapBasemap() {
  if (!map) return;
  const style = resolveStyle();
  const center = map.getCenter();
  const zoom = map.getZoom();
  const bearing = map.getBearing();
  const pitch = map.getPitch();

  map.once('style.load', () => {
    resolveStyleAndLayers();
    map?.jumpTo({ center, zoom, bearing, pitch });
  });
  map.setStyle(style, { diff: false });
}

function addStationLayers() {
  if (!map) return;

  if (map.getLayer(LAYER_GLOW)) map.removeLayer(LAYER_GLOW);
  if (map.getLayer(LAYER_CIRCLES)) map.removeLayer(LAYER_CIRCLES);
  if (map.getSource(SOURCE_ID)) map.removeSource(SOURCE_ID);

  const theme = mapTheme();
  const colorExpr = occupancyColorExpression(isDark());

  map.addSource(SOURCE_ID, {
    type: 'geojson',
    data: { type: 'FeatureCollection', features: [] },
  });

  map.addLayer({
    id: LAYER_GLOW,
    type: 'circle',
    source: SOURCE_ID,
    paint: {
      'circle-radius': ['interpolate', ['linear'], ['zoom'], 10, 9, 14, 16, 16, 20],
      'circle-color': colorExpr,
      'circle-opacity': theme.glowOpacity,
      'circle-blur': 0.55,
    },
  });

  map.addLayer({
    id: LAYER_CIRCLES,
    type: 'circle',
    source: SOURCE_ID,
    paint: {
      'circle-radius': ['interpolate', ['linear'], ['zoom'], 10, 4.5, 14, 8, 16, 11],
      'circle-color': colorExpr,
      'circle-stroke-width': theme.strokeWidth,
      'circle-stroke-color': theme.stroke,
      'circle-opacity': theme.circleOpacity,
    },
  });
}

function parseOccupancy(raw: unknown): number | null {
  if (raw === null || raw === undefined || raw === -1 || raw === '-1') return null;
  const n = typeof raw === 'number' ? raw : Number(raw);
  return Number.isFinite(n) && n >= 0 ? n : null;
}

function formatPopup(name: string, occ: number | null, totalBases: number): string {
  const pct =
    occ === null
      ? localeStrings.noData
      : new Intl.NumberFormat(localeTag(), { style: 'percent', maximumFractionDigits: 0 }).format(occ);
  const bikes = occ === null ? '—' : String(Math.round(occ * totalBases));
  return `
    <div class="map-popup">
      <strong>${escapeHtml(name)}</strong>
      <span>${localeStrings.occupancy}: <em>${pct}</em></span>
      <span>~${bikes} ${localeStrings.bikes} · ${totalBases} ${localeStrings.docks}</span>
    </div>
  `;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export async function initMap(container: HTMLElement, locale: Locale, strings: LocaleStrings) {
  mapLocale = locale;
  localeStrings = strings;
  popup = new maplibregl.Popup({
    closeButton: false,
    closeOnClick: false,
    offset: 12,
    className: 'bussymad-popup',
  });

  const res = await fetch('/data/stations_summer2022.json');
  dataset = (await res.json()) as StationDataset;

  map = new maplibregl.Map({
    container,
    style: resolveStyle(),
    center: [-3.7038, 40.4168],
    zoom: 12.2,
    minZoom: 11,
    maxZoom: 17,
    maxBounds: MADRID_BOUNDS,
    renderWorldCopies: false,
    dragRotate: false,
    pitch: 0,
    attributionControl: false,
  });

  container.classList.toggle('map--dark', isDark());

  map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');
  map.addControl(
    new maplibregl.AttributionControl({ compact: true, customAttribution: localeStrings.attribution }),
    'top-right',
  );

  map.on('load', () => {
    resolveStyleAndLayers();
  });

  map.on('mousemove', LAYER_CIRCLES, (e) => {
    if (!map || !popup) return;
    map.getCanvas().style.cursor = 'pointer';
    const f = e.features?.[0];
    if (!f) return;
    const coords = (f.geometry as { type: 'Point'; coordinates: [number, number] }).coordinates.slice() as [
      number,
      number,
    ];
    const { name, occupancy: occRaw, totalBases } = f.properties as {
      name: string;
      occupancy: unknown;
      totalBases: number;
    };
    popup.setLngLat(coords).setHTML(formatPopup(name, parseOccupancy(occRaw), totalBases)).addTo(map);
  });

  map.on('mouseleave', LAYER_CIRCLES, () => {
    if (!map) return;
    map.getCanvas().style.cursor = '';
    popup?.remove();
  });

  const themeObserver = new MutationObserver(() => {
    container.classList.toggle('map--dark', isDark());
    swapBasemap();
  });
  themeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme'],
  });
}

export function setMapState(partial: Partial<MapState>) {
  state = { ...state, ...partial };
  updateSource();
}

export function getMapState(): MapState {
  return { ...state };
}

export function getStationCount(): number {
  return dataset?.meta.n_stations ?? 0;
}

export function resizeMap() {
  map?.resize();
}
