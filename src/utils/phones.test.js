import {
  formatPhoneForDisplay,
  getPhoneHref,
  isValidPhoneNumberForUse,
  normalizePhoneDigits,
} from './phones';

describe('phone utilities', () => {
  it('normalizes punctuation and leading US country codes', () => {
    expect(normalizePhoneDigits('+1 (212) 555-1212')).toBe('2125551212');
  });

  it('allows short phone and text numbers', () => {
    expect(isValidPhoneNumberForUse('988', 'Phone')).toBe(true);
    expect(isValidPhoneNumberForUse('12345', 'Text only')).toBe(true);
  });

  it('links text numbers with sms and phone numbers with tel', () => {
    expect(getPhoneHref({ number: '12345', type: 'Text only' })).toBe('sms:12345');
    expect(getPhoneHref({ number: '2125551212', extension: 123, type: 'Phone' }))
      .toBe('tel:+12125551212;ext=123');
  });

  it('links WhatsApp numbers externally without a plus sign in the path', () => {
    expect(getPhoneHref({ number: '2125551212', type: 'WhatsApp' }))
      .toBe('https://wa.me/12125551212');
    expect(getPhoneHref({ number: '12345', type: 'WhatsApp' })).toBe(null);
  });

  it('does not hyperlink fax numbers', () => {
    expect(getPhoneHref({ number: '2125551212', type: 'Fax' })).toBe(null);
    expect(formatPhoneForDisplay({ number: '2125551212', type: 'Fax' }))
      .toBe('Fax: 212-555-1212');
  });
});
