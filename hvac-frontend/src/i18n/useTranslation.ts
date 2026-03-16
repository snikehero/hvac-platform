import { useGlobalSettings } from "@/context/GlobalSettingsContext";
import { translations, type Language } from "./translations";
import type { TranslationKeys } from "./translations";

/**
 * Hook to access translations based on the user's language preference
 * @returns Object containing the current language and translation functions
 */
export function useTranslation() {
  const { settings } = useGlobalSettings();
  const language = settings.language as Language;
  const t = translations[language] as unknown as TranslationKeys;

  /**
   * Format a translation string with dynamic values
   * @param text - Translation text with placeholders like {name}
   * @param values - Object with values to replace placeholders
   * @returns Formatted string
   *
   * @example
   * tf("Hello {name}!", { name: "World" }) // "Hello World!"
   * tf(t.activity.minutesAgo, { minutes: 5 }) // "hace 5 minutos" (es) or "5 minutes ago" (en)
   */
  const tf = (text: string, values: Record<string, string | number>): string => {
    return Object.entries(values).reduce(
      (acc, [key, value]) => acc.replace(`{${key}}`, String(value)),
      text,
    );
  };

  return { t, tf, language };
}
