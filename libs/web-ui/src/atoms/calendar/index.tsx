import { DayPicker, type DayPickerProps } from 'react-day-picker';
import { enUS, id } from 'react-day-picker/locale';
import 'react-day-picker/style.css';

const LOCALES = { en: enUS, id } as const;

/**
 * The calendar (react-day-picker, the base of shadcn's Calendar), in the app's colours and in the reader's `language` (en or id).
 * Everything else is passed straight through, so a screen asks for `mode="range"` and gets a range calendar.
 */
export function Calendar({ language = 'en', ...props }: DayPickerProps & { language?: string }) {
  const locale = LOCALES[language as keyof typeof LOCALES] ?? enUS;
  return <DayPicker showOutsideDays weekStartsOn={1} locale={locale} className="app-calendar" {...props} />;
}
