import { mergeQueryKeys } from '@lukemorales/query-key-factory';
import { chatQueries } from './chat.queries';
import { stockQueries } from './stock.queries';

/**
 * Every query key of the till that asks the server, in one place: `queries.stock.list(params)` is both the key and the
 * fetcher, and `queries.stock._def` is the prefix a mutation invalidates. The offline reads (catalog, orders) are not
 * here: they read the device first (see core/pos/hooks.ts). Components call the hooks in `services/hooks/apis`.
 */
export const queries = mergeQueryKeys(chatQueries, stockQueries);
