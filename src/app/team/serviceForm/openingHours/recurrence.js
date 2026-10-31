// Reads and writes what the opening hours editor shows as the rows the API stores on
// HolidaySchedules. Modelled on Google Calendar (see scheduleRules.js for what the rows mean):
// - repeating hours. The editor keeps them as "atoms": one time range on one weekday (or on
//   days of the month), with how it repeats: every N weeks, on some weeks of every N months
//   ("1st and 3rd Saturdays"), or on some days of every N months ("the 15th"); in some months
//   only; from an optional start date, which is also what "every 2 weeks" counts from, to an
//   optional end date; skipping some dates. One atom is one saved row. groupAtoms shows them as
//   cards: days that repeat the same way with the same time ranges share a card, so Mon–Fri
//   9AM–1PM and 2PM–5PM is one card, a day whose ranges differ gets its own, and it joins again
//   once they match.
// - closures that repeat: "every December 25", "every 4th Thursday of November", "all of
//   August", "the last Friday of every month". Saved as closed rows with freq.
// - special hours: dated one-offs ("Christmas Day 2026: 10AM to 2PM") that replace everything
//   else on their dates.
// Dates that have passed drop out when a schedule is read, so they don't pile up.
import moment from 'moment';
import { DAYS } from '../../../../Constants';
import {
  isSeries, isOneOff, isRecurringClosure, addDays, findConflicts, MINUTES_PER_DAY,
} from './scheduleRules';

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

export const MONTHS = moment.months();
const ALL_MONTH_DAYS = Array.from({ length: 31 }, (_, i) => i + 1).join(',');

// Today in New York, as YYYY-MM-DD.
export const nyToday = () =>
  new Intl.DateTimeFormat('en-CA', { timeZone: 'America/New_York' }).format(new Date());

export const sortWeeks = weeks =>
  [...weeks].sort((a, b) => WEEK_ORDER.indexOf(a) - WEEK_ORDER.indexOf(b));
export const sortDays = days => [...days].sort((a, b) => DAYS.indexOf(a) - DAYS.indexOf(b));
const sortMonths = months => [...months].sort((a, b) => Number(a) - Number(b));
const codeOf = day => BYDAY_CODES[DAYS.indexOf(day)];

// What makes atoms repeat the same way; atoms that share all of it can share a card.
const SETTINGS = ['freq', 'interval', 'weeks', 'monthDays', 'months', 'validFrom', 'validTo',
  'exdates'];
const pickSettings = item =>
  SETTINGS.reduce((picked, key) => ({ ...picked, [key]: item[key] }), {});
const settingsKey = item => JSON.stringify(SETTINGS.map(key => item[key]));
const rangeOf = ({ opensAt, closesAt, description }) => ({ opensAt, closesAt, description });
const sameRange = (a, b) => JSON.stringify(rangeOf(a)) === JSON.stringify(rangeOf(b));
const atomKey = atom => `${settingsKey(atom)}|${atom.day}|${JSON.stringify(rangeOf(atom))}`;
// A range still being filled in (no opening time) goes last.
const byOpening = (a, b) => (a.opensAt || '99:99').localeCompare(b.opensAt || '99:99');

export const newAtom = (changes = {}) => ({
  day: null,
  opensAt: '09:00',
  closesAt: '17:00',
  description: '',
  freq: 'WEEKLY',
  interval: 1,
  // MONTHLY only: weeks of the month (['1', '3']), or days of the month ('15').
  weeks: [],
  monthDays: '',
  // Months the hours run in (['6', '7', '8']); empty for all year.
  months: [],
  validFrom: '',
  validTo: '',
  exdates: [],
  ...changes,
});

export const newClosure = (changes = {}) => ({
  description: '',
  freq: 'YEARLY',
  // YEARLY only: the month it falls in.
  month: '12',
  // 'days' of the month (monthDays), the Nth 'weekday' (weeks + day), or the whole 'month'.
  on: 'days',
  monthDays: '25',
  weeks: ['4'],
  day: 'Thursday',
  validFrom: '',
  validTo: '',
  exdates: [],
  ...changes,
});

