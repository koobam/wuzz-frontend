import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import type { BomOwner } from '@/core/api';
import { useTranslation } from '@/core/utils/i18n';
import { useConfirmAction } from '@/services/hooks/use-confirm-action';
import { useActiveMaterials, useBom, usePutBom } from '@/services/hooks/apis';
import { blankLine, bomSchema, type BomValues } from '../utils/bom.schema';

/** The recipe editor: the lines of the saved recipe as a form, the materials to choose from, and the save. */
export function useBomForm({ owner, id, name, onSaved }: { owner: BomOwner; id: number; name: string; onSaved: () => void }) {
  const { t } = useTranslation();
  const ask = useConfirmAction();
  const bom = useBom(owner, id);
  const materials = useActiveMaterials();
  const save = usePutBom(owner, id, { onSaved });

  const form = useForm<BomValues>({ resolver: zodResolver(bomSchema(t)), defaultValues: { lines: [] }, mode: 'onChange' });
  const lines = useFieldArray({ control: form.control, name: 'lines' });

  // The saved recipe (and, after a save, the server's answer) replaces what is in the form.
  const { reset } = form;
  useEffect(() => {
    if (bom.data) reset({ lines: bom.data.lines.map((l) => ({ material_id: l.material_id, qty: l.qty, per: l.per, loss_percent: l.loss_percent })) });
  }, [bom.data, reset]);

  const materialOf = (materialId: number) => materials.data?.find((m) => m.id === materialId) ?? bom.data?.lines.find((l) => l.material_id === materialId);

  return {
    form,
    lines,
    addLine: () => lines.append(blankLine),
    submit: form.handleSubmit(async (v) => {
      if (!(await ask.save('recipe', name))) return;
      save.mutate({ lines: v.lines });
    }),
    materials: materials.data ?? [],
    materialOf,
    savedCost: (materialId: number) => bom.data?.lines.find((x) => x.material_id === materialId)?.cost,
    saving: save.isPending,
    saved: save.isSuccess,
    saveError: save.error,
    error: bom.error ?? materials.error,
  };
}
