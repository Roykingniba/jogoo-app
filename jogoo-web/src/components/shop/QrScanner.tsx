// QR scanner shown in a Sheet. Port of lib/screens/qr_scanner_screen.dart
// (mobile_scanner) using the qr-scanner package. When there is no camera
// (most desktops), the page is not secure, or camera access is refused, it
// falls back to typing the serial or reading a photo of the sticker.
import { useEffect, useRef, useState, type FormEvent } from 'react';
import QrScannerLib from 'qr-scanner';
import { Sheet, pickMediaFile } from '../overlays';
import { Button, TintIcon } from '../ui';
import { useI18n } from '../../i18n/i18n';

type Status = 'starting' | 'scanning' | 'noCamera' | 'denied';

export function QrScannerSheet({ open, onClose, onResult }: { open: boolean; onClose: () => void; onResult: (value: string) => void }) {
  const { t } = useI18n();
  return (
    <Sheet open={open} onClose={onClose} title={t('scanSticker')}>
      {open && <ScannerBody onResult={onResult} />}
    </Sheet>
  );
}

function ScannerBody({ onResult }: { onResult: (value: string) => void }) {
  const { t, fr } = useI18n();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [status, setStatus] = useState<Status>('starting');
  const [manual, setManual] = useState('');
  const [imageError, setImageError] = useState(false);
  const done = useRef(false);
  const resultRef = useRef(onResult);
  useEffect(() => { resultRef.current = onResult; });

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    let scanner: QrScannerLib | null = null;
    let cancelled = false;

    const finish = (value: string) => {
      const v = value.trim();
      if (done.current || v === '') return;
      done.current = true;
      scanner?.stop();
      resultRef.current(v);
    };

    (async () => {
      if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) {
        setStatus('noCamera');
        return;
      }
      let has = false;
      try { has = await QrScannerLib.hasCamera(); } catch { has = false; }
      if (cancelled) return;
      if (!has) { setStatus('noCamera'); return; }
      scanner = new QrScannerLib(video, (r) => finish(r.data), {
        returnDetailedScanResult: true,
        preferredCamera: 'environment',
        maxScansPerSecond: 8,
      });
      try {
        await scanner.start();
        if (cancelled) { scanner.destroy(); return; }
        setStatus('scanning');
      } catch (e) {
        if (cancelled) return;
        const text = String((e as Error)?.name ?? '') + ' ' + String((e as Error)?.message ?? e);
        setStatus(/NotAllowed|Permission|denied|Security/i.test(text) ? 'denied' : 'noCamera');
        scanner.destroy();
        scanner = null;
      }
    })();

    return () => {
      cancelled = true;
      scanner?.destroy();
    };
  }, []);

  const submitManual = (e: FormEvent) => {
    e.preventDefault();
    const v = manual.trim();
    if (v !== '') onResult(v);
  };

  const scanPhoto = async () => {
    setImageError(false);
    const picked = await pickMediaFile({ camera: false });
    if (!picked) return;
    try {
      const r = await QrScannerLib.scanImage(picked.file, { returnDetailedScanResult: true });
      onResult(r.data);
    } catch {
      setImageError(true);
    } finally {
      URL.revokeObjectURL(picked.url);
    }
  };

  const fallback = status === 'noCamera' || status === 'denied';

  return (
    <div className="stack">
      {!fallback && (
        <div className="qr-view">
          <video ref={videoRef} muted playsInline aria-label={t('pointCameraAtSticker')} />
          <div className="qr-frame" />
          {status === 'starting' && <div className="qr-status">…</div>}
          <div className="qr-hint">{t('pointCameraAtSticker')}</div>
        </div>
      )}
      {fallback && (
        <div className="qr-fallback">
          <div className="msg">
            <TintIcon icon={status === 'denied' ? 'error_outline' : 'photo_camera_outlined'} tone="orange" size={44} />
            <p className="t-body-l grow" style={{ paddingTop: 2 }}>
              {status === 'denied'
                ? (fr ? "L'accès à la caméra a été refusé. Saisissez le numéro de série inscrit sur l'étiquette, ou autorisez la caméra dans votre navigateur."
                  : 'Camera access was refused. Type the serial number printed on the sticker, or allow the camera in your browser.')
                : (fr ? "Aucune caméra disponible sur cet appareil. Saisissez le numéro de série inscrit sur l'étiquette."
                  : 'No camera is available on this device. Type the serial number printed on the sticker.')}
            </p>
          </div>
        </div>
      )}
      <form className="stack" style={{ ['--gap' as string]: '10px' }} onSubmit={submitManual}>
        <label className="field">
          <span className="lbl">{t('orTypeSerial')}</span>
          <input className="input" value={manual} onChange={(e) => setManual(e.target.value)} placeholder="DK2-0312"
            autoCapitalize="characters" autoComplete="off" spellCheck={false} autoFocus={fallback} />
        </label>
        <div className="row wrap">
          <Button type="submit" disabled={manual.trim() === ''}>{t('find')}</Button>
          <Button variant="outlined" icon="photo_library_outlined" onClick={scanPhoto}>
            {fr ? "Lire une photo de l'étiquette" : 'Read a photo of the sticker'}
          </Button>
        </div>
        {imageError && (
          <p className="t-body-m" style={{ color: 'var(--error)' }}>
            {fr ? 'Aucun code QR trouvé sur cette photo.' : 'No QR code found in this photo.'}
          </p>
        )}
      </form>
    </div>
  );
}