export const EMPTY_SCHEDULE = { atoms: [], closures: [], specialHours: [] };

// An editor row (camelCase, weekday as a day name) as the API row scheduleRules.js reads.
export const toApiRow = row => ({
  ...row,
  weekday: row.weekday ? DAYS.indexOf(row.weekday) + 1 : null,
  opens_at: row.opensAt,
  closes_at: row.closesAt,
  valid_from: row.validFrom || null,
  valid_to: row.validTo || null,
});

export const isSpecialHours = row => isOneOff(toApiRow(row));

// The weekdays in a BYDAY without a weekday of its own, e.g. "MO,TU" or "1SA,3SA".
const readBydayDays = byday => sortDays([...new Set((byday || '')
  .split(',')
  .map(part => DAYS[BYDAY_CODES.indexOf(part.trim().slice(-2))])
  .filter(Boolean))]);

// The weeks of the month in a BYDAY, e.g. ['1', '3'] for "1SA,3SA"; [] for every week.
const readWeeks = byday => sortWeeks([...new Set((byday || '')
  .split(',')
  .map(part => part.trim().match(/^(-?\d)[A-Z]{2}$/))
  .filter(Boolean)
  .map(match => match[1]))]);

const readMonths = bymonth => sortMonths((bymonth || '').split(',').filter(Boolean));

// Drops atoms with identical settings, day and range.
export const dedupe = atoms =>
  atoms.filter((atom, i) => atoms.findIndex(other => atomKey(other) === atomKey(atom)) === i);

// Overnight hours used to be saved as two rows split at midnight (Monday 21:00–23:59 and
// Tuesday 00:00–06:00). Join them into one overnight range, which now belongs to the day it
// starts on. Days open all day are left alone.
function joinSplitOvernight(atoms) {
  const used = new Set();
  return atoms.flatMap((atom) => {
    if (used.has(atom)) return [];
    const isEvening = atom.day && atom.freq === 'WEEKLY' && !atom.weeks.length &&
      atom.closesAt === '23:59' && atom.opensAt !== '00:00';
    if (!isEvening) return [atom];
    const nextDay = DAYS[(DAYS.indexOf(atom.day) + 1) % DAYS.length];
    const morning = atoms.find(other => !used.has(other) && other !== atom &&
      other.day === nextDay && other.opensAt === '00:00' && other.closesAt !== '23:59' &&
      settingsKey(other) === settingsKey(atom));
    if (!morning) return [atom];
    used.add(morning);
    return [{ ...atom, closesAt: morning.closesAt }];
  });
}

// The atoms for a repeating-hours row: one per weekday it names.
function readAtoms(row, today) {
  const settings = {
    opensAt: row.opensAt,
    closesAt: row.closesAt,
    description: row.description || '',
    freq: row.freq === 'MONTHLY' ? 'MONTHLY' : 'WEEKLY',
    interval: row.interval || 1,
    weeks: readWeeks(row.byday),
    monthDays: row.bymonthday || '',
    months: readMonths(row.bymonth),
    validFrom: row.validFrom || '',
    validTo: row.validTo || '',
    exdates: [...(row.exdates || [])].filter(date => date >= today).sort(),
  };
  if (settings.monthDays) return [newAtom(settings)];
  const days = row.weekday ? [row.weekday] : readBydayDays(row.byday);
  return days.map(day => newAtom({ ...settings, day }));
}

function readClosure(row, today) {
  const settings = {
    description: row.description || '',
    freq: row.freq === 'MONTHLY' ? 'MONTHLY' : 'YEARLY',
    month: readMonths(row.bymonth)[0] || newClosure().month,
    validFrom: row.validFrom || '',
    validTo: row.validTo || '',
    exdates: [...(row.exdates || [])].filter(date => date >= today).sort(),
  };
  if (row.byday) {
    return newClosure({
      ...settings,
      on: 'weekday',
      weeks: readWeeks(row.byday),
      day: readBydayDays(row.byday)[0],
    });
  }
  if (row.bymonthday === ALL_MONTH_DAYS) return newClosure({ ...settings, on: 'month' });
  return newClosure({ ...settings, on: 'days', monthDays: row.bymonthday || '' });
}

