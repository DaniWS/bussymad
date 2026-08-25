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
  demoLabel: string;
  demoHourlyCaption: string;
  demoRatingCaption: string;
  demoHourlyAlt: string;
  demoRatingAlt: string;
  landingSource: string;
  landingSourceLink: string;
  poweredByEmt: string;
  emtTermsLink: string;
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
  dataNote: string;
  viewModeLabel: string;
  viewHourly: string;
  viewDayPulse: string;
  dayPulseHint: string;
  dayPulseValue: string;
  avgOccupancy: string;
  ratingVeryGood: string;
  ratingGood: string;
  ratingFair: string;
  ratingBad: string;
  ratingVeryBad: string;
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
  licenseDisclaimerTitle: string;
  licenseDisclaimer: string;
  licensePrivacyTitle: string;
  licensePrivacy: string;
  licensePrivacyAfter: string;
};

export const AUTHOR = 'Daniel Vilela García';
export const COPYRIGHT_YEAR = 2026;
export const LICENSE_SPDX = 'CC-BY-NC-ND-4.0';
export const LICENSE_URL = 'https://creativecommons.org/licenses/by-nc-nd/4.0/';
export const LINKEDIN_URL = 'https://www.linkedin.com/in/daniel-vilela-garcia';
/** Personal site — update when the domain is final. */
export const PERSONAL_SITE_URL = 'https://dani.dev';
export const GITHUB_REPO_URL = 'https://github.com/DaniWS/busymad';
export const EMT_URL = 'https://www.emtmadrid.es';
export const EMT_TERMS_URL = 'https://mobilitylabs.emtmadrid.es/sip/terms-of-use';
export const EMT_GBFS_URL = 'https://madrid.publicbikesystem.net/customer/gbfs/v2/gbfs.json';
export const CONTACT_EMAIL = 'daniruso@duck.com';

