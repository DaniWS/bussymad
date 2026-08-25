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
  installBrowserHint: string;
  dataBadge: string;
  dataNote: string;
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
    siteName: 'BussyMAD',
    tagline: 'Disponibilidad BiciMAD por hora',
    metaDescription:
      'Mapa interactivo de ocupación de estaciones BiciMAD en Madrid — verano 2022, día laborable o fin de semana.',
    skipLink: 'Ir al mapa',
    skipContent: 'Ir al contenido',
    openApp: 'Abrir la app',
    landingLede:
      'Mapa interactivo de ocupación de estaciones BiciMAD a lo largo del día — verano 2022, laborable o fin de semana.',
    landingHint: 'En el teléfono puedes instalarla como una app.',
    installAsk: '¿Quieres descargar BussyMAD?',
    installAction: 'Descargar',
    installLater: 'Ahora no',
    installIosHint: 'En Safari, pulsa Compartir y elige «Añadir a pantalla de inicio».',
    installBrowserHint: 'Abre el menú del navegador y elige «Instalar aplicación».',
    dataBadge: 'Verano 2022',
    dataNote: 'Red histórica (~259 estaciones). Los datos en vivo llegarán pronto.',
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
      'BussyMAD (código, interfaz, diseño, documentación y visualizaciones originales) es obra de Daniel Vilela García y está protegida por copyright. Se publica bajo Creative Commons Reconocimiento-NoComercial-SinObraDerivada 4.0 Internacional.',
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
    siteName: 'BussyMAD',
    tagline: 'BiciMAD availability by hour',
    metaDescription:
      'Interactive map of BiciMAD station occupancy in Madrid — summer 2022, weekday or weekend.',
    skipLink: 'Skip to map',
    skipContent: 'Skip to content',
    openApp: 'Open the app',
    landingLede:
      'Interactive map of BiciMAD station occupancy through the day — summer 2022, weekday or weekend.',
    landingHint: 'On a phone you can install it as an app.',
    installAsk: 'Want to download BussyMAD?',
    installAction: 'Download',
    installLater: 'Not now',
    installIosHint: 'In Safari, tap Share and choose “Add to Home Screen”.',
    installBrowserHint: 'Open the browser menu and choose “Install app”.',
    dataBadge: 'Summer 2022',
    dataNote: 'Historical network (~259 stations). Live data coming soon.',
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
      'BussyMAD (source code, interface, design, documentation, and original visualizations) is the copyrighted work of Daniel Vilela García. It is licensed under Creative Commons Attribution-NonCommercial-NoDerivatives 4.0 International.',
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