// Groups special-hours rows into entries: one row per time range, so a date open
// 9AM to 12PM and 1PM to 5PM is two rows with the same dates and label.
function readSpecialHours(rows) {
  const entries = [];
  rows.forEach((row) => {
    const validTo = row.validTo && row.validTo !== row.validFrom ? row.validTo : '';
    const description = row.description || '';
    const closed = !!row.closed;
    const existing = entries.find(entry => entry.validFrom === row.validFrom &&
      entry.validTo === validTo && entry.description === description && entry.closed === closed);
    const hours = closed ? [] : [{ opensAt: row.opensAt, closesAt: row.closesAt }];
    if (existing) {
      existing.hours.push(...hours);
    } else {
      entries.push({
        validFrom: row.validFrom, validTo, closed, hours, description,
      });
    }
  });
  entries.forEach(entry => entry.hours.sort(byOpening));
  return entries;
}

// Reads the schedule out of the rows the API returned, leaving out what ended before `today`
// (YYYY-MM-DD): repeating hours and closures that stopped, special hours, and skipped dates.
export function readSchedule(rows, today = nyToday()) {
  const current = rows.filter(row => !row.validTo || row.validTo >= today);
  return {
    atoms: dedupe(joinSplitOvernight(current
      .filter(row => isSeries(toApiRow(row)))
      .flatMap(row => readAtoms(row, today)))),
    closures: current.filter(row => isRecurringClosure(toApiRow(row)))
      .map(row => readClosure(row, today)),
    specialHours: readSpecialHours(current.filter(isSpecialHours)),
  };
}

// Groups atoms into cards: atoms that repeat the same way, on days with the same time ranges.
// A card is { ...settings, days, ranges, atoms }, sorted by its first day and opening time.
export function groupAtoms(atoms) {
  const bySettings = new Map();
  atoms.forEach((atom) => {
    const key = settingsKey(atom);
    bySettings.set(key, [...(bySettings.get(key) || []), atom]);
  });

  const cards = [];
  bySettings.forEach((group) => {
    const byDay = new Map();
    group.forEach(atom => byDay.set(atom.day, [...(byDay.get(atom.day) || []), atom]));
    const byRanges = new Map();
    byDay.forEach((dayAtoms, day) => {
      const ranges = [...dayAtoms].sort(byOpening).map(rangeOf);
      const key = JSON.stringify(ranges);
      const card = byRanges.get(key) || { days: [], atoms: [], ranges };
      card.days.push(day);
      card.atoms.push(...dayAtoms);
      byRanges.set(key, card);
    });
    byRanges.forEach(({ days, atoms: cardAtoms, ranges }) => {
      cards.push({
        ...pickSettings(cardAtoms[0]),
        days: sortDays(days.filter(Boolean)),
        ranges,
        atoms: cardAtoms,
      });
    });
  });

  // Days of the month after weekdays, and cards with no day picked yet last.
  const order = (card) => {
    if (card.days.length) return DAYS.indexOf(card.days[0]);
    return card.monthDays ? 7 : 8;
  };
  return cards.sort((a, b) => order(a) - order(b) ||
    byOpening(a.ranges[0], b.ranges[0]) ||
    (a.validFrom || '').localeCompare(b.validFrom || ''));
}

// A key for a card that stays the same while its settings and ranges do.
export const cardKey = card => `${settingsKey(card)}|${JSON.stringify(card.ranges)}`;

// Edits to the atoms behind `card`; each returns the new list of atoms.
const replaceCard = (atoms, card, replacement) =>
  dedupe([...atoms.filter(atom => !card.atoms.includes(atom)), ...replacement]);

const cardAtoms = (card, days, ranges) => (days.length ? days : [null])
  .flatMap(day => ranges.map(range => newAtom({ ...pickSettings(card), ...range, day })));

