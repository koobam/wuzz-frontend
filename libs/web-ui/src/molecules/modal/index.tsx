import { X } from 'lucide-react';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { PortalTargetContext } from '../../utils/portal-target';

/**
 * A modal with a title, a close button and a body that scrolls (the browser's own `<dialog>`: focus stays inside,
 * Escape and a click on the backdrop close it). For a question that needs an answer use `ConfirmDialog` instead.
 */
export function Modal({
  open,
  title,
  description,
  closeLabel,
  onClose,
  children,
}: {
  open: boolean;
  title: ReactNode;
  description?: ReactNode;
  closeLabel: string;
  onClose: () => void;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const [dialog, setDialog] = useState<HTMLDialogElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    if (!open && el.open) el.close();
  }, [open]);

  return (
    <dialog
      ref={(el) => {
        ref.current = el;
        setDialog(el);
      }}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => e.target === ref.current && onClose()}
      aria-labelledby="modal-title"
      className="m-auto w-[min(40rem,calc(100vw-2rem))] rounded-3xl border border-border bg-card p-0 text-foreground backdrop:bg-black/40"
    >
      {open && (
        <div className="flex max-h-[85dvh] flex-col">
          <div className="flex items-start justify-between gap-4 border-b border-border p-5">
            <div className="space-y-1">
              <h2 id="modal-title" className="text-base font-semibold">{title}</h2>
              {description && <p className="text-sm text-muted-foreground">{description}</p>}
            </div>
            <button type="button" onClick={onClose} aria-label={closeLabel} title={closeLabel} className="grid size-8 shrink-0 place-items-center rounded-full text-muted-foreground hover:bg-accent hover:text-foreground">
              <X className="size-4" />
            </button>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto p-5"><PortalTargetContext.Provider value={dialog}>{children}</PortalTargetContext.Provider></div>
        </div>
      )}
    </dialog>
  );
}
