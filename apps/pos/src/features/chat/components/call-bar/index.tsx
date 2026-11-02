import { Button } from '@wuzz/web-ui';
import { useTranslation } from '@/core/utils/i18n';
import type { useCall } from '../../hooks/use-call';

/** The call controls above a conversation: start a call, answer or decline one, end the one in progress. */
export function CallBar({ call }: { call: ReturnType<typeof useCall> }) {
  const { t } = useTranslation();
  const { state } = call;
  return (
    <div className="flex items-center gap-2 border-b border-border px-3 py-2 text-sm">
      {state.status === 'idle' && (
        <>
          <Button size="sm" onClick={() => call.start(false)}>{t('chat.call')}</Button>
          <Button size="sm" onClick={() => call.start(true)}>{t('chat.videoCall')}</Button>
        </>
      )}
      {state.status === 'ringing' && (
        <>
          <span>
            {state.incoming
              ? t(state.video ? (state.from ? 'chat.incomingVideoCallFrom' : 'chat.incomingVideoCall') : state.from ? 'chat.incomingCallFrom' : 'chat.incomingCall', { from: state.from })
              : t('chat.calling')}
          </span>
          {state.incoming && (
            <Button variant="primary" size="sm" onClick={() => void call.accept()}>{t('chat.accept')}</Button>
          )}
          <Button size="sm" onClick={call.hangup}>{state.incoming ? t('chat.decline') : t('chat.cancel')}</Button>
        </>
      )}
      {state.status === 'connected' && (
        <>
          <span className="text-green-600">{t('chat.inCall')}</span>
          <button onClick={call.hangup} className="rounded-full bg-destructive px-3 py-1 text-destructive-foreground">{t('chat.end')}</button>
        </>
      )}
    </div>
  );
}
