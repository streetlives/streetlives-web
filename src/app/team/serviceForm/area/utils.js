export const AREA_TYPE_LABELS = {
  ALL: 'All of NYC',
  CUSTOM: 'Only specific areas',
};

export const SERVICE_AREA_TYPES = {
  ALL: 'ALL',
  CUSTOM: 'CUSTOM',
};

export const getAreaTypeLabel = postalCodes => (
  postalCodes.length === 0 ? AREA_TYPE_LABELS.ALL : AREA_TYPE_LABELS.CUSTOM
);
