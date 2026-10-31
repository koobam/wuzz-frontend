import { mergeQueryKeys } from '@lukemorales/query-key-factory';
import { bannersQueries } from './banners.queries';
import { laundryServicesQueries } from './laundry-services.queries';
import { usernameQueries } from './username.queries';

const queries = mergeQueryKeys(bannersQueries, laundryServicesQueries, usernameQueries);

export default queries;
