import { zodResolver } from '@hookform/resolvers/zod';
import { useRef } from 'react';
import { useForm } from 'react-hook-form';
import type { StockRow } from '@/core/api';
import { useTranslation } from '@/core/utils/i18n';
import { useAdjustStock, useOutlets, useReceiveStock, useSetStockMin, useTransferStock, useWasteStock } from '@/services/hooks/apis';
import { useConfirmAction } from '@/services/hooks/use-confirm-action';
import { stockDefaults, stockSchema, type StockAction, type StockValues } from '../utils/stock-dialog.schema';

/**
 * One stock action on one outlet's material. The form is typed by the schema; the idempotency key lives as long as the
 * sheet, so a double click or a retry books once.
 */
export function useStockDialogForm({ action, row, onDone }: { action: StockAction; row: StockRow; onDone: () => void }) {
  const { t } = useTranslation();
  const key = useRef(crypto.randomUUID());
  const outlets = useOutlets({ enabled: action === 'transfer' });
  const receive = useReceiveStock();
  const waste = useWasteStock();
  const adjust = useAdjustStock();
  const transfer = useTransferStock();
  const setMin = useSetStockMin();
  const sender = { receipt: receive, waste, adjustment: adjust, transfer, min: setMin }[action];

  const form = useForm<StockValues>({
    resolver: zodResolver(stockSchema(t, action)),
    defaultValues: stockDefaults(action, row),
    mode: 'onChange',
  });

  const ask = useConfirmAction();
  const submit = form.handleSubmit(async (v) => {
    if (!(await ask.stock(action, row.name))) return;
    const base = { outlet_id: row.outlet_id, material_id: row.material_id, idempotency_key: key.current };
    const opts = { onSuccess: onDone };
    switch (action) {
      case 'receipt':
        return receive.mutate({ ...base, qty: v.qty, total_cost: Math.round(Number(v.cost)), supplier: v.supplier, doc_no: v.docNo, note: v.note }, opts);
      case 'waste':
        return waste.mutate({ ...base, qty: v.qty, reason: v.reason, note: v.note }, opts);
      case 'adjustment':
        return adjust.mutate({ ...base, counted_qty: v.qty, note: v.note }, opts);
      case 'transfer':
        return transfer.mutate({ from_outlet_id: row.outlet_id, to_outlet_id: v.to!, material_id: row.material_id, qty: v.qty, note: v.note, idempotency_key: key.current }, opts);
      case 'min':
        return setMin.mutate({ outlet_id: row.outlet_id, material_id: row.material_id, min_qty: v.qty }, opts);
    }
  });

  return {
    form,
    submit,
    outlets: (outlets.data ?? []).filter((o) => o.id !== row.outlet_id),
    pending: sender.isPending,
    error: sender.error,
  };
}
