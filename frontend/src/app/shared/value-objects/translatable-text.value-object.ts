export type TranslatableText = Partial<Record<string, string>>;

export function getLocalizedText(
  value: TranslatableText | undefined,
  preferredLang = 'es',
): string {
  return value?.[preferredLang] ?? Object.values(value ?? {})[0] ?? '';
}

