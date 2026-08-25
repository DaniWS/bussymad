import type { Locale } from './i18n';

export type Copy = {
  siteName: string;
  tagline: string;
  metaDescription: string;
  skipLink: string;
  skipContent: string;
  openApp: string;
  landingLede: string;
  landingHint: string;
  installAsk: string;
  installAction: string;
  installLater: string;
  installIosHint: string;
  installFirefoxHint: string;
  installChromeWaitHint: string;
  installInsecureHint: string;
  installFullscreenHint: string;
  installRemoveOldHint: string;
  menuOpen: string;
  menuClose: string;
  locateMe: string;
  locateDenied: string;
  locateOutside: string;
  locateInsecure: string;
  dataBadge: string;
  dataNote: string;
  viewModeLabel: string;
  viewHourly: string;
  viewDayPulse: string;
  dayPulseHint: string;
  dayPulseValue: string;
  avgOccupancy: string;
  timeLabel: string;
  dayTypeLabel: string;
  weekday: string;
  weekend: string;
  seasonLabel: string;
  summer: string;
  allYear: string;
  allYearSoon: string;
  legendLow: string;
  legendHigh: string;
  stations: string;
  occupancy: string;
  bikes: string;
  docks: string;
  noData: string;
  langGroup: string;
  themeToDark: string;
  themeToLight: string;
  attribution: string;
  githubLabel: string;
  linkedinLabel: string;
  aboutLabel: string;
  emailLabel: string;
  licenseNav: string;
  copyrightLine: string;
  licenseShort: string;
  licensePageTitle: string;
  licenseBack: string;
  licenseIntro: string;
  licenseAllows: string;
  licenseForbids: string;
  licenseAllowView: string;
  licenseAllowShare: string;
  licenseForbidCommercial: string;
  licenseForbidDerivatives: string;
  licenseForbidPlagiarism: string;
  licenseData: string;
  licenseFull: string;
};

export const AUTHOR = 'Daniel Vilela García';
export const COPYRIGHT_YEAR = 2026;
export const LICENSE_SPDX = 'CC-BY-NC-ND-4.0';
export const LICENSE_URL = 'https://creativecommons.org/licenses/by-nc-nd/4.0/';
export const LINKEDIN_URL = 'https://www.linkedin.com/in/daniel-vilela-garcia';
/** Personal site — update when the domain is final. */
export const PERSONAL_SITE_URL = 'https://dani.dev';

