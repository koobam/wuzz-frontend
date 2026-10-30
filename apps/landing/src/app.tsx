import { useEffect, useState, type FormEvent } from 'react';
import { LanguageSwitch } from '@/components/language-switch';
import { CONFETTI } from '@/confetti';
import { useTranslation } from '@/core/i18n';

// Launch date (WIB) and the day preparation began; the ring shows how far along that stretch we are.
const TARGET = new Date('2027-04-01T00:00:00+07:00').getTime();
const START = new Date('2026-10-01T00:00:00+07:00').getTime();
// The gateway the email is sent to. Without it the form says sign-up is closed: nothing is pretended to be saved.
const API_URL = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '');

const ASSETS = '/coming-soon/';
const LEFT = [
  { key: 'man', file: '40bc2a18.svg' },
  { key: 'cat', file: '2d51ef81.svg' },
  { key: 'bald', file: 'fe84ab15.svg' },
] as const;
const RIGHT = [
  { key: 'girl', file: 'ebdecd0d.svg' },
  { key: 'ham', file: '3e971547.svg' },
  { key: 'boy', file: 'abd86701.svg' },
] as const;

const pad = (n: number) => String(n).padStart(2, '0');

function useCountdown() {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const left = Math.max(0, TARGET - now);
  const s = Math.floor(left / 1000);
  return {
    days: Math.floor(s / 86400),
    hours: Math.floor((s % 86400) / 3600),
    minutes: Math.floor((s % 3600) / 60),
    seconds: s % 60,
    daysCeil: Math.ceil(left / 86400000),
    progress: Math.min(1, Math.max(0, (now - START) / (TARGET - START))),
  };
}

function Character({ name, file }: { name: string; file: string }) {
  const { t } = useTranslation();
  return <img className={`cs-c cs-c-${name}`} alt={t(`characters.${name}`)} src={`${ASSETS}${file}`} />;
}

export function App() {
  const { t, i18n } = useTranslation();
  const c = useCountdown();
  const [email, setEmail] = useState('');
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  // The ring fills after the first paint so it animates in.
  const [shown, setShown] = useState(0);
  useEffect(() => {
    const id = setTimeout(() => setShown(c.progress), 150);
    return () => clearTimeout(id);
  }, [c.progress]);

  async function submit(e: FormEvent) {
    e.preventDefault();
    const value = email.trim();
    if (!API_URL) return setNote(t('form.closed'));
    setNote('');
    setBusy(true);
    try {
      const res = await fetch(`${API_URL}/app/v1/waitlist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: value, language: i18n.language }),
      });
      if (res.status === 400) return setNote(t('form.invalid'));
      if (!res.ok) throw new Error(String(res.status));
      setNote(t('form.thanks', { email: value }));
      setEmail('');
    } catch {
      setNote(t('form.failed'));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="cs">
      <div className="cs-aurora" aria-hidden="true">
        {['a', 'b', 'c', 'd', 'e'].map((k) => (
          <i key={k} className={`cs-blob ${k}`} />
        ))}
      </div>
      <div className="cs-top">
        <LanguageSwitch />
      </div>
      <main className="cs-wrap">
        <div className="cs-confetti" aria-hidden="true">
          {CONFETTI.map((f, i) => (
            <img
              key={i}
              className="cs-conf"
              alt=""
              src={`${ASSETS}${f.file}`}
              style={{ left: f.left, top: f.top, width: f.width, ['--r' as string]: `${f.rotate}deg`, animationDelay: `${f.delay}s` }}
            />
          ))}
        </div>

        <section className="cs-copy">
          <div className="cs-tag">{t('tag')}</div>
          <h1>
            <span>{t('title1')}</span> <span>{t('title2')}</span>
          </h1>
          <p className="cs-lead">{t('lead')}</p>

          <div className="cs-hud">
            <div className="cs-ring" role="img" aria-label={t('progress.label')}>
              <svg viewBox="0 0 100 100" aria-hidden="true">
                <circle className="track" cx="50" cy="50" r="46" />
                <circle className="bar" cx="50" cy="50" r="46" style={{ strokeDashoffset: 289 * (1 - shown) }} />
              </svg>
              <div className="cs-ring-txt">
                <b>{Math.round(c.progress * 100)}%</b>
                <span>{t('progress.toLaunch')}</span>
              </div>
            </div>
            <div className="cs-pills">
              <div className="cs-pill">
                <i />
                <span>{t('daysLeft', { count: c.daysCeil })}</span>
              </div>
              <div className="cs-pill lvl">
                <i />
                {t('earlyBird')}
              </div>
            </div>
          </div>

          <div className="cs-count" aria-label={t('countdown')}>
            {(
              [
                [pad(c.days), 'days'],
                [pad(c.hours), 'hours'],
                [pad(c.minutes), 'minutes'],
                [pad(c.seconds), 'seconds'],
              ] as const
            ).map(([v, k]) => (
              <div key={k} className="cs-cell">
                <b>{v}</b>
                <span>{t(`units.${k}`)}</span>
              </div>
            ))}
          </div>

          <form onSubmit={submit}>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t('form.placeholder')}
              aria-label={t('form.label')}
            />
            <button type="submit" className="cs-btn" disabled={busy}>
              {t('form.submit')}
            </button>
          </form>
          <p className="cs-note" role="status">
            {note}
          </p>
        </section>

        <div className="cs-cast cs-cast-l">
          {LEFT.map((x) => (
            <Character key={x.key} name={x.key} file={x.file} />
          ))}
        </div>
        <div className="cs-cast cs-cast-r">
          {RIGHT.map((x) => (
            <Character key={x.key} name={x.key} file={x.file} />
          ))}
        </div>
      </main>
    </div>
  );
}
