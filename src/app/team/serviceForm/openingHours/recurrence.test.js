import {
  applySchedule, readSchedule, newAtom, newClosure, groupAtoms, setCardDays, addRange,
  updateRange, removeRangeOnDay, updateCard, splitCard, mergeCardRanges, describeCard,
  describeRepeat, describeClosure, describeWeeks, describeSpecialHours, getCardError,
  getClosureError, describeConflicts, EMPTY_SCHEDULE,
} from './recurrence';
import { DAYS } from '../../../../Constants';

const TODAY = '2026-11-01';
const WEEKDAYS = DAYS.slice(0, 5);
const christmas = {
  validFrom: '2026-12-25',
  validTo: '',
  closed: true,
  hours: [],
  description: 'Christmas Day',
};
const atoms = (days, ranges, settings = {}) => days.flatMap(day => ranges
  .map(([opensAt, closesAt]) => newAtom({
    ...settings, day, opensAt, closesAt,
  })));
const summary = list => groupAtoms(list).map(card => describeCard(card));
const save = list => applySchedule({ ...EMPTY_SCHEDULE, atoms: list });
const read = rows => readSchedule(rows, TODAY);

describe('groupAtoms', () => {
  const lunchBreak = atoms(WEEKDAYS, [['09:00', '13:00'], ['14:00', '17:00']]);

  it('puts days with the same ranges on one card', () => {
    expect(summary(lunchBreak)).toEqual(['Weekdays: 9AM to 1PM, 2PM to 5PM']);
  });

  it('gives a day its own card once its ranges differ, and joins it again when they match', () => {
    const [card] = groupAtoms(lunchBreak);
    const fridayMorningOnly = removeRangeOnDay(lunchBreak, card, 1, 'Friday');
    expect(summary(fridayMorningOnly)).toEqual([
      'Mon, Tue, Wed, and Thu: 9AM to 1PM, 2PM to 5PM',
      'Fri: 9AM to 1PM',
    ]);

    const fridayCard = groupAtoms(fridayMorningOnly)[1];
    const withAfternoon = addRange(fridayMorningOnly, fridayCard);
    const newRange = groupAtoms(withAfternoon)[1];
    const aligned = updateRange(withAfternoon, newRange, 1, {
      opensAt: '14:00', closesAt: '17:00',
    });
    expect(summary(aligned)).toEqual(['Weekdays: 9AM to 1PM, 2PM to 5PM']);
  });

  it('splits a range off when only it gets an end date, and joins it back without', () => {
    const [card] = groupAtoms(lunchBreak);
    const afternoons = groupAtoms(lunchBreak).flatMap(c => c.atoms)
      .filter(atom => atom.opensAt === '14:00');
    const ended = [
      ...lunchBreak.filter(atom => !afternoons.includes(atom)),
      ...afternoons.map(atom => ({ ...atom, validTo: '2026-11-30' })),
    ];
    expect(summary(ended)).toEqual([
      'Weekdays: 9AM to 1PM',
      'Weekdays: 2PM to 5PM. Until Nov 30, 2026',
    ]);
    const endedCard = groupAtoms(ended)[1];
    expect(summary(updateCard(ended, endedCard, { validTo: '' }))).toEqual(summary(card.atoms));
  });

  it('sets the days of a card', () => {
    const [card] = groupAtoms(atoms(['Monday'], [['09:00', '17:00']]));
    expect(summary(setCardDays(card.atoms, card, ['Monday', 'Saturday', 'Sunday'])))
      .toEqual(['Mon, Sat, and Sun: 9AM to 5PM']);
  });

  it('merges ranges that touch', () => {
    const touching = atoms(['Saturday'], [['09:00', '13:00'], ['13:00', '17:00']]);
    const [card] = groupAtoms(touching);
    expect(getCardError(card)).toEqual({
      message: '9AM to 1PM and 1PM to 5PM touch: make them one range, or leave a gap',
      canMerge: true,
    });
    expect(summary(mergeCardRanges(touching, card))).toEqual(['Sat: 9AM to 5PM']);
  });

  it('splits a card from a date on', () => {
    const [card] = groupAtoms(atoms(['Saturday'], [['09:00', '17:00']], {
      exdates: ['2026-12-19'],
    }));
    const split = splitCard(card.atoms, card, '2026-12-01');
    expect(summary(updateCard(split, groupAtoms(split)[1], { closesAt: '14:00' }))).toEqual([
      'Sat: 9AM to 5PM. Until Nov 30, 2026',
      'Sat: 9AM to 2PM. From Dec 1, 2026. Skips Dec 19',
    ]);
  });
});

