import { FilterField, Select } from '@wuzz/web-ui';
import { useServices } from '@/services/hooks/apis';
import { useTranslation } from '@/core/utils/i18n';

/** The filters both group lists share: which service uses the group, and whether it is used at all. */
export function GroupFilters({ service, usage, onService, onUsage }: { service: number; usage: '' | 'used' | 'unused'; onService: (id: number) => void; onUsage: (u: '' | 'used' | 'unused') => void }) {
  const { t } = useTranslation();
  const services = useServices();
  return (
    <>
      <FilterField label={t('filter.service')}>
      <Select
        ariaLabel={t('filter.service')}
        className="w-full"
        searchable
        value={service}
        onChange={onService}
        options={[{ value: 0, label: t('groups.allServices') }, ...(services.data ?? []).map((s) => ({ value: s.id, label: s.name }))]}
      />
      </FilterField>
      <FilterField label={t('filter.usage')}>
      <Select
        ariaLabel={t('filter.usage')}
        className="w-full"
        value={usage}
        onChange={onUsage}
        options={[
          { value: '' as const, label: t('groups.allUsage') },
          { value: 'used' as const, label: t('groups.used') },
          { value: 'unused' as const, label: t('groups.unused') },
        ]}
      />
      </FilterField>
    </>
  );
}
