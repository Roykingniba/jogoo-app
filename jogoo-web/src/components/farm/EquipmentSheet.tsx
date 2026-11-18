// Add or edit one piece of the client's equipment (and remove it).
import { useState, type FormEvent } from 'react';
import { Button, ChoicePill, PillRow } from '../ui';
import { Sheet, showToast } from '../overlays';
import { errorKey } from '../account/errors';
import type { FarmEquipment } from '../../data/backend';
import { EQUIPMENT_KINDS, dayString } from '../../data/farm';
import { useStore } from '../../data/store';
import { useI18n } from '../../i18n/i18n';

export function EquipmentSheet({ open, onClose, initial, onRemoved }: {
  open: boolean;
  onClose: () => void;
  /** Present when editing. */
  initial?: FarmEquipment;
  onRemoved?: () => void;
}) {
  if (!open) return null;
  return <EquipmentForm onClose={onClose} initial={initial} onRemoved={onRemoved} />;
}

function EquipmentForm({ onClose, initial, onRemoved }: { onClose: () => void; initial?: FarmEquipment; onRemoved?: () => void }) {
  const { t, lang } = useI18n();
  const saveEquipment = useStore((s) => s.saveEquipment);
  const removeEquipment = useStore((s) => s.removeEquipment);
  const [name, setName] = useState(initial?.name ?? '');
  const [kind, setKind] = useState<string | null>(initial?.kind ?? null);
  const [serial, setSerial] = useState(initial?.serial ?? '');
  const [installedOn, setInstalledOn] = useState(initial?.installedOn?.slice(0, 10) ?? '');
  const [notes, setNotes] = useState(initial?.notes ?? '');
  const [busy, setBusy] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fail = (e: unknown) => setError(t(errorKey(e)));

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (name.trim() === '') { setError(t('equipmentNameRequired')); return; }
    setBusy(true);
    setError(null);
    try {
      await saveEquipment({
        id: initial?.id,
        name: name.trim(),
        kind,
        serial: serial.trim() || null,
        installedOn: installedOn || null,
        notes: notes.trim() || null,
      });
      showToast(initial ? t('equipmentUpdated') : t('equipmentAdded'), name.trim());
      onClose();
    } catch (err) {
      fail(err);
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    if (!initial?.id) return;
    setBusy(true);
    try {
      await removeEquipment(initial.id);
      showToast(t('equipmentRemoved'), initial.name);
      onClose();
      onRemoved?.();
    } catch (err) {
      fail(err);
      setBusy(false);
    }
  };

  return (
    <Sheet open onClose={onClose} title={initial ? t('editEquipment') : t('addEquipment')}>
      <form className="stack" style={{ ['--gap' as string]: '14px' }} onSubmit={submit} noValidate>
        <div className="field">
          <label htmlFor="eq-name">{t('equipmentName')} *</label>
          <input id="eq-name" className="input" value={name} maxLength={120} autoFocus={!initial}
            placeholder={t('equipmentNameHint')} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="field">
          <span className="lbl" id="eq-kind">{t('equipmentKind')}</span>
          <div role="group" aria-labelledby="eq-kind">
            <PillRow wrap>
              {EQUIPMENT_KINDS.map((k) => (
                <ChoicePill key={k.id} label={k.label[lang]} selected={kind === k.id}
                  onClick={() => setKind(kind === k.id ? null : k.id)} />
              ))}
            </PillRow>
          </div>
        </div>
        <div className="grid g2" style={{ gap: 14 }}>
          <div className="field">
            <label htmlFor="eq-serial">{t('serialLabel')}</label>
            <input id="eq-serial" className="input" value={serial} maxLength={60} autoCapitalize="characters"
              autoComplete="off" spellCheck={false} onChange={(e) => setSerial(e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="eq-date">{t('installedDate')}</label>
            <input id="eq-date" className="input" type="date" value={installedOn} max={dayString(new Date())}
              onChange={(e) => setInstalledOn(e.target.value)} />
          </div>
        </div>
        <div className="field">
          <label htmlFor="eq-notes">{t('notes')}</label>
          <textarea id="eq-notes" className="textarea" rows={3} value={notes} maxLength={1000}
            placeholder={t('equipmentNotesHint')} onChange={(e) => setNotes(e.target.value)} />
        </div>
        {error && <p className="t-body-m" role="alert" style={{ color: 'var(--magenta)', margin: 0 }}>{error}</p>}
        {confirmRemove ? (
          <div className="farm-confirm" role="alert">
            <p className="t-body-l" style={{ margin: 0 }}>{t('removeEquipmentConfirm', { name: initial?.name ?? '' })}</p>
            <div className="row" style={{ justifyContent: 'flex-end', marginTop: 10 }}>
              <Button variant="text" onClick={() => setConfirmRemove(false)} disabled={busy}>{t('cancel')}</Button>
              <Button className="farm-btn-danger" onClick={() => void remove()} disabled={busy}>{t('remove')}</Button>
            </div>
          </div>
        ) : (
          <div className="row" style={{ justifyContent: 'flex-end', gap: 8, flexWrap: 'wrap' }}>
            {initial?.id && (
              <Button variant="text" className="farm-text-danger" onClick={() => setConfirmRemove(true)} disabled={busy}>
                {t('remove')}
              </Button>
            )}
            <span className="grow" />
            <Button variant="text" onClick={onClose} disabled={busy}>{t('cancel')}</Button>
            <Button type="submit" disabled={busy}>{busy ? t('saving') : t('save')}</Button>
          </div>
        )}
      </form>
    </Sheet>
  );
}
