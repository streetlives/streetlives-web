// Helpers for the HSDS 3.0 schedule fields (freq, byday, valid_from, valid_to, description)
// that the API stores on HolidaySchedules. Modelled on Google Business Profile:
// - regular hours per weekday, which can repeat every week or only on some weeks of the
//   month ("1st and 2nd Fridays" is BYDAY=1FR,2FR);
// - an optional season (valid from/until) for those regular hours;
// - special hours: dated rows without a weekday that override the regular hours on those
//   dates, either closed or with their own hours ("Christmas Day: closed").
import moment from 'moment';
import { DAYS } from '../../../../Constants';

const BYDAY_CODES = ['MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU'];

export const WEEK_OPTIONS = [
  { value: '1', label: '1st' },
  { value: '2', label: '2nd' },
  { value: '3', label: '3rd' },
  { value: '4', label: '4th' },
  { value: '5', label: '5th' },
  { value: '-1', label: 'Last' },
];
const WEEK_ORDER = WEEK_OPTIONS.map(({ value }) => value);

export const EMPTY_SCHEDULE = {
  weekPatterns: {},
  validFrom: '',
  validTo: '',
  specialHours: [],
};

export const isSpecialHours = row => !row.weekday && !!row.validFrom;

// The weeks of the month in a row's BYDAY, e.g. ['1', '2'] for "1FR,2FR"; [] for every week.
function readWeeks(byday) {
  return (byday || '')
    .split(',')
    .map(part => part.trim().match(/^(-?\d)[A-Z]{2}$/))
    .filter(Boolean)
    .map(match => match[1])
    .filter((week, i, weeks) => weeks.indexOf(week) === i);
}

export const sortWeeks = weeks =>
  [...weeks].sort((a, b) => WEEK_ORDER.indexOf(a) - WEEK_ORDER.indexOf(b));

// Reads the schedule settings back out of the rows the API returned.
export function readSchedule(rows) {
  const regularRows = rows.filter(row => !row.closed && !isSpecialHours(row));

  const weekPatterns = {};
  regularRows.forEach((row) => {
    const weeks = readWeeks(row.byday);
    if (row.weekday && weeks.length) weekPatterns[row.weekday] = sortWeeks(weeks);
  });

  const seasonRow = regularRows.find(row => row.validFrom || row.validTo);
  return {
    weekPatterns,
    validFrom: (seasonRow && seasonRow.validFrom) || '',
    validTo: (seasonRow && seasonRow.validTo) || '',
    specialHours: rows.filter(isSpecialHours).map(row => ({
      validFrom: row.validFrom,
      validTo: row.validTo && row.validTo !== row.validFrom ? row.validTo : '',
      closed: !!row.closed,
      opensAt: row.closed ? null : row.opensAt,
      closesAt: row.closed ? null : row.closesAt,
      description: row.description || '',
    })),
  };
}

// True when the regular hours only apply on some weeks of the month or in a season.
export function hasRecurrence(schedule) {
  return Object.values(schedule.weekPatterns).some(weeks => weeks.length > 0) ||
    !!schedule.validFrom || !!schedule.validTo;
}

// Adds the HSDS fields to the regular rows. With `withRecurrence` false (24/7), regular rows
// repeat every week with no season.
export function applySchedule(hours, schedule, { withRecurrence = true } = {}) {
  const regularRows = hours.map((row) => {
    const code = BYDAY_CODES[DAYS.indexOf(row.weekday)];
    const weeks = (withRecurrence && schedule.weekPatterns[row.weekday]) || [];
    let byday = null;
    if (code) byday = weeks.length ? weeks.map(week => `${week}${code}`).join(',') : code;
    return {
      ...row,
      freq: weeks.length ? 'MONTHLY' : 'WEEKLY',
      byday,
      validFrom: (withRecurrence && schedule.validFrom) || null,
      validTo: (withRecurrence && schedule.validTo) || null,
    };
  });

  const specialRows = schedule.specialHours.map(entry => ({
    closed: entry.closed,
    ...(entry.closed ? {} : { opensAt: entry.opensAt, closesAt: entry.closesAt }),
    validFrom: entry.validFrom,
    validTo: entry.validTo || entry.validFrom,
    description: entry.description || null,
  }));

  return [...regularRows, ...specialRows];
}

const joinWithAnd = (items) => {
  if (items.length <= 2) return items.join(' and ');
  return `${items.slice(0, -1).join(', ')}, and ${items[items.length - 1]}`;
};

// "1st and 2nd Fridays", "Last Monday".
export function describeWeeks(weekday, weeks) {
  if (!weeks || !weeks.length) return `Every ${weekday}`;
  const labels = sortWeeks(weeks).map(week => WEEK_OPTIONS.find(o => o.value === week).label);
  const text = `${joinWithAnd(labels)} ${weekday}${weeks.length > 1 ? 's' : ''} of the month`;
  return text[0].toUpperCase() + text.slice(1);
}

const formatDate = (date, withYear = true) =>
  moment(date).format(withYear ? 'MMM D, YYYY' : 'MMM D');

function formatTime(time) {
  const m = moment(time, 'HH:mm');
  if (!m.isValid()) return '';
  return m.minutes() ? m.format('h:mmA') : m.format('hA');
}

// "Dec 25, 2026 (Christmas Day): Closed", "Dec 24 – Dec 26, 2026: 10AM to 2PM".
export function describeSpecialHours(entry) {
  const dates = entry.validTo && entry.validTo !== entry.validFrom
    ? `${formatDate(entry.validFrom, false)} – ${formatDate(entry.validTo)}`
    : formatDate(entry.validFrom);
  const label = entry.description ? ` (${entry.description})` : '';
  const hours = entry.closed
    ? 'Closed'
    : `${formatTime(entry.opensAt)} to ${formatTime(entry.closesAt)}`;
  return `${dates}${label}: ${hours}`;
}

export function describeSeason({ validFrom, validTo }) {
  if (validFrom && validTo) {
    return `Runs from ${formatDate(validFrom)} until ${formatDate(validTo)}`;
  }
  if (validFrom) return `Runs from ${formatDate(validFrom)}`;
  if (validTo) return `Runs until ${formatDate(validTo)}`;
  return '';
}

export function isSpecialHoursValid(entry) {
  if (!entry.validFrom) return false;
  if (entry.validTo && entry.validTo < entry.validFrom) return false;
  return entry.closed || (!!entry.opensAt && !!entry.closesAt);
}
