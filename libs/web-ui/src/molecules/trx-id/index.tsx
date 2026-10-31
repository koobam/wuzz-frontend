import { Badge } from '../../atoms/badge';

/** An order's transaction code (TRX-DDMMYYYY-XXXX): a badge that copies the code when clicked. */
export function TrxId({ code }: { code: string }) {
  return (
    <Badge copy={code} tone="muted">
      {code}
    </Badge>
  );
}