export const copy: Record<Locale, Copy> = {
  es: {
    siteName: 'BusyMAD',
    tagline: 'Disponibilidad BiciMAD por hora',
    metaDescription:
      'Mapa interactivo de ocupación de estaciones BiciMAD en Madrid — verano 2022, día laborable o fin de semana.',
    skipLink: 'Ir al mapa',
    skipContent: 'Ir al contenido',
    openApp: 'Abrir la app',
    landingLede:
      'Mapa interactivo de ocupación de estaciones BiciMAD a lo largo del día — verano 2022, laborable o fin de semana.',
    landingHint:
      'En Chrome (Android) instálala por HTTPS para abrirla a pantalla completa, como una app, sin barra del navegador.',
    installAsk: '¿Instalar BusyMAD como app?',
    installAction: 'Instalar',
    installLater: 'Ahora no',
    installIosHint: 'En Safari: Compartir → «Añadir a pantalla de inicio». Luego ábrela desde el icono.',
    installFirefoxHint:
      'Firefox no puede instalar BusyMAD como app a pantalla completa. Ábrela en Chrome (Android) por HTTPS e instálala ahí.',
    installChromeWaitHint:
      'Usa el botón Instalar cuando Chrome lo ofrezca. Borra antes cualquier icono viejo con el logo de Chrome.',
    installInsecureHint:
      'Para una app real (icono limpio, pantalla completa) abre https://busymad.dev en Chrome. Por HTTP solo se crea un acceso con badge de Chrome.',
    installFullscreenHint: 'Ábrela desde el icono instalado (sin badge de Chrome) para usarla sin la barra del navegador.',
    installRemoveOldHint: 'Si ya tenías un acceso con el icono de Chrome debajo, elimínalo e instala de nuevo desde Chrome.',
    menuOpen: 'Abrir menú',
    menuClose: 'Cerrar menú',
    locateMe: 'Ir a mi ubicación',
    locateDenied: 'No se pudo obtener la ubicación. Revisa el permiso de GPS.',
    locateOutside: 'Tu ubicación está fuera del área del mapa de Madrid.',
    locateInsecure: 'La ubicación GPS solo funciona en HTTPS (o localhost). Abre el sitio por https://.',
    dataBadge: 'Verano 2022',
    dataNote: 'Red histórica (~259 estaciones). Los datos en vivo llegarán pronto.',
    viewModeLabel: 'Vista',
    viewHourly: 'Por hora',
    viewDayPulse: 'Rating',
    dayPulseHint:
      'Promedio de ocupación a lo largo del día. Verde: estaciones que suelen tener más bicis; rojo: las que suelen ir más vacías.',
    dayPulseValue: '24 h',
    avgOccupancy: 'Ocupación media',
    timeLabel: 'Hora del día',
    dayTypeLabel: 'Tipo de día',
    weekday: 'Laborable',
    weekend: 'Fin de semana',
    seasonLabel: 'Temporada',
    summer: 'Verano',
    allYear: 'Todo el año',
    allYearSoon: 'Próximamente',
    legendLow: 'Pocas bicis',
    legendHigh: 'Muchas bicis',
    stations: 'estaciones',
    occupancy: 'Ocupación',
    bikes: 'bicis',
    docks: 'bases',
    noData: 'Sin datos',
    langGroup: 'Idioma',
    themeToDark: 'Cambiar a modo oscuro',
    themeToLight: 'Cambiar a modo claro',
    attribution: '© OpenStreetMap · datos BiciMAD',
    githubLabel: 'Ver el código en GitHub',
    linkedinLabel: 'Perfil de LinkedIn',
    aboutLabel: 'Sobre mí — web personal',
    emailLabel: 'Enviar un correo a daniruso@duck.com',
    licenseNav: 'Licencia',
    copyrightLine: '© 2026 Daniel Vilela García',
    licenseShort: 'CC BY-NC-ND 4.0',
    licensePageTitle: 'Licencia y copyright',
    licenseBack: 'Volver al mapa',
    licenseIntro:
      'BusyMAD (código, interfaz, diseño, documentación y visualizaciones originales) es obra de Daniel Vilela García y está protegida por copyright. Se publica bajo Creative Commons Reconocimiento-NoComercial-SinObraDerivada 4.0 Internacional.',
    licenseAllows: 'Permitido',
    licenseForbids: 'No permitido',
    licenseAllowView: 'Ver y usar el original para fines no comerciales.',
    licenseAllowShare: 'Compartir el original intacto, con atribución clara al autor.',
    licenseForbidCommercial: 'Uso comercial, venta, publicidad de pago o cualquier fin de lucro.',
    licenseForbidDerivatives: 'Distribuir copias modificadas, forks públicos o productos derivados.',
    licenseForbidPlagiarism: 'Presentar el trabajo como propio o sin atribución.',
    licenseData:
      'Los datos de BiciMAD, EMT, el Ayuntamiento de Madrid, GBFS y OpenStreetMap siguen perteneciendo a sus editores. Esta licencia no cubre esos conjuntos de datos.',
    licenseFull: 'Texto completo de la licencia',
  },
  en: {
    siteName: 'BusyMAD',
    tagline: 'BiciMAD availability by hour',
    metaDescription:
      'Interactive map of BiciMAD station occupancy in Madrid — summer 2022, weekday or weekend.',
    skipLink: 'Skip to map',
    skipContent: 'Skip to content',
    openApp: 'Open the app',
    landingLede:
      'Interactive map of BiciMAD station occupancy through the day — summer 2022, weekday or weekend.',
    landingHint:
      'On Chrome (Android), install over HTTPS to open fullscreen like an app, without the browser bar.',
    installAsk: 'Install BusyMAD as an app?',
    installAction: 'Install',
    installLater: 'Not now',
    installIosHint: 'In Safari: Share → “Add to Home Screen”. Then open it from the icon.',
    installFirefoxHint:
      'Firefox cannot install BusyMAD as a fullscreen app. Open it in Chrome (Android) over HTTPS and install there.',
    installChromeWaitHint:
      'Use the Install button when Chrome offers it. Delete any old home-screen shortcut that shows a Chrome badge first.',
    installInsecureHint:
      'For a real app (clean icon, fullscreen) open https://busymad.dev in Chrome. Over HTTP you only get a Chrome-badged shortcut.',
    installFullscreenHint: 'Open it from the installed icon (no Chrome badge) to use it without the browser bar.',
    installRemoveOldHint: 'If you already have a shortcut with a Chrome badge, remove it and install again from Chrome.',
    menuOpen: 'Open menu',
    menuClose: 'Close menu',
    locateMe: 'Go to my location',
    locateDenied: 'Could not get your location. Check GPS permission.',
    locateOutside: 'Your location is outside the Madrid map area.',
    locateInsecure: 'GPS only works over HTTPS (or localhost). Open the site via https://.',
    dataBadge: 'Summer 2022',
    dataNote: 'Historical network (~259 stations). Live data coming soon.',
    viewModeLabel: 'View',
    viewHourly: 'By hour',
    viewDayPulse: 'Rating',
    dayPulseHint:
      'Average occupancy across the day. Green: stations that usually have more bikes; red: ones that usually run emptier.',
    dayPulseValue: 'All day',
    avgOccupancy: 'Avg occupancy',
    timeLabel: 'Time of day',
    dayTypeLabel: 'Day type',
    weekday: 'Weekday',
    weekend: 'Weekend',
    seasonLabel: 'Season',
    summer: 'Summer',
    allYear: 'All year',
    allYearSoon: 'Coming soon',
    legendLow: 'Few bikes',
    legendHigh: 'Many bikes',
    stations: 'stations',
    occupancy: 'Occupancy',
    bikes: 'bikes',
    docks: 'docks',
    noData: 'No data',
    langGroup: 'Language',
    themeToDark: 'Switch to dark mode',
    themeToLight: 'Switch to light mode',
    attribution: '© OpenStreetMap · BiciMAD data',
    githubLabel: 'View source on GitHub',
    linkedinLabel: 'LinkedIn profile',
    aboutLabel: 'About me — personal site',
    emailLabel: 'Email daniruso@duck.com',
    licenseNav: 'License',
    copyrightLine: '© 2026 Daniel Vilela García',
    licenseShort: 'CC BY-NC-ND 4.0',
    licensePageTitle: 'License and copyright',
    licenseBack: 'Back to map',
    licenseIntro:
      'BusyMAD (source code, interface, design, documentation, and original visualizations) is the copyrighted work of Daniel Vilela García. It is licensed under Creative Commons Attribution-NonCommercial-NoDerivatives 4.0 International.',
    licenseAllows: 'Allowed',
    licenseForbids: 'Not allowed',
    licenseAllowView: 'View and use the original for non-commercial purposes.',
    licenseAllowShare: 'Share the original unchanged, with clear credit to the author.',
    licenseForbidCommercial: 'Commercial use, sale, paid advertising, or any for-profit purpose.',
    licenseForbidDerivatives: 'Distributing modified copies, public forks, or derivative products.',
    licenseForbidPlagiarism: 'Passing the work off as your own or sharing it without attribution.',
    licenseData:
      'BiciMAD, EMT, City of Madrid, GBFS, and OpenStreetMap data remain the property of their publishers. This licence does not cover those datasets.',
    licenseFull: 'Full licence text',
  },
};

export function t(locale: Locale): Copy {
  return copy[locale];
}

export function formatHour(hour: number, locale: Locale): string {
  const h = hour.toString().padStart(2, '0');
  return locale === 'es' ? `${h}:00` : `${h}:00`;
}

export function formatPercent(value: number, locale: Locale): string {
  return new Intl.NumberFormat(locale === 'es' ? 'es-ES' : 'en-GB', {
    style: 'percent',
    maximumFractionDigits: 0,
  }).format(value);
}
