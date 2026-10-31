import { mergeQueryKeys } from '@lukemorales/query-key-factory';
import { activityQueries } from './activity.queries';
import { bannersQueries } from './banners.queries';
import { costingQueries } from './costing.queries';
import { geocodeQueries } from './geocode.queries';
import { groupsQueries } from './groups.queries';
import { materialsQueries } from './materials.queries';
import { ordersQueries } from './orders.queries';
import { outletsQueries } from './outlets.queries';
import { presenceQueries } from './presence.queries';
import { servicesQueries } from './services.queries';
import { stockQueries } from './stock.queries';
import { usersQueries } from './users.queries';
import { injectionsQueries, vouchersQueries } from './vouchers.queries';

/**
 * Every query key of the app, in one place: `queries.orders.list(params)` is both the key and the fetcher, and
 * `queries.orders._def` is the prefix a mutation invalidates. One `<resource>.queries.ts` per resource; the components
 * never write a key by hand and call the hooks in `services/hooks/apis` instead.
 */
export const queries = mergeQueryKeys(
  activityQueries,
  bannersQueries,
  costingQueries,
  geocodeQueries,
  groupsQueries,
  materialsQueries,
  ordersQueries,
  outletsQueries,
  presenceQueries,
  servicesQueries,
  stockQueries,
  usersQueries,
  vouchersQueries,
  injectionsQueries,
);
