import { useSettings } from "@/context/SettingsContext";
import { translations, type Language } from "./translations";

/**
 * Hook to access translations based on the user's language preference
 * @returns Object containing the current language and translation functions
 */
export function useTranslation() {
  const { settings } = useSettings();
  const language = settings.general.language as Language;
  const t = translations[language];

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
