import { setMapState } from './map';

export function initControls() {
  const root = document.querySelector('[data-controls]');
  if (!root) return;

  let hoursLabels: string[] = [];
  try {
    hoursLabels = JSON.parse(root.getAttribute('data-hours-labels') ?? '[]');
  } catch {
    hoursLabels = Array.from({ length: 24 }, (_, h) => `${String(h).padStart(2, '0')}:00`);
  }

  const slider = document.getElementById('hour-slider');
  const display = document.getElementById('hour-display');
  const sunMark = root.querySelector('.time-control__mark--sun');
  const moonMark = root.querySelector('.time-control__mark--moon');
  const dayButtons = root.querySelectorAll('[data-day-type]');
  let nearSun = false;
  let nearMoon = false;

  function replayMark(mark: Element | null) {
    if (!(mark instanceof HTMLElement)) return;
    mark.classList.remove('is-animating');
    void mark.offsetWidth;
    mark.classList.add('is-animating');
  }

  function onMarkAnimationEnd(mark: Element | null, innerSelector: string) {
    if (!mark) return;
    mark.querySelector(innerSelector)?.addEventListener('animationend', () => {
      mark.classList.remove('is-animating');
    });
  }

  onMarkAnimationEnd(sunMark, '.sun-rays');
  onMarkAnimationEnd(moonMark, '.moon-body');

  function updateHour(hour: number) {
    if (!(slider instanceof HTMLInputElement)) return;
    slider.value = String(hour);
    slider.setAttribute('aria-valuenow', String(hour));
    if (display) display.textContent = hoursLabels[hour] ?? `${String(hour).padStart(2, '0')}:00`;
    setMapState({ hour });

    const sun = hour >= 11 && hour <= 13;
    const moon = hour >= 22;
    if (sun && !nearSun) replayMark(sunMark);
    if (moon && !nearMoon) replayMark(moonMark);
    nearSun = sun;
    nearMoon = moon;
  }

  slider?.addEventListener('input', () => {
    if (!(slider instanceof HTMLInputElement)) return;
    updateHour(Number(slider.value));
  });

  dayButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const dayType = btn.getAttribute('data-day-type');
      if (dayType !== 'weekday' && dayType !== 'weekend') return;
      dayButtons.forEach((b) => b.classList.toggle('is-active', b === btn));
      setMapState({ dayType });
    });
  });
}
