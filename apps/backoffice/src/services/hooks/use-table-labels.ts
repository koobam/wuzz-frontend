import type { ServerTableLabels } from '@wuzz/web-ui';
import { useTranslation } from '@/core/utils/i18n';

/**
 * The words of a ServerTable: the shared ones (previous, next, reset, "no results") from the common copy, and the page's
 * search placeholder and "Showing 1-10 of 13 ..." sentence from its own keys (the latter takes {{from}}, {{to}}, {{total}}).
 */
export function useTableLabels(page: { search: string; showing: string }): ServerTableLabels {
  const { t } = useTranslation();
  return {
    searchLabel: t('table.search'),
    searchPlaceholder: t(page.search),
    showing: (from, to, total) => t(page.showing, { from, to, total }),
    previous: t('common.prev'),
    next: t('common.next'),
    reset: t('table.reset'),
    noResultsTitle: t('table.noResultsTitle'),
    noResultsDescription: t('table.noResultsDescription'),
  };
}
