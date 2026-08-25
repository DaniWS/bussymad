import maplibregl from 'maplibre-gl';
import type { Copy } from './translations';
import { occupancyColorExpression, MAP_STYLES, MAP_THEME } from './colors';
import type { MapState, RatingTier, StationDataset, ViewMode } from './types';
import type { Locale } from './i18n';

type LocaleStrings = Pick<
  Copy,
  | 'occupancy'
  | 'avgOccupancy'
  | 'ratingVeryGood'
  | 'ratingGood'
  | 'ratingFair'
  | 'ratingBad'
  | 'ratingVeryBad'
  | 'bikes'
  | 'docks'
  | 'noData'
  | 'attribution'
  | 'locateMe'
  | 'locateDenied'
  | 'locateOutside'
  | 'locateInsecure'
>;

let map: maplibregl.Map | null = null;
let dataset: StationDataset | null = null;
let state: MapState = { hour: 8, dayType: 'weekday', season: 'summer', viewMode: 'hourly' };
let mapLocale: Locale = 'es';
let localeStrings: LocaleStrings = {
  occupancy: 'Occupancy',
  avgOccupancy: 'Avg occupancy',
  ratingVeryGood: 'Very good',
  ratingGood: 'Good',
  ratingFair: 'Fair',
  ratingBad: 'Bad',
  ratingVeryBad: 'Very bad',
  bikes: 'bikes',
  docks: 'docks',
  noData: 'No data',
  attribution: '© OpenStreetMap · BiciMAD data',
  locateMe: 'Go to my location',
  locateDenied: 'Could not get your location. Check GPS permission.',
  locateOutside: 'Your location is outside the Madrid map area.',
  locateInsecure: 'GPS only works over HTTPS (or localhost). Open the site via https://.',
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

function ratingLabel(tier: RatingTier): string {
  switch (tier) {
    case 'veryGood':
      return localeStrings.ratingVeryGood;
    case 'good':
      return localeStrings.ratingGood;
    case 'fair':
      return localeStrings.ratingFair;
    case 'bad':
      return localeStrings.ratingBad;
    case 'veryBad':
      return localeStrings.ratingVeryBad;
  }
}

function parseRating(raw: unknown): RatingTier | '' {
  if (
    raw === 'veryGood' ||
    raw === 'good' ||
    raw === 'fair' ||
    raw === 'bad' ||
    raw === 'veryBad'
  ) {
    return raw;
  }
  return '';
}

function buildGeoJSON(
  data: StationDataset,
  hour: number,
  dayType: 'weekday' | 'weekend',
  viewMode: ViewMode,
) {
  const profile = data.profiles[dayType];
  const means = data.meanOccupancy?.[dayType];
  const ratings = data.rating?.[dayType];

  return {
    type: 'FeatureCollection' as const,
    features: data.stations.map((st, i) => {
      const row = profile[i];
      const occ = viewMode === 'dayPulse' ? (means?.[i] ?? null) : (row?.[hour] ?? null);
      const rating = viewMode === 'dayPulse' ? parseRating(ratings?.[i]) : '';
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
          rating,
        },
      };
    }),
  };
}

function updateSource() {
  if (!map || !dataset) return;
  const geojson = buildGeoJSON(dataset, state.hour, state.dayType, state.viewMode);
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
    const el = map?.getContainer().querySelector('.maplibregl-ctrl-attrib');
    el?.classList.remove('maplibregl-compact-show');
    el?.removeAttribute('open');
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

function formatPopup(
  name: string,
  occ: number | null,
  totalBases: number,
  rating: RatingTier | '',
): string {
  const pct =
    occ === null
      ? localeStrings.noData
      : new Intl.NumberFormat(localeTag(), { style: 'percent', maximumFractionDigits: 0 }).format(occ);

  if (state.viewMode === 'dayPulse') {
    const tierHtml =
      rating === ''
        ? ''
        : `<span class="map-popup__rating map-popup__rating--${rating}">${escapeHtml(ratingLabel(rating))}</span>`;
    return `
    <div class="map-popup">
      <strong>${escapeHtml(name)}</strong>
      ${tierHtml}
      <span>${localeStrings.avgOccupancy}: <em>${pct}</em></span>
    </div>
  `;
  }

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
    className: 'busymad-popup',
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

  const geolocate = new maplibregl.GeolocateControl({
    positionOptions: { enableHighAccuracy: true, timeout: 15000 },
    trackUserLocation: false,
    showUserLocation: true,
    showAccuracyCircle: true,
    fitBoundsOptions: { maxZoom: 16, padding: 48 },
  });
  map.addControl(geolocate, 'top-right');

  map.addControl(
    new maplibregl.AttributionControl({ compact: true, customAttribution: localeStrings.attribution }),
    'top-right',
  );

  const msg = {
    locateMe: localeStrings.locateMe || 'Go to my location',
    locateDenied: localeStrings.locateDenied || 'Could not get your location. Check GPS permission.',
    locateOutside: localeStrings.locateOutside || 'Your location is outside the Madrid map area.',
    locateInsecure:
      localeStrings.locateInsecure ||
      'GPS only works over HTTPS (or localhost). Open the site via https://.',
  };

  const labelGeolocate = () => {
    const btn = document.querySelector('.maplibregl-ctrl-geolocate') as HTMLButtonElement | null;
    if (!btn) return;
    btn.title = msg.locateMe;
    btn.setAttribute('aria-label', msg.locateMe);
  };

  const collapseAttribution = () => {
    const el = map?.getContainer().querySelector('.maplibregl-ctrl-attrib');
    if (!el) return;
    el.classList.remove('maplibregl-compact-show');
    el.removeAttribute('open');
  };

  geolocate.on('outofmaxbounds', () => {
    window.alert(msg.locateOutside);
  });

  geolocate.on('error', () => {
    window.alert(window.isSecureContext ? msg.locateDenied : msg.locateInsecure);
  });

  map.on('load', () => {
    resolveStyleAndLayers();
    labelGeolocate();
    collapseAttribution();
  });

  map.once('idle', () => {
    collapseAttribution();
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
    const { name, occupancy: occRaw, totalBases, rating: ratingRaw } = f.properties as {
      name: string;
      occupancy: unknown;
      totalBases: number;
      rating?: string;
    };
    popup
      .setLngLat(coords)
      .setHTML(formatPopup(name, parseOccupancy(occRaw), totalBases, parseRating(ratingRaw)))
      .addTo(map);
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
