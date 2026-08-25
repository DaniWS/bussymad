export type Locale = 'es' | 'en';

export const defaultLocale: Locale = 'es';
export const locales: Locale[] = ['es', 'en'];

export const localeLabels: Record<Locale, string> = {
  es: 'ES',
  en: 'EN',
};

export function getCurrentLocale(pathname: string): Locale {
  return pathname.startsWith('/en/') || pathname === '/en' ? 'en' : 'es';
}

export function getAlternatePath(currentPath: string, targetLocale: Locale): string {
  const locale = getCurrentLocale(currentPath);
  if (locale === targetLocale) return currentPath;

  const licenseEs = currentPath === '/licencia' || currentPath === '/licencia/';
  const licenseEn = currentPath === '/en/license' || currentPath === '/en/license/';
  if (licenseEs || licenseEn) {
    return targetLocale === 'en' ? '/en/license/' : '/licencia/';
  }

  if (targetLocale === 'en') return '/en/';
  return '/';
}
