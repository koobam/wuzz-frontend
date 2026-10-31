import { useEffect, useRef, type ReactNode } from 'react';
import { Button } from '../../atoms/button';

/**
 * A modal that asks before something is created, changed or deleted. It is the browser's own `<dialog>`, so the focus
 * stays inside it, Escape cancels, and the page behind cannot be clicked. `destructive` makes the confirm button red.
 */
export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel,
  destructive = false,
  pending = false,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: ReactNode;
  description?: ReactNode;
  confirmLabel: string;
  cancelLabel: string;
  destructive?: boolean;
  pending?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    if (!open && el.open) el.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onCancel={(e) => {
        e.preventDefault();
        if (!pending) onCancel();
      }}
      onClick={(e) => e.target === ref.current && !pending && onCancel()}
      aria-labelledby="confirm-title"
      className="m-auto w-[min(26rem,calc(100vw-2rem))] rounded-3xl border border-border bg-card p-0 text-foreground backdrop:bg-black/40"
    >
      <div className="space-y-4 p-6">
        <div className="space-y-1.5">
          <h2 id="confirm-title" className="text-base font-semibold">{title}</h2>
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onCancel} disabled={pending}>{cancelLabel}</Button>
          <Button
            variant="primary"
            autoFocus
            onClick={onConfirm}
            disabled={pending}
            className={destructive ? 'bg-red-700 text-white dark:bg-red-600' : ''}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </dialog>
  );
}
