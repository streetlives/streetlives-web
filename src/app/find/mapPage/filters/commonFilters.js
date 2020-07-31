export const openOptions = [
  { label: 'Any', value: null },
  { label: 'Open Now', value: true, description: 'are open now' },
];

export const referralOptions = [
  { label: 'Any', value: null },
  { label: 'Not required', value: false, description: 'don\'t require referrals' },
  { label: 'Required', value: true, description: 'require a referral letter' },
];

export const referralExplanation =
  'Some organizations require you to bring a letter – from another service provider – ' +
  ' stating you require their service.\n\nMost service providers will give you a referral letter ' +
  'to another provider on request.';

export const clientOptions = [
  { label: 'Any', value: null },
  { label: 'Not required', value: false, description: 'allow non-clients' },
  { label: 'Required', value: true, description: 'accept only clients' },
];

export const clientExplanation =
  'Some organizations require you to be a registered client of their organization ' +
  ' to access their services.\n\nMost service providers will allow you to become their client ' +
  'on request, though might require proofs like a picture ID or other documents.';

export default {
  openOptions,
  referralOptions,
  referralExplanation,
  clientOptions,
  clientExplanation,
};
