import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import type { Banner } from '@/core/api';
import { useTranslation } from '@/core/utils/i18n';
import { useBannerScreens, useOutlets, useSaveBanner, useServices } from '@/services/hooks/apis';
import { useConfirmAction } from '@/services/hooks/use-confirm-action';
import { bannerBody, bannerSchema, type BannerValues, bannerValues, blankBanner } from '../utils/banner-form.schema';

/** The banner form: its values and rules, what its pickers offer (services, outlets), and the save. */
export function useBannerForm(banner: Banner | undefined, onSaved: (saved: Banner) => void) {
  const { t } = useTranslation();
  const ask = useConfirmAction();
  const form = useForm<BannerValues>({
    resolver: zodResolver(bannerSchema(t)),
    defaultValues: banner ? bannerValues(banner) : blankBanner(),
  });
  const services = useServices();
  const outlets = useOutlets();
  const screens = useBannerScreens();
  const save = useSaveBanner({ onSaved });
  // A picture still going up is not part of the banner yet: saving waits for it.
  const [uploading, setUploading] = useState(false);

  return {
    form,
    services: services.data ?? [],
    outlets: outlets.data ?? [],
    screens: screens.data ?? [],
    pickersError: services.error ?? outlets.error ?? screens.error,
    pickersLoading: services.isPending || outlets.isPending || screens.isPending,
    uploading,
    setUploading,
    submit: form.handleSubmit(async (values) => {
      if (!(await ask.submit('banner', values.title, !!banner))) return;
      save.mutate({ id: banner?.id, ...bannerBody(values) });
    }),
    saving: save.isPending,
    error: save.error,
  };
}