describe('applySchedule and readSchedule', () => {
  it('saves one row per day and range', () => {
    expect(save(atoms(['Monday'], [['09:00', '13:00'], ['14:00', '17:00']]))).toEqual([
      {
        closed: false,
        opensAt: '09:00',
        closesAt: '13:00',
        freq: 'WEEKLY',
        weekday: 'Monday',
        byday: 'MO',
      },
      {
        closed: false,
        opensAt: '14:00',
        closesAt: '17:00',
        freq: 'WEEKLY',
        weekday: 'Monday',
        byday: 'MO',
      },
    ]);
  });

  it('round-trips repeating hours, closures and special hours', () => {
    const schedule = {
      atoms: [
        ...atoms(WEEKDAYS, [['09:00', '13:00'], ['14:00', '17:00']]),
        ...atoms(['Saturday'], [['10:00', '12:00']], {
          freq: 'MONTHLY', weeks: ['1', '3'], months: ['6', '7', '8'], exdates: ['2027-06-05'],
        }),
        ...atoms(['Sunday'], [['09:00', '17:00']], { interval: 2, validFrom: '2021-10-31' }),
        newAtom({ freq: 'MONTHLY', monthDays: '15', validTo: '2027-06-30' }),
        ...atoms(['Friday'], [['22:00', '02:00']]),
      ],
      closures: [
        newClosure({ description: 'Christmas Day' }),
        newClosure({
          month: '11', on: 'weekday', weeks: ['4'], day: 'Thursday', description: 'Thanksgiving',
        }),
        newClosure({ month: '8', on: 'month' }),
        newClosure({
          freq: 'MONTHLY', on: 'weekday', weeks: ['-1'], day: 'Friday', exdates: ['2026-12-25'],
        }),
      ],
      specialHours: [christmas],
    };
    const reread = read(save(schedule.atoms).concat(applySchedule({ ...schedule, atoms: [] })));
    expect(summary(reread.atoms)).toEqual(summary(schedule.atoms));
    expect(reread.closures).toEqual(schedule.closures);
    expect(reread.specialHours).toEqual(schedule.specialHours);
  });

  it('saves closures as closed rows with a repeat rule', () => {
    expect(applySchedule({
      atoms: [],
      closures: [
        newClosure({
          month: '11', on: 'weekday', weeks: ['4'], day: 'Thursday',
        }),
        newClosure({ month: '8', on: 'month' }),
      ],
    })).toEqual([
      {
        closed: true, freq: 'YEARLY', bymonth: '11', byday: '4TH',
      },
      {
        closed: true,
        freq: 'YEARLY',
        bymonth: '8',
        bymonthday: Array.from({ length: 31 }, (_, i) => i + 1).join(','),
      },
    ]);
  });

  it('joins overnight hours that were split at midnight', () => {
    expect(summary(read([
      { weekday: 'Monday', opensAt: '21:00', closesAt: '23:59' },
      { weekday: 'Tuesday', opensAt: '00:00', closesAt: '06:00' },
      ...DAYS.map(weekday => ({
        weekday, opensAt: '00:00', closesAt: '23:59', validTo: '2027-01-01',
      })),
    ]).atoms)).toEqual([
      'Every day: 12AM to 11:59PM. Until Jan 1, 2027',
      'Mon: 9PM to 6AM (next day)',
    ]);
  });

  it('leaves out what ended before today, and skipped dates that have passed', () => {
    const schedule = read([
      {
        weekday: 'Monday', opensAt: '09:00', closesAt: '17:00', validTo: '2026-10-31',
      },
      {
        weekday: 'Tuesday',
        opensAt: '09:00',
        closesAt: '17:00',
        exdates: ['2026-10-27', '2026-11-03'],
      },
      { closed: true, validFrom: '2026-10-12', validTo: '2026-10-12' },
      { ...christmas, validTo: christmas.validFrom },
      {
        closed: true, freq: 'YEARLY', bymonth: '12', bymonthday: '25', validTo: '2025-12-31',
      },
    ]);
    expect(summary(schedule.atoms)).toEqual(['Tue: 9AM to 5PM. Skips Nov 3']);
    expect(schedule.specialHours.map(describeSpecialHours))
      .toEqual(['Dec 25, 2026 (Christmas Day): Closed']);
    expect(schedule.closures).toEqual([]);
  });

  it('does not treat a whole-service closure as hours, closures or special hours', () => {
    expect(read([{ closed: true }])).toEqual(EMPTY_SCHEDULE);
  });
});

