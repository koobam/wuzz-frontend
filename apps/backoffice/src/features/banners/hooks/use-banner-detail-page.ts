import { useNavigate, useParams } from '@tanstack/react-router';
import { ApiError } from '@/core/http';
import { toId } from '@/core/utils/params';
import { useBanner, useDeleteBanner, useOutlets, useServices, useSetBannerStatus } from '@/services/hooks/apis';
import { useConfirmAction } from '@/services/hooks/use-confirm-action';
import { useTargetName } from './use-banners-columns';

/** The banner page: the banner named in the address, what it opens, and turning it on or off and deleting it (each after a confirmation; deleting goes back to the list). */
export function useBannerDetailPage() {
  const { id: raw } = useParams({ from: '/_authed/banners_/$id' });
  const id = toId(raw);
  const services = useServices();
  const outlets = useOutlets();
  const navigate = useNavigate();
  const ask = useConfirmAction();
  const status = useSetBannerStatus();
  const remove = useDeleteBanner({ onDeleted: () => void navigate({ to: '/banners' }) });
  // Once the banner is being deleted its page must not ask for it again (the server would answer 404).
  const banner = useBanner(id, { enabled: !remove.isPending && !remove.isSuccess });
  const targetName = useTargetName(services.data, outlets.data);
  const notFound = !id || (banner.error instanceof ApiError && banner.error.status === 404);

  return {
    id,
    banner: banner.data,
    targetName: banner.data ? targetName(banner.data) : '',
    loading: !!id && banner.isPending,
    isMissing: notFound && !remove.isPending && !remove.isSuccess,
    error: notFound ? null : (banner.error ?? status.error ?? remove.error),
    busy: status.isPending || remove.isPending,
    onDelete: async () => {
      if (banner.data && (await ask.remove('banner', banner.data.title))) remove.mutate(banner.data);
    },
    onToggle: async () => {
      const b = banner.data;
      if (!b) return;
      const to = b.status !== 'active';
      if (await ask.toggle('banner', b.title, to)) status.mutate({ id: b.id, status: to ? 'active' : 'inactive' });
    },
  };
}