export const updateCard = (atoms, card, changes) => replaceCard(atoms, card, card.atoms
  // Days of the month have no weekday.
  .map(atom => ({ ...atom, ...changes, ...(changes.monthDays ? { day: null } : {}) })));

export const setCardDays = (atoms, card, days) =>
  replaceCard(atoms, card, cardAtoms(card, sortDays(days), card.ranges));

export const updateRange = (atoms, card, index, changes) => replaceCard(atoms, card, card.atoms
  .map(atom => (sameRange(atom, card.ranges[index]) ? { ...atom, ...changes } : atom)));

export const addRange = (atoms, card) => replaceCard(atoms, card, [
  ...card.atoms,
  ...cardAtoms(card, card.days, [{ opensAt: '', closesAt: '', description: '' }]),
]);

export const removeRange = (atoms, card, index) => replaceCard(atoms, card, card.atoms
  .filter(atom => !sameRange(atom, card.ranges[index])));

// Takes one range off one day, which gives that day its own card.
export const removeRangeOnDay = (atoms, card, index, day) => replaceCard(atoms, card, card.atoms
  .filter(atom => !(sameRange(atom, card.ranges[index]) && atom.day === day)));

export const removeCard = (atoms, card) => replaceCard(atoms, card, []);

export const addCard = atoms => [...atoms, newAtom()];

// "Change from a date" (Google Calendar's "this and following events"): the card ends the day
// before `date`, and a copy starts on `date`, taking the skipped dates from then on with it.
export const splitCard = (atoms, card, date) => replaceCard(atoms, card, card.atoms
  .flatMap(atom => [
    { ...atom, validTo: addDays(date, -1), exdates: atom.exdates.filter(d => d < date) },
    { ...atom, validFrom: date, exdates: atom.exdates.filter(d => d >= date) },
  ]));

export const skipCardDate = (atoms, card, date) => updateCard(atoms, card, {
  exdates: [...new Set([...card.exdates, date])].sort(),
});

export const unskipCardDate = (atoms, card, date) => updateCard(atoms, card, {
  exdates: card.exdates.filter(d => d !== date),
});

const toMinutes = (time) => {
  const [hours, minutes] = time.split(':').map(Number);
  return (hours * 60) + minutes;
};
const span = ({ opensAt, closesAt }) => {
  const open = toMinutes(opensAt);
  const close = toMinutes(closesAt);
  return { open, close: close <= open ? close + MINUTES_PER_DAY : close };
};

// Joins a card's ranges that overlap or touch: 9AM–1PM and 1PM–5PM become 9AM–5PM.
export function mergeCardRanges(atoms, card) {
  const merged = [];
  card.ranges.filter(range => range.opensAt && range.closesAt).forEach((range) => {
    const last = merged[merged.length - 1];
    if (last && span(range).open <= span(last).close) {
      if (span(range).close > span(last).close) last.closesAt = range.closesAt;
      last.description = [last.description, range.description].filter(Boolean).join(' ');
    } else {
      merged.push({ ...range });
    }
  });
  return replaceCard(atoms, card, cardAtoms(card, card.days, merged));
}

function closureRow(closure) {
  const row = {
    closed: true,
    freq: closure.freq,
    description: closure.description || null,
    validFrom: closure.validFrom || null,
    validTo: closure.validTo || null,
    exdates: closure.exdates.length ? [...closure.exdates].sort() : null,
  };
  if (closure.freq === 'YEARLY') row.bymonth = closure.month;
  if (closure.on === 'weekday') {
    row.byday = sortWeeks(closure.weeks).map(week => `${week}${codeOf(closure.day)}`).join(',');
  } else {
    row.bymonthday = closure.on === 'month' ? ALL_MONTH_DAYS : closure.monthDays;
  }
  return row;
}

const withoutEmpty = row => Object.keys(row).reduce((kept, key) => (
  row[key] == null ? kept : { ...kept, [key]: row[key] }
), {});

