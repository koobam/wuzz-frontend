import { createContext, type ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '@wuzz/web-ui';
import { useTranslation } from '@/core/utils/i18n';

/** What a form tells the page header about itself, so the Save and Cancel at the top are the same buttons as the ones at the bottom. */
type FormActionsState = { formId: string; saving: boolean; editing: boolean; cancel: () => void };

const FormActionsContext = createContext<{ state: FormActionsState | null; publish: (state: FormActionsState | null) => void } | null>(null);

/** Put around a form page: the form publishes its state into it, and `TopFormActions` (in the page header) reads it. */
export function FormActionsProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<FormActionsState | null>(null);
  const publish = useCallback((next: FormActionsState | null) => setState(next), []);
  const value = useMemo(() => ({ state, publish }), [state, publish]);
  return <FormActionsContext.Provider value={value}>{children}</FormActionsContext.Provider>;
}

/**
 * Called by a form: `formId` is the `id` of its `<form>`, `saving` whether a save (or an upload) is under way, `editing` whether
 * it changes a record or makes one, `onCancel` what Cancel does. Outside a provider it does nothing.
 */
export function usePublishFormActions({ formId, saving, editing, onCancel }: { formId: string; saving: boolean; editing: boolean; onCancel: () => void }) {
  const ctx = useContext(FormActionsContext);
  const publish = ctx?.publish;
  const cancelRef = useRef(onCancel);
  cancelRef.current = onCancel;
  useEffect(() => {
    publish?.({ formId, saving, editing, cancel: () => cancelRef.current() });
    return () => publish?.(null);
  }, [publish, formId, saving, editing]);
}

/** Save (or Create) and Cancel for the header of a form page. It submits the form through its own `id`, so validation and the confirm modal behave exactly as with the bottom button. */
export function TopFormActions() {
  const { t } = useTranslation();
  const state = useContext(FormActionsContext)?.state;
  if (!state) return null;
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button type="submit" form={state.formId} variant="primary" disabled={state.saving}>
        {state.editing ? t('common.save') : t('common.create')}
      </Button>
      <Button onClick={state.cancel}>{t('common.cancel')}</Button>
    </div>
  );
}
