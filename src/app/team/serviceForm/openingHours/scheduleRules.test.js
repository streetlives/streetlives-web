import {
  isOpenAt, intervalsOn, rowsOn, findConflicts,
} from './scheduleRules';
import { cases } from './schedule-cases.json';

// The cases the API's openAt search and yourpeer.nyc are tested against too.
describe('schedule cases', () => {
  cases.forEach(({ name, rows, checks }) => {
    describe(name, () => {
      checks.forEach(({ at, open }) => {
        it(`is ${open ? 'open' : 'closed'} at ${at}`, () => {
          const [date, time] = at.split('T');
          const [hours, minutes] = time.split(':').map(Number);
          expect(isOpenAt(rows, date, (hours * 60) + minutes)).toBe(open);
        });
      });
    });
  });
});

describe('intervalsOn', () => {
  it('gives overnight hours a close after midnight', () => {
    const rows = [{
      freq: 'WEEKLY', byday: 'FR', opens_at: '22:00', closes_at: '02:00',
    }];
    expect(intervalsOn(rows, '2026-11-06').map(({ open, close }) => [open, close]))
      .toEqual([[22 * 60, 26 * 60]]);
  });
});

describe('rowsOn', () => {
  const series = {
    freq: 'WEEKLY', byday: 'TH', opens_at: '09:00', closes_at: '17:00',
  };

  it('says when one-offs set the day', () => {
    const oneOff = { closed: true, valid_from: '2026-11-26' };
    expect(rowsOn([series, oneOff], '2026-11-26')).toEqual({ rows: [oneOff], override: true });
    expect(rowsOn([series, oneOff], '2026-11-19')).toEqual({ rows: [series], override: false });
  });

  it('lets a recurring closure set the day', () => {
    const thanksgiving = {
      closed: true, freq: 'YEARLY', bymonth: '11', byday: '4TH',
    };
    expect(rowsOn([series, thanksgiving], '2027-11-25'))
      .toEqual({ rows: [thanksgiving], override: true });
  });
});

describe('findConflicts', () => {
  const saturdays = {
    freq: 'WEEKLY', byday: 'SA', weekday: 6, opens_at: '09:00', closes_at: '13:00',
  };
  const summary = conflicts => conflicts.map(({ type, first }) => [type, first]);

  it('finds ranges that touch, which should be one range', () => {
    const afternoons = { ...saturdays, opens_at: '13:00', closes_at: '17:00' };
    expect(summary(findConflicts([saturdays, afternoons], '2026-11-01', 7)))
      .toEqual([['touching', '2026-11-07']]);
  });

  it('accepts a lunch break', () => {
    const afternoons = { ...saturdays, opens_at: '14:00', closes_at: '17:00' };
    expect(findConflicts([saturdays, afternoons], '2026-11-01')).toEqual([]);
  });

  it('finds a monthly range overlapping a weekly one, with how often it happens', () => {
    const [conflict] = findConflicts([
      saturdays,
      {
        ...saturdays, freq: 'MONTHLY', byday: '1SA', opens_at: '12:00', closes_at: '15:00',
      },
    ], '2026-11-01', 365);
    expect(conflict).toMatchObject({ type: 'overlapping', first: '2026-11-07', count: 12 });
  });

  it('finds overnight hours running into the next morning', () => {
    expect(summary(findConflicts([
      {
        freq: 'WEEKLY', byday: 'FR', weekday: 5, opens_at: '22:00', closes_at: '02:00',
      },
      { ...saturdays, opens_at: '01:00', closes_at: '05:00' },
    ], '2026-11-01', 7))).toEqual([['overlapping', '2026-11-07']]);
  });

  it('finds ranges that touch at midnight, which should be one overnight range', () => {
    expect(summary(findConflicts([
      { ...saturdays, opens_at: '22:00', closes_at: '00:00' },
      {
        freq: 'WEEKLY', byday: 'SU', weekday: 7, opens_at: '00:00', closes_at: '06:00',
      },
    ], '2026-11-01', 7))).toEqual([['touching', '2026-11-01']]);
  });

  it('accepts whole days one after another', () => {
    expect(findConflicts([{
      freq: 'WEEKLY', byday: 'MO,TU', opens_at: '00:00', closes_at: '00:00',
    }], '2026-11-01', 14)).toEqual([]);
  });

  it('accepts overnight hours split at midnight the old way', () => {
    expect(findConflicts([
      {
        freq: 'WEEKLY', byday: 'MO', weekday: 1, opens_at: '21:00', closes_at: '23:59',
      },
      {
        freq: 'WEEKLY', byday: 'TU', weekday: 2, opens_at: '00:00', closes_at: '06:00',
      },
    ], '2026-11-01', 14)).toEqual([]);
  });

  it('finds a date that one-offs make both closed and open', () => {
    expect(summary(findConflicts([
      { closed: true, valid_from: '2026-12-24', valid_to: '2026-12-26' },
      { valid_from: '2026-12-25', opens_at: '10:00', closes_at: '14:00' },
    ], '2026-12-01', 31))).toEqual([['closed-and-open', '2026-12-25']]);
  });
});