function atomRow(atom) {
  const byday = atom.freq === 'MONTHLY'
    ? sortWeeks(atom.weeks).map(week => `${week}${codeOf(atom.day)}`).join(',')
    : codeOf(atom.day);
  return withoutEmpty({
    closed: false,
    opensAt: atom.opensAt,
    closesAt: atom.closesAt,
    description: atom.description || null,
    freq: atom.freq,
    interval: atom.interval > 1 ? Number(atom.interval) : null,
    validFrom: atom.validFrom || null,
    validTo: atom.validTo || null,
    exdates: atom.exdates.length ? [...atom.exdates].sort() : null,
    bymonth: atom.months.length ? sortMonths(atom.months).join(',') : null,
    ...(atom.monthDays
      ? { bymonthday: atom.monthDays }
      : { weekday: atom.day || null, byday: atom.day ? byday : null }),
  });
}

function specialRows(entry) {
  const dates = {
    validFrom: entry.validFrom,
    validTo: entry.validTo || entry.validFrom,
    description: entry.description || null,
  };
  if (entry.closed) return [{ closed: true, ...dates }];
  return entry.hours.map(({ opensAt, closesAt }) => ({
    closed: false, opensAt, closesAt, ...dates,
  }));
}

// The rows to save: one per atom, closure and special-hours time range.
export function applySchedule({ atoms, closures = [], specialHours = [] }) {
  return [
    ...groupAtoms(atoms).flatMap(card => card.atoms.map(atomRow)),
    ...closures.map(closure => withoutEmpty(closureRow(closure))),
    ...specialHours.flatMap(specialRows),
  ];
}

const joinWithAnd = (items) => {
  if (items.length <= 2) return items.join(' and ');
  return `${items.slice(0, -1).join(', ')}, and ${items[items.length - 1]}`;
};

// "1st and 2nd Fridays of the month", "Last Monday".
export function describeWeeks(weekday, weeks) {
  if (!weeks || !weeks.length) return `Every ${weekday}`;
  const labels = sortWeeks(weeks).map(week => WEEK_OPTIONS.find(o => o.value === week).label);
  const text = `${joinWithAnd(labels)} ${weekday}${weeks.length > 1 ? 's' : ''} of the month`;
  return text[0].toUpperCase() + text.slice(1);
}

const formatDate = (date, withYear = true) =>
  moment(date).format(withYear ? 'MMM D, YYYY' : 'MMM D');

export function formatTime(time) {
  const m = moment(time, 'HH:mm');
  if (!time || !m.isValid()) return '?';
  return m.minutes() ? m.format('h:mmA') : m.format('hA');
}

export const formatRange = ({ opensAt, closesAt }) => {
  const nextDay = opensAt && closesAt && closesAt <= opensAt ? ' (next day)' : '';
  return `${formatTime(opensAt)} to ${formatTime(closesAt)}${nextDay}`;
};

const ORDINALS = ['', '1st', '2nd', '3rd'];
const ordinal = n => ORDINALS[n] || `${n}th`;
const every = (interval, unit) => {
  if (interval <= 1) return `every ${unit}`;
  if (interval === 2) return `every other ${unit}`;
  return `every ${ordinal(interval)} ${unit}`;
};

const describeMonthDays = monthDays => joinWithAnd(monthDays.split(',').map(Number)
  .map(n => (n === -1 ? 'last day' : `${ordinal(n)}`)));

// "Mon, Wed and Fri", "Weekdays", "Every day"; lower case inside a sentence.
function describeDays(days, inSentence = false) {
  const sorted = sortDays(days);
  let text = joinWithAnd(sorted.map(day => day.slice(0, 3)));
  if (sorted.length === 7) text = 'Every day';
  if (sorted.join() === DAYS.slice(0, 5).join()) text = 'Weekdays';
  if (sorted.join() === DAYS.slice(5).join()) text = 'Weekends';
  return inSentence && !/^[A-Z][a-z]{2}( |,|$)/.test(text) ? text.toLowerCase() : text;
}

const describeMonths = months => joinWithAnd(sortMonths(months)
  .map(month => MONTHS[Number(month) - 1].slice(0, 3)));

