import type { ReactNode } from 'react';
import { TableCard } from '../../molecules/table-card';

/** A table written by hand: the header texts, and the rows as children. For a list that needs no sorting; otherwise use DataTable. */
export function Table({ head, children, empty, flat = false, footer }: { head: string[]; children: ReactNode; empty?: ReactNode; flat?: boolean; footer?: ReactNode }) {
  return (
    <TableCard empty={empty} flat={flat} footer={footer}>
      <table className="w-full min-w-max text-left text-sm">
        <thead className="text-xs text-muted-foreground">
          <tr>
            {head.map((h, i) => (
              <th
                key={i}
                className={`sticky top-0 z-10 bg-muted px-4 py-3 font-medium ${i === 0 ? 'rounded-l-2xl' : ''} ${i === head.length - 1 ? 'rounded-r-2xl' : ''}`}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border [&_tr]:hover:bg-accent/40">{children}</tbody>
      </table>
    </TableCard>
  );
}