describe('describeRepeat', () => {
  it('names the cadence', () => {
    const [weekly] = groupAtoms(atoms(WEEKDAYS, [['09:00', '17:00']]));
    expect(describeRepeat(weekly)).toBe('Weekdays');
    const [biweekly] = groupAtoms(atoms(['Sunday'], [['09:00', '17:00']], { interval: 2 }));
    expect(describeRepeat(biweekly)).toBe('Every other week on Sun');
    const [monthly] = groupAtoms(atoms(['Saturday'], [['09:00', '17:00']], {
      freq: 'MONTHLY', weeks: ['1', '3'],
    }));
    expect(describeRepeat(monthly)).toBe('1st and 3rd Sat of every month');
    const [summer] = groupAtoms(atoms(['Saturday'], [['09:00', '17:00']], {
      months: ['6', '7', '8'],
    }));
    expect(describeRepeat(summer)).toBe('Sat, in Jun, Jul, and Aug');
  });
});

describe('describeClosure', () => {
  it('names the closure', () => {
    expect(describeClosure(newClosure({ description: 'Christmas Day' })))
      .toBe('Every December 25 (Christmas Day)');
    expect(describeClosure(newClosure({
      month: '11', on: 'weekday', weeks: ['4'], day: 'Thursday',
    }))).toBe('Every 4th Thursday of November');
    expect(describeClosure(newClosure({ month: '8', on: 'month' })))
      .toBe('All of August, every year');
    expect(describeClosure(newClosure({
      freq: 'MONTHLY', on: 'weekday', weeks: ['-1'], day: 'Friday', exdates: ['2026-12-25'],
    }))).toBe('The last Friday of every month. Skips Dec 25');
  });

  it('checks the days', () => {
    expect(getClosureError(newClosure({ monthDays: 'Dec 25' })))
      .toBe('Days of the month look like 25 or 24,25 or -1 for the last day');
    expect(getClosureError(newClosure())).toBeNull();
  });
});

describe('describeConflicts', () => {
  it('finds hours on different cards that overlap', () => {
    expect(describeConflicts({
      ...EMPTY_SCHEDULE,
      atoms: [
        ...atoms(['Saturday'], [['09:00', '17:00']]),
        ...atoms(['Saturday'], [['16:00', '20:00']], { freq: 'MONTHLY', weeks: ['1'] }),
      ],
    }, TODAY)).toEqual([
      'Sat: 9AM to 5PM and 1st Sat of every month: 4PM to 8PM overlap on Nov 7, 2026'
        + ' (and 11 more dates)',
    ]);
  });

  it('finds overnight hours running into the next morning', () => {
    expect(describeConflicts({
      ...EMPTY_SCHEDULE,
      atoms: atoms(['Friday', 'Saturday'], [['01:00', '05:00'], ['22:00', '02:00']]),
    }, TODAY)).toHaveLength(1);
  });

  it('accepts a lunch break and a closure', () => {
    expect(describeConflicts({
      atoms: atoms(WEEKDAYS, [['09:00', '13:00'], ['14:00', '17:00']]),
      closures: [newClosure()],
      specialHours: [christmas],
    }, TODAY)).toEqual([]);
  });
});

describe('describeWeeks', () => {
  it('names the weeks', () => {
    expect(describeWeeks('Friday', ['2', '1'])).toBe('1st and 2nd Fridays of the month');
    expect(describeWeeks('Monday', ['-1'])).toBe('Last Monday of the month');
  });
});
