import { useTranslation } from '@/core/utils/i18n';

/** "05 Okt 2026, 17.00": a date and time as the list shows them. */
export const useDateFormat = () => {
  const { i18n } = useTranslation();
  return (iso: string) =>
    iso ? new Date(iso).toLocaleString(i18n.language, { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '–';
};
