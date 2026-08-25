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

export function homePath(locale: Locale): string {
  return locale === 'en' ? '/en/' : '/';
}

export function appPath(locale: Locale): string {
  return locale === 'en' ? '/en/app/' : '/app/';
}

export function licensePath(locale: Locale): string {
  return locale === 'en' ? '/en/license/' : '/licencia/';
}

export function faqPath(locale: Locale): string {
  return locale === 'en' ? '/en/faq/' : '/faq/';
}

export function getAlternatePath(currentPath: string, targetLocale: Locale): string {
  const locale = getCurrentLocale(currentPath);
  if (locale === targetLocale) return currentPath;

  const normalized = currentPath.endsWith('/') ? currentPath : `${currentPath}/`;

  if (normalized === '/licencia/' || normalized === '/en/license/') {
    return licensePath(targetLocale);
  }

  if (normalized === '/faq/' || normalized === '/en/faq/') {
    return faqPath(targetLocale);
  }

  if (normalized === '/app/' || normalized === '/en/app/') {
    return appPath(targetLocale);
  }

  return homePath(targetLocale);
}
