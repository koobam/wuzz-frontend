import { useNavigate, useParams } from '@tanstack/react-router';
import type { Banner } from '@/core/api';
import { ApiError } from '@/core/http';
import { toId } from '@/core/utils/params';
import { useBanner } from '@/services/hooks/apis';

/**
 * The page that makes or edits a banner: with an id in the address it edits that banner, without one it makes a new one.
 * After saving it goes to the banner's page; cancelling goes back to where it came from.
 */
export function useBannerFormPage() {
  const { id: raw } = useParams({ strict: false }) as { id?: string };
  const editing = raw !== undefined;
  const id = toId(raw);
  const navigate = useNavigate();
  const banner = useBanner(id);
  const notFound = editing && (!id || (banner.error instanceof ApiError && banner.error.status === 404));

  return {
    editing,
    banner: banner.data,
    loading: editing && !!id && banner.isPending,
    isMissing: notFound,
    error: notFound ? null : banner.error,
    onSaved: (saved: Banner) => void navigate({ to: '/banners/$id', params: { id: String(saved.id) } }),
    onCancel: () => void (id ? navigate({ to: '/banners/$id', params: { id: String(id) } }) : navigate({ to: '/banners' })),
  };
}