export const copy: Record<Locale, Copy> = {
  es: {
    siteName: 'BusyMAD',
    tagline: 'Disponibilidad BiciMAD por hora',
    metaDescription:
      'Mapa interactivo de ocupación de estaciones BiciMAD en Madrid, día laborable o fin de semana.',
    skipLink: 'Ir al mapa',
    skipContent: 'Ir al contenido',
    openApp: 'Abrir la app',
    landingLede:
      'Mapa interactivo de ocupación de estaciones BiciMAD.\nNo te quedes "a pie".',
    landingHint: 'También puedes instalarla como app en el móvil.',
    demoLabel: 'Dos modos',
    demoHourlyCaption: 'Desliza la hora y ve la disponibilidad de cada estación.',
    demoRatingCaption: 'Chequea si tu estación cercana es buena o mala.',
    demoHourlyAlt: 'Demostración del modo por hora: mapa y control de la hora del día.',
    demoRatingAlt: 'Demostración del modo Rating: ficha de estación con clasificación y ocupación media.',
    landingSource:
      'Los datos históricos de 2026 se recopilan con capturas horarias del feed GBFS público de BiciMAD (EMT), no de dumps del portal.',
    landingSourceLink: 'Más detalles en el repositorio.',
    poweredByEmt: 'Powered by EMT de Madrid',
    emtTermsLink: 'Condiciones de uso EMT',
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
    dataNote: 'Red histórica (~259 estaciones). Los datos en vivo llegarán pronto.',
    viewModeLabel: 'Vista',
    viewHourly: 'Por hora',
    viewDayPulse: 'Rating',
    dayPulseHint:
      'Promedio de ocupación de 06:00 a 23:00 (sin madrugada). Al pasar el ratón ves el rating: quintiles precalculados del dataset (muy bueno → muy malo según la ocupación media frente al resto de estaciones).',
    dayPulseValue: '06–23 h',
    avgOccupancy: 'Ocupación media',
    ratingVeryGood: 'Muy bueno',
    ratingGood: 'Bueno',
    ratingFair: 'Regular',
    ratingBad: 'Malo',
    ratingVeryBad: 'Muy malo',
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
    attribution:
      "© OpenStreetMap · Powered by <a href='https://www.emtmadrid.es' target='_blank' rel='noopener noreferrer'>EMT de Madrid</a>",
    githubLabel: 'Ver el código en GitHub',
    linkedinLabel: 'Perfil de LinkedIn',
    aboutLabel: 'Sobre mí — web personal',
    emailLabel: 'Enviar un correo a daniruso@duck.com',
    licenseNav: 'Licencia',
    copyrightLine: '© 2026 Daniel Vilela García',
    licenseShort: 'CC BY-NC-ND 4.0',
    licensePageTitle: 'Licencia y avisos',
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
      'Los datos de BiciMAD / EMT (histórico abierto y feed GBFS en vivo), el Ayuntamiento de Madrid y OpenStreetMap siguen perteneciendo a sus editores. BusyMAD no reclama copyright sobre esos datos. Esta licencia del proyecto no los cubre. Atribución de datos: Powered by EMT de Madrid.',
    licenseFull: 'Texto completo de la licencia',
    licenseDisclaimerTitle: 'Aviso',
    licenseDisclaimer:
      'BusyMAD es un proyecto personal e independiente. No está afiliado, respaldado ni operado por EMT de Madrid, BiciMAD ni el Ayuntamiento de Madrid. Los mapas y ratings se basan en datos históricos o agregados y se ofrecen «tal cual», sin garantía de exactitud, actualidad ni idoneidad. No uses BusyMAD como única fuente para desplazarte; el uso es bajo tu responsabilidad.',
    licensePrivacyTitle: 'Privacidad',
    licensePrivacy:
      'BusyMAD no usa analytics ni cookies de seguimiento. Solo guarda en tu navegador (localStorage) preferencias locales como el tema y si ocultaste el aviso de instalación. La geolocalización solo se activa si pulsas «Ir a mi ubicación»; la posición la gestiona el navegador en tu dispositivo y no se envía a un servidor de BusyMAD. Si escribes a',
    licensePrivacyAfter: ', trataré tu mensaje solo para responderte.',
  },
  en: {
    siteName: 'BusyMAD',
    tagline: 'BiciMAD availability by hour',
    metaDescription:
      'Interactive map of BiciMAD station occupancy in Madrid, weekday or weekend.',
    skipLink: 'Skip to map',
    skipContent: 'Skip to content',
    openApp: 'Open the app',
    landingLede:
      'Interactive map of BiciMAD station occupancy.\nDon\'t get left "on foot".',
    landingHint: 'You can also install it as an app on your phone.',
    demoLabel: 'Two modes',
    demoHourlyCaption: 'Slide the hour and see the availability of each station.',
    demoRatingCaption: 'Check whether your nearby station is good or bad.',
    demoHourlyAlt: 'Demo of hourly mode: map and time-of-day control.',
    demoRatingAlt: 'Demo of Rating mode: station card with classification and average occupancy.',
    landingSource:
      'The 2026 historical data is compiled from hourly snapshots of the public BiciMAD GBFS feed (EMT), not from open-data portal dumps.',
    landingSourceLink: 'More details in the repository.',
    poweredByEmt: 'Powered by EMT de Madrid',
    emtTermsLink: 'EMT terms of use',
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
    dataNote: 'Historical network (~259 stations). Live data coming soon.',
    viewModeLabel: 'View',
    viewHourly: 'By hour',
    viewDayPulse: 'Rating',
    dayPulseHint:
      'Average occupancy from 6am to 11pm (overnight excluded). Hover a station to see its rating: deploy-time quintiles from the dataset (very good → very bad by mean occupancy vs the rest of the network).',
    dayPulseValue: '6am–11pm',
    avgOccupancy: 'Avg occupancy',
    ratingVeryGood: 'Very good',
    ratingGood: 'Good',
    ratingFair: 'Fair',
    ratingBad: 'Bad',
    ratingVeryBad: 'Very bad',
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
    attribution:
      "© OpenStreetMap · Powered by <a href='https://www.emtmadrid.es' target='_blank' rel='noopener noreferrer'>EMT de Madrid</a>",
    githubLabel: 'View source on GitHub',
    linkedinLabel: 'LinkedIn profile',
    aboutLabel: 'About me — personal site',
    emailLabel: 'Email daniruso@duck.com',
    licenseNav: 'License',
    copyrightLine: '© 2026 Daniel Vilela García',
    licenseShort: 'CC BY-NC-ND 4.0',
    licensePageTitle: 'Licence and notices',
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
      'BiciMAD / EMT data (open historical dumps and the live GBFS feed), City of Madrid data, and OpenStreetMap remain the property of their publishers. BusyMAD claims no copyright over that raw data. This project licence does not cover those datasets. Data attribution: Powered by EMT de Madrid.',
    licenseFull: 'Full licence text',
    licenseDisclaimerTitle: 'Notice',
    licenseDisclaimer:
      'BusyMAD is an independent personal project. It is not affiliated with, endorsed by, or operated by EMT de Madrid, BiciMAD, or the City of Madrid. Maps and ratings are based on historical or aggregated data and are provided “as is”, with no warranty of accuracy, currency, or fitness for purpose. Do not rely on BusyMAD as your only source when travelling; use is at your own risk.',
    licensePrivacyTitle: 'Privacy',
    licensePrivacy:
      'BusyMAD does not use analytics or tracking cookies. It only stores local preferences in your browser (localStorage), such as theme and whether you dismissed the install prompt. Geolocation runs only if you tap “Go to my location”; your position is handled by the browser on your device and is not sent to a BusyMAD server. If you email',
    licensePrivacyAfter: ', I will use your message only to reply.',
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
