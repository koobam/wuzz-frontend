import type { OrderStatus } from '@/core/api';
import { Button } from '@wuzz/web-ui';
import { useTranslation } from '@/core/utils/i18n';
import { ACTION_ICON } from '../../utils/status';

/** The moves open to an order, as buttons: the forward step solid, cancelling in red. */
export function OrderActions({ moves, disabled, onMove }: { moves: OrderStatus[]; disabled: boolean; onMove: (to: OrderStatus) => void }) {
  const { t } = useTranslation();
  if (moves.length === 0) return null;
  return (
    <div className="flex items-center gap-2">
      {moves.map((to) => {
        const Icon = ACTION_ICON[to];
        return (
          <Button key={to} variant={to === 'cancelled' ? 'outline' : 'primary'} disabled={disabled} onClick={() => onMove(to)} className={`inline-flex items-center gap-2 ${to === 'cancelled' ? 'text-destructive' : ''}`}>
            <Icon className="size-4" /> {t(`orders.action.${to}`)}
          </Button>
        );
      })}
    </div>
  );
}
