export const openOptions = [
  { label: 'Open & closed', value: null },
  { label: 'Open Now', value: true, description: 'are open now' },
];

export const referralOptions = [
  { label: 'Any', value: null },
  { label: 'Not required', value: false, description: 'don\'t require referrals' },
  { label: 'Required', value: true, description: 'require a referral letter' },
];

export const clientOptions = [
  { label: 'Any', value: null },
  { label: 'Not required', value: false, description: 'allow non-clients' },
  { label: 'Required', value: true, description: 'accept only clients' },
];

export default {
  openOptions,
  referralOptions,
  clientOptions,
};