// The repeat rule in words: "Every other week on Sun", "1st and 3rd Sat of every month",
// "1st week of every month", "The 15th of every other month", "Sat, Jun to Aug only".
export function describeRepeat(card) {
  const interval = Number(card.interval) || 1;
  let text;
  if (card.freq === 'MONTHLY' && card.monthDays) {
    text = `The ${describeMonthDays(card.monthDays)} of ${every(interval, 'month')}`;
  } else if (card.freq === 'MONTHLY') {
    const weeks = joinWithAnd(sortWeeks(card.weeks)
      .map(week => WEEK_OPTIONS.find(o => o.value === week).label));
    const days = card.days.length === 7
      ? `week${card.weeks.length > 1 ? 's' : ''}`
      : describeDays(card.days, true);
    text = `${weeks} ${days} of ${every(interval, 'month')}`;
  } else if (interval <= 1) {
    text = card.days.length ? describeDays(card.days) : 'No days picked';
  } else if (card.days.length === 7) {
    text = `Every day, ${every(interval, 'week')}`;
  } else {
    text = `${every(interval, 'week')} on ${describeDays(card.days, true)}`;
    text = text[0].toUpperCase() + text.slice(1);
  }
  return card.months && card.months.length ? `${text}, in ${describeMonths(card.months)}` : text;
}

const describeDates = ({ validFrom, validTo }) => {
  if (validFrom && validTo) return `${formatDate(validFrom)} to ${formatDate(validTo)}`;
  if (validFrom) return `From ${formatDate(validFrom)}`;
  if (validTo) return `Until ${formatDate(validTo)}`;
  return '';
};

const describeSkips = exdates =>
  (exdates.length ? `Skips ${joinWithAnd(exdates.map(date => formatDate(date, false)))}` : '');

// "Weekdays: 9AM to 1PM, 2PM to 5PM. From Dec 1, 2026. Skips Dec 24".
export function describeCard(card) {
  const ranges = card.ranges.map(formatRange).join(', ');
  return [`${describeRepeat(card)}: ${ranges}`, describeDates(card), describeSkips(card.exdates)]
    .filter(Boolean).join('. ');
}

// "Every December 25 (Christmas Day)", "Every 4th Thursday of November", "All of August,
// every year", "The last Friday of every month (Staff training)".
export function describeClosure(closure) {
  const month = closure.freq === 'YEARLY' ? MONTHS[Number(closure.month) - 1] : null;
  let text;
  if (closure.on === 'month') {
    text = `All of ${month}, every year`;
  } else if (closure.on === 'weekday') {
    const weeks = joinWithAnd(sortWeeks(closure.weeks)
      .map(week => WEEK_OPTIONS.find(o => o.value === week).label.toLowerCase()));
    text = month
      ? `Every ${weeks} ${closure.day} of ${month}`
      : `The ${weeks} ${closure.day} of every month`;
  } else {
    text = month
      ? `Every ${month} ${closure.monthDays.split(',').join(', ')}`
      : `The ${describeMonthDays(closure.monthDays)} of every month`;
  }
  const label = closure.description ? ` (${closure.description})` : '';
  return [`${text}${label}`, describeDates(closure), describeSkips(closure.exdates)]
    .filter(Boolean).join('. ');
}

// "Dec 25, 2026 (Christmas Day): Closed", "Dec 24 – Dec 26, 2026: 10AM to 2PM, 4PM to 6PM".
export function describeSpecialHours(entry) {
  const dates = entry.validTo && entry.validTo !== entry.validFrom
    ? `${formatDate(entry.validFrom, false)} – ${formatDate(entry.validTo)}`
    : formatDate(entry.validFrom);
  const label = entry.description ? ` (${entry.description})` : '';
  const hours = entry.closed
    ? 'Closed'
    : entry.hours
      .map(({ opensAt, closesAt }) => `${formatTime(opensAt)} to ${formatTime(closesAt)}`)
      .join(', ');
  return `${dates}${label}: ${hours}`;
}

