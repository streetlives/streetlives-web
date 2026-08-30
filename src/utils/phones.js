export const PHONE_USE = {
  PHONE: 'phone',
  SMS: 'sms',
  WHATSAPP: 'whatsapp',
  FAX: 'fax',
};

export const PHONE_USE_OPTIONS = [
  { value: PHONE_USE.PHONE, label: 'Phone' },
  { value: PHONE_USE.SMS, label: 'Text only' },
  { value: PHONE_USE.WHATSAPP, label: 'WhatsApp' },
  { value: PHONE_USE.FAX, label: 'Fax' },
];

const MIN_PHONE_DIGITS = 3;
const MAX_PHONE_DIGITS = 10;
const PHONE_USE_LABELS = {
  [PHONE_USE.PHONE]: 'Phone',
  [PHONE_USE.SMS]: 'Text',
  [PHONE_USE.WHATSAPP]: 'WhatsApp',
  [PHONE_USE.FAX]: 'Fax',
};

export function normalizePhoneUse(type) {
  const normalizedType = `${type || ''}`.toLowerCase().replace(/[\s_-]+/g, '');

  if (normalizedType.includes('whatsapp')) {
    return PHONE_USE.WHATSAPP;
  }

  if (normalizedType.includes('sms') || normalizedType.includes('text')) {
    return PHONE_USE.SMS;
  }

  if (normalizedType.includes('fax')) {
    return PHONE_USE.FAX;
  }

  return PHONE_USE.PHONE;
}

export function phoneCanHaveExtension(type) {
  return normalizePhoneUse(type) === PHONE_USE.PHONE;
}

export function phoneUseToTypeLabel(phoneUse) {
  return PHONE_USE_LABELS[normalizePhoneUse(phoneUse)];
}

export function normalizePhoneDigits(number) {
  const digits = `${number || ''}`.replace(/\D/g, '');

  if (digits.length === 11 && digits.startsWith('1')) {
    return digits.slice(1);
  }

  return digits;
}

export function isValidPhoneNumberForUse(number, type) {
  const digits = normalizePhoneDigits(number);
  const phoneUse = normalizePhoneUse(type);

  if (digits.length < MIN_PHONE_DIGITS || digits.length > MAX_PHONE_DIGITS) {
    return false;
  }

  return phoneUse !== PHONE_USE.WHATSAPP || digits.length === MAX_PHONE_DIGITS;
}

export function formatPhoneNumberForDisplay(number, extension, type) {
  const digits = normalizePhoneDigits(number);
  const canHaveExtension = phoneCanHaveExtension(type);
  const extensionText = canHaveExtension && extension ? ` ext. ${extension}` : '';

  if (digits.length === MAX_PHONE_DIGITS) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}${extensionText}`;
  }

  if (digits.length === 7) {
    return `${digits.slice(0, 3)}-${digits.slice(3)}${extensionText}`;
  }

  return `${digits || number}${extensionText}`;
}

function getDialableNumber(number) {
  const digits = normalizePhoneDigits(number);
  return digits.length === MAX_PHONE_DIGITS ? `+1${digits}` : digits;
}

export function getPhoneHref({ number, extension, type }) {
  const phoneUse = normalizePhoneUse(type);
  const digits = normalizePhoneDigits(number);

  if (!isValidPhoneNumberForUse(digits, phoneUse) || phoneUse === PHONE_USE.FAX) {
    return null;
  }

  if (phoneUse === PHONE_USE.WHATSAPP) {
    return `https://wa.me/1${digits}`;
  }

  if (phoneUse === PHONE_USE.SMS) {
    return `sms:${getDialableNumber(digits)}`;
  }

  return `tel:${getDialableNumber(digits)}${
    extension && phoneCanHaveExtension(phoneUse) ? `;ext=${extension}` : ''
  }`;
}

export function formatPhoneForDisplay({
  number,
  extension,
  type,
  description,
}) {
  const phoneUse = normalizePhoneUse(type);
  const methodLabel = phoneUse === PHONE_USE.PHONE
    ? null
    : phoneUseToTypeLabel(phoneUse);
  const customType = type === phoneUseToTypeLabel(PHONE_USE.PHONE) ? null : type;
  const customLabel = phoneUse === PHONE_USE.PHONE ? (description || customType) : null;
  const label = methodLabel || customLabel;
  const detail = methodLabel && description ? ` (${description})` : '';

  return `${label ? `${label}: ` : ''}${
    formatPhoneNumberForDisplay(number, extension, phoneUse)
  }${detail}`;
}
