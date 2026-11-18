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
    case 'missing_field': case 'invalid_field': case 'field_too_long': return 'errMissing';
    case 'invalid_name': case 'invalid_area': case 'invalid_date': case 'invalid_photo': return 'errFarmInvalid';
    case 'too_many': return 'errTooManyEquipment';
    default: return 'errServer';
  }
}
