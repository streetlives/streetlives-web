import moment from 'moment';

// Enum types for field types
export const FIELD_TYPES = {
  MISSING: 'missing',
  DANGER: 'danger',
  WARNING: 'warning',
  SUCCESS: 'success',
};

export function getFieldType(date,  value) {
  if (!date && !value) {
    return FIELD_TYPES.MISSING;
  }

  if (!date && value) {
    return FIELD_TYPES.WARNING;
  }

  const oneYearAgo = moment().subtract(1, 'years');
  const sixMonthsAgo = moment().subtract(6, 'months');
  if (moment(date).isAfter(sixMonthsAgo)) {
    return FIELD_TYPES.SUCCESS;
  }
  if (moment(date).isAfter(oneYearAgo)) {
    return FIELD_TYPES.WARNING;
  }
  return FIELD_TYPES.DANGER;
}
