import type { FormEventHandler, ReactNode } from 'react';
import type { UseFormRegisterReturn } from 'react-hook-form';
import { Button, ErrorText, FormActions, FormSection, TextField } from '@wuzz/web-ui';
import { useTranslation } from '@/core/utils/i18n';
import { usePublishFormActions } from '@/features/shell/components/form-header-actions';

const FORM_ID = 'group-form';

/**
 * The frame both group forms share: a General card with the name and the internal notes, whatever the kind of group adds
 * (its rule, its options) as children cards, then Save / Cancel and what the server said if it refused.
 */
export function GroupFormFrame({
  name,
  notes,
  nameError,
  editing,
  saving,
  error,
  onSubmit,
  onCancel,
  children,
}: {
  name: UseFormRegisterReturn;
  notes: UseFormRegisterReturn;
  nameError?: string;
  editing: boolean;
  saving: boolean;
  /** What the server answered, if it refused. */
  error: Error | null;
  onSubmit: FormEventHandler<HTMLFormElement>;
  onCancel: () => void;
  children: ReactNode;
}) {
  const { t } = useTranslation();
  usePublishFormActions({ formId: FORM_ID, saving, editing, onCancel });
  return (
    <form id={FORM_ID} noValidate className="space-y-4" onSubmit={onSubmit}>
      <FormSection title={t('groups.sectionGeneral')} columns={2}>
        <TextField label={t('groups.name')} required placeholder={t('groups.nameExample')} maxLength={80} error={nameError} {...name} />
        <TextField label={t('groups.notes')} placeholder={t('groups.notesPlaceholder')} hint={t('groups.notesHint')} {...notes} />
      </FormSection>
      {children}
      <ErrorText error={error} />
      <FormActions>
        <Button type="submit" variant="primary" disabled={saving}>{editing ? t('common.save') : t('common.create')}</Button>
        <Button onClick={onCancel}>{t('common.cancel')}</Button>
      </FormActions>
    </form>
  );
}
