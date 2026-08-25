import type { Locale } from './i18n';
import { AUTHOR, EMT_GBFS_URL, GITHUB_REPO_URL, SITE_ORIGIN, t } from './translations';

export function webApplicationJsonLd(locale: Locale, pageUrl: string) {
  const strings = t(locale);
  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: strings.siteName,
    headline: strings.landingH1,
    description: strings.metaDescription,
    url: pageUrl,
    applicationCategory: 'TravelApplication',
    operatingSystem: 'Any',
    browserRequirements: 'Requires JavaScript. Requires HTML5.',
    inLanguage: locale === 'es' ? 'es-ES' : 'en-GB',
    isAccessibleForFree: true,
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'EUR',
    },
    author: {
      '@type': 'Person',
      name: AUTHOR,
    },
    keywords: strings.seoKeywords.join(', '),
  };
}

export function datasetJsonLd(locale: Locale) {
  const strings = t(locale);
  return {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    name: strings.seoDatasetName,
    description: strings.seoDatasetDescription,
    keywords: strings.seoKeywords,
    creator: {
      '@type': 'Organization',
      name: 'EMT de Madrid',
      url: 'https://www.emtmadrid.es',
    },
    provider: {
      '@type': 'Organization',
      name: 'EMT de Madrid',
    },
    spatialCoverage: {
      '@type': 'Place',
      name: 'Madrid, Spain',
      geo: {
        '@type': 'GeoCoordinates',
        latitude: 40.4168,
        longitude: -3.7038,
      },
    },
    temporalCoverage: '2022-06/2022-08',
    isAccessibleForFree: true,
    license: 'https://mobilitylabs.emtmadrid.es/sip/terms-of-use',
    distribution: [
      {
        '@type': 'DataDownload',
        encodingFormat: 'application/json',
        contentUrl: new URL('/data/stations_summer2022.json', SITE_ORIGIN).href,
      },
      {
        '@type': 'DataDownload',
        encodingFormat: 'application/json',
        contentUrl: EMT_GBFS_URL,
      },
    ],
    url: GITHUB_REPO_URL,
  };
}

export function faqJsonLd(locale: Locale) {
  const strings = t(locale);
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: strings.seoFaq.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.a,
      },
    })),
  };
}

export { SITE_ORIGIN };