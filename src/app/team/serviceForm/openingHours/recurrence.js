// Helpers for the HSDS 3.0 schedule recurrence fields (freq, byday, valid_from, valid_to)
// that the API stores on HolidaySchedules.
import moment from 'moment';
import { DAYS } from '../../../../Constants';

const BYDAY_CODES = ['MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU'];

export const WEEKLY = '';

export const ORDINALS = [
  // e.g. "2" with Friday is stored as BYDAY=2FR: the 2nd Friday of each month.
  { value: WEEKLY, label: 'Every week' },
  { value: '1', label: 'The 1st of those days each month' },
  { value: '2', label: 'The 2nd of those days each month' },
  { value: '3', label: 'The 3rd of those days each month' },
  { value: '4', label: 'The 4th of those days each month' },
  { value: '-1', label: 'The last of those days each month' },
];

export const MONTHS = moment.months();

export const EMPTY_RECURRENCE = {
  ordinal: WEEKLY,
  validFrom: '',
  validTo: '',
  closedMonths: [],
};

const isMonthException = row => row.closed && !!row.validFrom;

// Reads the recurrence settings back out of the rows the API returned.
export function readRecurrence(rows) {
  const openRow = rows.find(row => !row.closed);
  const bydayMatch = openRow && openRow.byday && openRow.byday.match(/^(-?\d)/);

  return {
    ordinal: bydayMatch ? bydayMatch[1] : WEEKLY,
    validFrom: (openRow && openRow.validFrom) || '',
    validTo: (openRow && openRow.validTo) || '',
    closedMonths: rows
      .filter(isMonthException)
      .map(row => moment(row.validFrom).month())
      .filter((month, i, months) => months.indexOf(month) === i)
      .sort((a, b) => a - b),
  };
}

export function hasRecurrence(recurrence) {
  return recurrence.ordinal !== WEEKLY || !!recurrence.validFrom || !!recurrence.validTo ||
    recurrence.closedMonths.length > 0;
}

// HSDS 3.0 has no BYMONTH, so a month the service is closed in is stored as a closed row
// covering the next occurrence of that month.
function monthExceptionRow(month, today) {
  const year = month >= today.month() ? today.year() : today.year() + 1;
  const start = moment({ year, month, day: 1 });
  return {
    closed: true,
    validFrom: start.format('YYYY-MM-DD'),
    validTo: start.clone().endOf('month').format('YYYY-MM-DD'),
  };
}

// Adds the recurrence fields to the open rows and appends one closed row per excluded month.
export function applyRecurrence(hours, recurrence, today = moment()) {
  const isMonthly = recurrence.ordinal !== WEEKLY;

  const openRows = hours.map((row) => {
    const code = BYDAY_CODES[DAYS.indexOf(row.weekday)];
    return {
      ...row,
      freq: isMonthly ? 'MONTHLY' : 'WEEKLY',
      byday: code ? `${isMonthly ? recurrence.ordinal : ''}${code}` : null,
      validFrom: recurrence.validFrom || null,
      validTo: recurrence.validTo || null,
    };
  });

  return [
    ...openRows,
    ...recurrence.closedMonths.map(month => monthExceptionRow(month, today)),
  ];
}

export function describeRecurrence(recurrence) {
  const parts = [];
  const ordinal = ORDINALS.find(({ value }) => value === recurrence.ordinal);
  if (ordinal && ordinal.value !== WEEKLY) parts.push(`only ${ordinal.label.toLowerCase()}`);
  const formatDate = date => moment(date).format('MMM D, YYYY');
  if (recurrence.validFrom) parts.push(`from ${formatDate(recurrence.validFrom)}`);
  if (recurrence.validTo) parts.push(`until ${formatDate(recurrence.validTo)}`);
  if (recurrence.closedMonths.length) {
    parts.push(`closed in ${recurrence.closedMonths.map(month => MONTHS[month]).join(', ')}`);
  }
  const text = parts.join(', ');
  return text && text[0].toUpperCase() + text.slice(1);
}
