import { BackendError } from '../../data/backend';
import type { MsgKey } from '../../i18n/i18n';

/** Maps an API error code to a translated message key. */
export function errorKey(e: unknown): MsgKey {
  const code = e instanceof BackendError ? e.code : 'server_error';
  switch (code) {
    case 'offline': return 'errOffline';
    case 'invalid_credentials': return 'errInvalidCredentials';
    case 'email_taken': return 'errEmailTaken';
    case 'weak_password': return 'errWeakPassword';
    case 'password_too_long': return 'errPasswordTooLong';
    case 'invalid_email': return 'errInvalidEmail';
    case 'invalid_phone': return 'errInvalidPhone';
    case 'too_many_attempts': return 'errTooMany';
    case 'invalid_code': return 'errInvalidCode';
    case 'code_expired': return 'errCodeExpired';
    case 'email_failed': return 'errEmailFailed';
    case 'wait_before_resend': return 'errWaitResend';
    case 'not_signed_in': return 'errSessionExpired';
    case 'forbidden': return 'errForbidden';
    case 'invalid_field':
      return e instanceof BackendError && e.field === 'farmSizeHa' ? 'errFarmSize' : 'errMissing';
    case 'missing_field': case 'field_too_long': return 'errMissing';
    default: return 'errServer';
  }
}
