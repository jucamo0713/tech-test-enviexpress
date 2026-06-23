import { LOCALE_ID, Provider, inject } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import localeEn from '@angular/common/locales/en';
import localeEsCo from '@angular/common/locales/es-CO';
import { APP_CONFIG } from '../config';
import { SOURCE_LOCALE, SUPPORTED_LOCALES } from './supported-locales';

const LOCALE_DATA: Record<string, unknown> = {
  'en-US': localeEn,
  'es-CO': localeEsCo,
};

export function provideAppI18n(): Provider[] {
  registerSupportedLocaleData();

  return [
    {
      provide: LOCALE_ID,
      useFactory: () => {
        const config = inject(APP_CONFIG);
        return SUPPORTED_LOCALES.includes(
          config.defaultLocale as (typeof SUPPORTED_LOCALES)[number],
        )
          ? config.defaultLocale
          : SOURCE_LOCALE;
      },
    },
  ];
}

function registerSupportedLocaleData(): void {
  for (const [locale, data] of Object.entries(LOCALE_DATA)) {
    registerLocaleData(data, locale);
  }
}

