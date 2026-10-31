import { Button, Input } from '@wuzz/web-ui';
import { useTranslation } from '@/core/utils/i18n';
import { useThread } from '../../hooks/use-thread';
import { CallBar } from '../call-bar';

/** One open conversation: the call bar, the messages (mine on the right) and the box to write in. */
export function Thread({ id, token }: { id: string; token: string }) {
  const { t } = useTranslation();
  const { messages, call, localVideo, remoteVideo, bottom, form, send } = useThread(id, token);

  return (
    <div className="flex min-h-0 flex-col">
      <CallBar call={call} />
      {call.state.status !== 'idle' && (
        <div className="relative bg-black">
          <video ref={remoteVideo} autoPlay playsInline className="h-56 w-full object-contain" />
          <video ref={localVideo} autoPlay playsInline muted className="absolute bottom-2 right-2 h-20 rounded border border-white/30" />
        </div>
      )}
      <div className="flex-1 space-y-2 overflow-y-auto p-3">
        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.sender_role === 'customer' ? 'justify-start' : 'justify-end'}`}>
            <span className={`max-w-[70%] rounded-2xl px-3 py-1.5 text-sm ${m.sender_role === 'customer' ? 'bg-muted' : 'bg-ink text-background'}`}>{m.body}</span>
          </div>
        ))}
        <div ref={bottom} />
      </div>
      <form onSubmit={send} className="flex gap-2 border-t border-border p-2">
        <Input shape="pill" className="flex-1 bg-background" placeholder={t('chat.placeholder')} aria-label={t('chat.placeholder')} {...form.register('body')} />
        <Button type="submit" variant="primary">{t('chat.send')}</Button>
      </form>
    </div>
  );
}
