import { useState } from 'react';
import { Icon } from '../Icon';
import { useI18n } from '../../i18n/i18n';

/** Password field with a show/hide toggle (helps on small phone keyboards). */
export function PasswordInput({
  id, value, onChange, autoComplete, minLength,
}: { id: string; value: string; onChange: (v: string) => void; autoComplete: string; minLength?: number }) {
  const { t } = useI18n();
  const [show, setShow] = useState(false);
  return (
    <div className="acct-pass">
      <input id={id} className="input" type={show ? 'text' : 'password'} value={value} required
        minLength={minLength} maxLength={72} autoComplete={autoComplete} onChange={(e) => onChange(e.target.value)} />
      <button type="button" className="acct-eye" aria-label={show ? t('hidePassword') : t('showPassword')}
        aria-pressed={show} onClick={() => setShow((v) => !v)}>
        <Icon name={show ? 'eye_off' : 'eye'} size={20} />
      </button>
    </div>
  );
}
