import { keepPreviousData, useQuery } from '@tanstack/react-query';
import type { ActivityParams } from '@/core/api';
import { queries } from '@/services/queries';

/** One page of the activity log. Fetched only while `enabled` (the modal that shows it is open). */
export const useActivity = (params: ActivityParams, options: { enabled: boolean }) =>
  useQuery({ ...queries.activity.list(params), enabled: options.enabled, placeholderData: keepPreviousData, retry: false });
