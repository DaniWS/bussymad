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

  function updateHour(hour: number) {
    if (!(slider instanceof HTMLInputElement)) return;
    slider.value = String(hour);
    slider.setAttribute('aria-valuenow', String(hour));
    if (display) display.textContent = hoursLabels[hour] ?? `${String(hour).padStart(2, '0')}:00`;
    setMapState({ hour });

    sunMark?.classList.toggle('is-near', hour >= 9 && hour <= 15);
    moonMark?.classList.toggle('is-near', hour >= 21);
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
