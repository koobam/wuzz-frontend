import { zodResolver } from '@hookform/resolvers/zod';
import { useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from '@/core/utils/i18n';
import type { StockRow, WasteReason } from '@/core/api';
import { useRecordStock } from '@/services/hooks/apis';
import { useConfirmAction } from '@/services/hooks/use-confirm-action';
import { STOCK_DEFAULTS, stockSchema, type StockValues } from '../utils/stock-dialog.schema';

/**
 * The stock sheet's form and its call to the server. One key lives as long as the sheet is open, so a double tap or a
 * retry books the movement only once.
 */
export function useStockForm({ action, row, onDone }: { action: 'waste' | 'receipt'; row: StockRow; onDone: () => void }) {
  const { t } = useTranslation();
  const key = useRef(crypto.randomUUID());
  const form = useForm<StockValues>({
    resolver: zodResolver(stockSchema(t('stock.form.invalidQty'))),
    defaultValues: STOCK_DEFAULTS,
    mode: 'onChange',
  });

  const send = useRecordStock();
  const ask = useConfirmAction();
  const record = async (v: StockValues) => {
    if (!(await ask.stock(action, row.name))) return;
    send.mutate(
      action === 'waste'
        ? { action, material_id: row.material_id, qty: v.qty, reason: v.reason as WasteReason, note: v.note, idempotency_key: key.current }
        : { action, material_id: row.material_id, qty: v.qty, total_cost: v.cost, supplier: v.supplier, doc_no: v.docNo, note: v.note, idempotency_key: key.current },
      { onSuccess: onDone },
    );
  };

  return {
    form,
    submit: form.handleSubmit(record),
    saving: send.isPending,
    error: send.error,
  };
}