// Why a card can't be saved yet: { message, canMerge } or null. canMerge says its ranges
// overlap or touch and mergeCardRanges would fix it.
export function getCardError(card) {
  const isMonthDays = card.freq === 'MONTHLY' && card.monthDays;
  if (card.freq === 'MONTHLY' && !card.monthDays && !card.weeks.length) {
    return { message: 'Pick which weeks of the month' };
  }
  if (isMonthDays && !/^-?\d{1,2}(,-?\d{1,2})*$/.test(card.monthDays)) {
    return { message: 'Days of the month look like 1,15 or -1 for the last day' };
  }
  if (!isMonthDays && !card.days.length) return { message: 'Pick at least one day' };
  if (card.ranges.some(range => !range.opensAt || !range.closesAt)) {
    return { message: 'Please enter From & To hours' };
  }
  if (card.ranges.some(range => range.opensAt === range.closesAt)) {
    return { message: 'A time range opens and closes at the same time' };
  }
  if (card.interval > 1 && !card.validFrom) {
    const unit = card.freq === 'MONTHLY' ? 'months' : 'weeks';
    return { message: `Pick a start date to count every ${card.interval} ${unit} from` };
  }
  if (card.validFrom && card.validTo && card.validTo < card.validFrom) {
    return { message: 'The end date is before the start date' };
  }
  const spans = card.ranges.map(span);
  const clash = spans.findIndex((range, i) => i > 0 && range.open <= spans[i - 1].close);
  if (clash > 0) {
    const [a, b] = [card.ranges[clash - 1], card.ranges[clash]];
    const verb = spans[clash].open === spans[clash - 1].close ? 'touch' : 'overlap';
    return {
      message:
        `${formatRange(a)} and ${formatRange(b)} ${verb}: make them one range, or leave a gap`,
      canMerge: true,
    };
  }
  return null;
}

export function getClosureError(closure) {
  if (closure.on === 'weekday' && !closure.weeks.length) return 'Pick which week of the month';
  if (closure.on === 'days' && !/^-?\d{1,2}(,-?\d{1,2})*$/.test(closure.monthDays)) {
    return 'Days of the month look like 25 or 24,25 or -1 for the last day';
  }
  if (closure.validFrom && closure.validTo && closure.validTo < closure.validFrom) {
    return 'The end date is before the start date';
  }
  return null;
}

export function isSpecialHoursValid(entry) {
  if (!entry.validFrom) return false;
  if (entry.validTo && entry.validTo < entry.validFrom) return false;
  return entry.closed ||
    (entry.hours.length > 0 &&
      entry.hours.every(({ opensAt, closesAt }) => !!opensAt && !!closesAt));
}

// Clashes between time ranges and special hours in the year from `today`, in words: "Sat: 9AM
// to 5PM and 1st Sat of every month: 4PM to 8PM overlap on Nov 7, 2026 (and 11 more dates)".
// While a card has an error of its own (such as two of its ranges overlapping) it shows that
// instead, so this waits until the cards are fixed.
export function describeConflicts(schedule, today = nyToday()) {
  const cards = groupAtoms(schedule.atoms);
  if (cards.some(getCardError)) return [];
  const rows = [
    ...cards.flatMap(card => card.atoms.map(atom => ({
      ...atomRow(atom), source: card, label: `${describeRepeat(card)}: ${formatRange(atom)}`,
    }))),
    ...(schedule.specialHours || []).flatMap(entry => specialRows(entry).map(row => ({
      ...row, source: entry, label: describeSpecialHours(entry),
    }))),
  ].map(toApiRow);
  return findConflicts(rows, today)
    .map(({
      type, rows: [a, b], first, count,
    }) => {
      const more = count > 1 ? ` (and ${count - 1} more date${count > 2 ? 's' : ''})` : '';
      const when = `${formatDate(first)}${more}`;
      if (type === 'closed-and-open') return `${when} is both closed and open in special hours`;
      return `${a.label} and ${b.label} ${type === 'touching' ? 'touch' : 'overlap'} on ${when}`;
    });
}
