import { setMapState } from './map';
import type { ViewMode } from './types';

const STORAGE_KEY = 'busymad-controls';

type SavedControls = {
  viewMode?: ViewMode;
  hour?: number;
  dayType?: 'weekday' | 'weekend';
};

function loadSaved(): SavedControls {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as SavedControls;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function saveControls(partial: SavedControls) {
  try {
    const next = { ...loadSaved(), ...partial };
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    /* private mode / quota — ignore */
  }
}

export function initControls() {
  const root = document.querySelector('[data-controls]');
  if (!root) return;

  let hoursLabels: string[] = [];
  try {
    hoursLabels = JSON.parse(root.getAttribute('data-hours-labels') ?? '[]');
  } catch {
    hoursLabels = Array.from({ length: 24 }, (_, h) => `${String(h).padStart(2, '0')}:00`);
  }

  const dayPulseValue = root.getAttribute('data-day-pulse-value') ?? '24 h';
  const slider = document.getElementById('hour-slider');
  const display = document.getElementById('hour-display');
  const sunMark = root.querySelector('.time-control__mark--sun');
  const moonMark = root.querySelector('.time-control__mark--moon');
  const dayButtons = root.querySelectorAll('[data-day-type]');
  const viewButtons = root.querySelectorAll('button[data-view-mode]');
  const modeHint = root.querySelector('[data-mode-hint]');

  const saved = loadSaved();
  let viewMode: ViewMode = saved.viewMode === 'dayPulse' ? 'dayPulse' : 'hourly';
  let lastHour =
    typeof saved.hour === 'number' && saved.hour >= 0 && saved.hour <= 23 ? saved.hour : 8;
  let dayType: 'weekday' | 'weekend' = saved.dayType === 'weekend' ? 'weekend' : 'weekday';

  function nearness(hour: number, center: number, radius: number) {
    return Math.max(0, 1 - Math.abs(hour - center) / radius);
  }

  function setNear(mark: Element | null, value: number) {
    if (!(mark instanceof HTMLElement)) return;
    mark.style.setProperty('--near', value.toFixed(3));
  }

  function updateHourDisplay(hour: number) {
    if (display) {
      display.textContent =
        viewMode === 'dayPulse' ? dayPulseValue : (hoursLabels[hour] ?? `${String(hour).padStart(2, '0')}:00`);
    }
  }

  function applyViewMode(next: ViewMode, persist = true) {
    viewMode = next;
    root.setAttribute('data-view-mode', next);

    viewButtons.forEach((btn) => {
      const active = btn.getAttribute('data-view-mode') === next;
      btn.classList.toggle('is-active', active);
      btn.setAttribute('aria-pressed', active ? 'true' : 'false');
    });

    if (modeHint instanceof HTMLElement) {
      modeHint.hidden = next !== 'dayPulse';
    }

    if (slider instanceof HTMLInputElement) {
      const disabled = next === 'dayPulse';
      slider.disabled = disabled;
      slider.setAttribute('aria-disabled', disabled ? 'true' : 'false');
    }

    updateHourDisplay(lastHour);
    setMapState({ viewMode: next });
    if (persist) saveControls({ viewMode: next });
  }

  function updateHour(hour: number, persist = true) {
    if (!(slider instanceof HTMLInputElement)) return;
    lastHour = hour;
    slider.value = String(hour);
    slider.setAttribute('aria-valuenow', String(hour));
    updateHourDisplay(hour);
    setMapState({ hour });
    setNear(sunMark, nearness(hour, 12, 4));
    setNear(moonMark, nearness(hour, 23, 3));
    if (persist) saveControls({ hour });
  }

  function applyDayType(next: 'weekday' | 'weekend', persist = true) {
    dayType = next;
    dayButtons.forEach((btn) => {
      btn.classList.toggle('is-active', btn.getAttribute('data-day-type') === next);
    });
    setMapState({ dayType: next });
    if (persist) saveControls({ dayType: next });
  }

  slider?.addEventListener('input', () => {
    if (!(slider instanceof HTMLInputElement) || slider.disabled) return;
    updateHour(Number(slider.value));
  });

  viewButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const next = btn.getAttribute('data-view-mode');
      if (next !== 'hourly' && next !== 'dayPulse') return;
      applyViewMode(next);
    });
  });

  dayButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const next = btn.getAttribute('data-day-type');
      if (next !== 'weekday' && next !== 'weekend') return;
      applyDayType(next);
    });
  });

  updateHour(lastHour, false);
  applyDayType(dayType, false);
  applyViewMode(viewMode, false);
  saveControls({ viewMode, hour: lastHour, dayType });
}
