import { Button, Page } from '@wuzz/web-ui';
import { CartPanel } from '@/features/orders/components/cart-panel';
import { CategoryTabs } from '@/features/orders/components/category-tabs';
import { ItemDialog } from '@/features/orders/components/item-dialog';
import { ServiceCard } from '@/features/orders/components/service-card';
import { useNewOrderPage } from '@/features/orders/hooks/use-new-order-page';
import { useTranslation } from '@/core/utils/i18n';

export function NewOrderPage() {
  const { t } = useTranslation();
  const c = useNewOrderPage();

  if (c.blocked) {
    return (
      <Page title={t('newOrder.title')} subtitle={t('newOrder.subtitle')}>
        <div className="max-w-xl space-y-4 rounded-3xl border border-border bg-card p-5 text-sm text-muted-foreground">
          <p>{t(`newOrder.${c.blocked}`)}</p>
          {c.blocked === 'loadFailed' && <Button onClick={c.reload}>{t('newOrder.retry')}</Button>}
        </div>
      </Page>
    );
  }

  return (
    <Page title={t('newOrder.title')} subtitle={t('newOrder.subtitle')}>
      <div className="grid items-start gap-5 xl:grid-cols-[1fr_24rem]">
        {/* The services are the first thing on the screen: pick a category, pick the services. */}
        <div className="space-y-4">
          {c.categories.length > 0 && <CategoryTabs categories={c.categories} value={c.category} total={c.services.length} countIn={c.countIn} onChange={c.setCategory} />}
          <section aria-label={t('newOrder.services')} className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-3">
            {c.shown.map((item) => (
              <ServiceCard key={item.id} item={item} qty={c.qtyOf(item)} onSet={(value) => c.setPlain(item, value)} onChoose={() => c.setChoosing(item)} />
            ))}
          </section>
        </div>

        {/* The order so far comes first; who it is for and where, below it. */}
        <CartPanel lines={c.lines} total={c.total} customer={c.customer} outlet={c.outlet} canSave={c.canSave} saved={c.saved} saving={c.saving} error={c.saveError} onSetLine={c.setLine} onSave={c.save} />
      </div>
      {c.choosing && <ItemDialog item={c.choosing} onAdd={(choice) => c.addChoice(c.choosing!, choice)} onClose={() => c.setChoosing(null)} />}
    </Page>
  );
}
