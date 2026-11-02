import { ErrorText, Page, Select } from '@wuzz/web-ui';
import { BomEditor, Calculator, CostSummary, OptionGroups, useCostingPage } from '@/features/costing';
import { ActivityButton } from '@/features/activity';

/** Recipes (BOM) and what they cost: the base recipe of a service, the extras each option brings, and a profit simulation. */
export function CostingPage() {
  const c = useCostingPage();
  const { t, costing, overview } = c;

  return (
    <Page title={t('costing.title')} subtitle={t('costing.subtitle')} actions={<ActivityButton entityType="bom" />}>
      <div className="space-y-5">
        <div className="max-w-md">
          <Select
            ariaLabel={t('costing.pickService')}
            searchable
            placeholder={t('costing.pickService')}
            value={c.serviceId}
            onChange={c.pickService}
            options={c.services.map((s) => ({ value: s.id, label: s.name }))}
          />
        </div>
        <ErrorText error={c.error} />
        {!costing && !c.loading && <p className="rounded-3xl border border-border bg-card p-5 text-sm text-muted-foreground">{t('costing.noService')}</p>}

        {costing && overview && (
          <>
            <CostSummary costing={costing} overview={overview} dec={c.dec} />
            <section className="rounded-3xl border border-border bg-card p-5">
              <BomEditor key={`service:${costing.service.id}`} owner="service" id={costing.service.id} title={t('costing.step1')} hint={t('costing.step1Hint', { unit: costing.service.unit, name: costing.service.name })} unit={costing.service.unit} onSaved={c.refresh} />
            </section>
            <OptionGroups costing={costing} isOpen={c.isOpen} dec={c.dec} onToggle={c.toggle} onSaved={c.refresh} />
            <Calculator key={costing.service.id} costing={costing} />
          </>
        )}
      </div>
    </Page>
  );
}
