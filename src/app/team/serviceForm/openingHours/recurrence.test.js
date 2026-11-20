import {
  applySchedule, readSchedule, newAtom, newClosure, groupAtoms, setCardDays, addRange,
  updateRange, removeRangeOnDay, updateCard, mergeCardRanges, describeCard,
  describeRepeat, describeClosure, describeWeeks, describeSpecialHours, getCardError,
  getClosureError, describeConflicts, EMPTY_SCHEDULE, getCardErrors, setDayRanges, plainCardOn,
  dayCardOn, fillWeek, describeClosureWhen, upcomingClosureDates,
  describeSchedule, upcomingDates, skipCardDate, nextRange, copyDay,
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

  it('only accepts days of the month that exist', () => {
    const card = monthDays => groupAtoms([newAtom({ freq: 'MONTHLY', monthDays })])[0];
    ['0', '32', '-99'].forEach((monthDays) => {
      expect(getCardError(card(monthDays)))
        .toEqual({
          field: 'monthDays',
          message: 'Days of the month look like 1,15 or -1 for the last day',
        });
    });
    expect(getCardError(card('1,15,-1'))).toBeNull();
  });

  it('merges ranges that touch', () => {
    const touching = atoms(['Saturday'], [['09:00', '13:00'], ['13:00', '17:00']]);
    const [card] = groupAtoms(touching);
    expect(getCardError(card)).toEqual({
      field: 'ranges',
      message: '9AM to 1PM and 1PM to 5PM touch: make them one range, or leave a gap',
      canMerge: true,
    });
    expect(summary(mergeCardRanges(touching, card))).toEqual(['Sat: 9AM to 5PM']);
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

  it('keeps an older closure limited to one weekday to that weekday', () => {
    const saturdaysInDecember = {
      closed: true, weekday: 'Saturday', validFrom: '2026-12-01', validTo: '2026-12-31',
    };
    const schedule = read([saturdaysInDecember]);
    expect(schedule.specialHours.map(describeSpecialHours))
      .toEqual(['Dec 1 – Dec 31, 2026: Closed on Saturdays']);
    expect(applySchedule(schedule)).toEqual([{ ...saturdaysInDecember, description: null }]);
    expect(describeConflicts({
      ...schedule,
      specialHours: [...schedule.specialHours, {
        validFrom: '2026-12-02',
        validTo: '',
        closed: false,
        hours: [{ opensAt: '10:00', closesAt: '14:00' }],
        description: '',
      }],
    }, TODAY)).toEqual([]);
  });

  it('leaves out past special hours that have no end date', () => {
    const schedule = read([
      { closed: true, validFrom: '2026-10-12' },
      { validFrom: '2026-10-31', opensAt: '10:00', closesAt: '14:00' },
      { validFrom: TODAY, opensAt: '10:00', closesAt: '14:00' },
    ]);
    expect(schedule.specialHours.map(entry => entry.validFrom)).toEqual([TODAY]);
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
    ['Dec 25', '0', '32', '-99', '25,40'].forEach((monthDays) => {
      expect(getClosureError(newClosure({ monthDays })))
        .toBe('Days of the month look like 25 or 24,25 or -1 for the last day');
    });
    expect(getClosureError(newClosure({ monthDays: '24,25,-1' }))).toBeNull();
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

describe('setDayRanges', () => {
  const nineToFive = [{ opensAt: '09:00', closesAt: '17:00', description: '' }];
  const week = atoms(WEEKDAYS, [['09:00', '17:00']]);

  it('gives a day whose hours change its own card', () => {
    const changed = setDayRanges(week, 'Wednesday', [{ opensAt: '10:00', closesAt: '14:00' }]);
    expect(summary(changed)).toEqual(['Mon, Tue, Thu, and Fri: 9AM to 5PM', 'Wed: 10AM to 2PM']);
  });

  it('joins the card with the same hours when they match again', () => {
    const changed = setDayRanges(week, 'Wednesday', [{ opensAt: '10:00', closesAt: '14:00' }]);
    expect(summary(setDayRanges(changed, 'Wednesday', nineToFive)))
      .toEqual(['Weekdays: 9AM to 5PM']);
    expect(summary(setDayRanges(week, 'Saturday', nineToFive)))
      .toEqual(['Mon, Tue, Wed, Thu, Fri, and Sat: 9AM to 5PM']);
  });

  it('closes a day with no ranges', () => {
    expect(summary(setDayRanges(week, 'Friday', [])))
      .toEqual(['Mon, Tue, Wed, and Thu: 9AM to 5PM']);
  });

  it('keeps the skipped dates of the day\'s card', () => {
    const [card] = groupAtoms(week);
    const skipping = skipCardDate(week, card, '2026-11-11');
    const changed = setDayRanges(skipping, 'Wednesday', [{ opensAt: '10:00', closesAt: '14:00' }]);
    expect(plainCardOn(groupAtoms(changed), 'Wednesday').exdates).toEqual(['2026-11-11']);
  });

  it('keeps how a day repeats when its hours change', () => {
    const seasonal = atoms(['Monday', 'Tuesday'], [['09:00', '17:00']], { months: ['6', '7'] });
    const changed = setDayRanges(seasonal, 'Monday', [{ opensAt: '10:00', closesAt: '14:00' }]);
    expect(summary(changed)).toEqual([
      'Mon, in Jun and Jul: 10AM to 2PM',
      'Tue, in Jun and Jul: 9AM to 5PM',
    ]);
  });

  it('edits the weekly hours of a day that also has a pattern', () => {
    const firstSaturday = atoms(['Saturday'], [['18:00', '20:00']], {
      freq: 'MONTHLY', weeks: ['1'],
    });
    const saturdays = [...atoms(['Saturday'], [['09:00', '12:00']]), ...firstSaturday];
    const changed = setDayRanges(saturdays, 'Saturday', nineToFive);
    expect(summary(changed)).toEqual([
      'Sat: 9AM to 5PM',
      '1st Sat of every month: 6PM to 8PM',
    ]);
  });
});

describe('dayCardOn', () => {
  it('stays on a day whose repeat settings change', () => {
    const week = atoms(WEEKDAYS, [['09:00', '17:00']]);
    const [card] = groupAtoms(week);
    [
      { months: ['6'] },
      { interval: 2, validFrom: '2026-11-02' },
      { validTo: '2026-12-31' },
      { freq: 'MONTHLY', weeks: ['1'] },
    ].forEach((changes) => {
      const cards = groupAtoms(updateCard(week, card, changes));
      WEEKDAYS.forEach(day => expect(dayCardOn(cards, day).ranges).toEqual(card.ranges));
    });
  });
});

describe('fillWeek', () => {
  it('replaces the hours on every weekday, patterns included', () => {
    const week = [
      ...atoms(['Monday'], [['10:00', '14:00']], { interval: 2, validFrom: '2026-11-02' }),
      ...atoms(['Saturday'], [['10:00', '14:00']], { freq: 'MONTHLY', weeks: ['1'] }),
    ];
    expect(summary(fillWeek(week, WEEKDAYS, [{ opensAt: '09:00', closesAt: '17:00' }])))
      .toEqual(['Weekdays: 9AM to 5PM']);
    expect(fillWeek(week, [], [])).toEqual([]);
  });
});

describe('getCardErrors', () => {
  it('lists every problem with the field to fix', () => {
    const [card] = groupAtoms([newAtom({
      freq: 'MONTHLY', interval: 2, opensAt: '09:00', closesAt: '13:00',
    }), newAtom({
      freq: 'MONTHLY', interval: 2, opensAt: '12:00', closesAt: '17:00',
    })]);
    expect(getCardErrors(card).map(({ field }) => field))
      .toEqual(['weeks', 'days', 'validFrom', 'ranges']);
    expect(getCardError(card).field).toBe('weeks');
  });
});

describe('describeSchedule', () => {
  it('sums the schedule up in one line', () => {
    expect(describeSchedule({
      atoms: [
        ...atoms(WEEKDAYS, [['09:00', '17:00']]),
        ...atoms(['Saturday'], [['10:00', '14:00']], { freq: 'MONTHLY', weeks: ['1', '3'] }),
      ],
      closures: [newClosure({
        description: 'Thanksgiving', on: 'weekday', month: '11', weeks: ['4'],
      })],
      specialHours: [{ ...christmas, description: '' }],
    })).toBe('Open Weekdays 9AM–5PM and 1st and 3rd Sat of every month 10AM–2PM · ' +
      'Closed Thanksgiving · Special hours Dec 25');
  });

  it('says when there are no regular hours', () => {
    expect(describeSchedule(EMPTY_SCHEDULE)).toBe('No regular hours');
  });
});

describe('upcomingDates', () => {
  it('lists the next dates a card falls on, with the ones it skips', () => {
    const [card] = groupAtoms(atoms(['Saturday'], [['10:00', '14:00']], {
      freq: 'MONTHLY', weeks: ['1', '3'], exdates: ['2026-11-21'],
    }));
    expect(upcomingDates(card, TODAY)).toEqual([
      { date: '2026-11-07', skipped: false },
      { date: '2026-11-21', skipped: true },
      { date: '2026-12-05', skipped: false },
      { date: '2026-12-19', skipped: false },
    ]);
  });
});

describe('describeClosureWhen', () => {
  it('says when a closure falls, without its name', () => {
    expect(describeClosureWhen(newClosure({
      description: 'Christmas', validFrom: '2026-12-01',
    }))).toBe('Every December 25. From Dec 1, 2026');
  });
});

describe('upcomingClosureDates', () => {
  it('lists the next dates a closure falls on', () => {
    const thanksgiving = newClosure({
      on: 'weekday', month: '11', weeks: ['4'], day: 'Thursday',
    });
    expect(upcomingClosureDates(thanksgiving, TODAY))
      .toEqual(['2026-11-26', '2027-11-25', '2028-11-23']);
  });

  it('leaves out the dates it is open anyway', () => {
    expect(upcomingClosureDates(newClosure({ exdates: ['2026-12-25'] }), TODAY))
      .toEqual(['2027-12-25', '2028-12-25', '2029-12-25']);
  });

  it('counts a closed month once', () => {
    expect(upcomingClosureDates(newClosure({ on: 'month', month: '8' }), TODAY))
      .toEqual(['2027-08-01', '2028-08-01', '2029-08-01']);
  });

  it('stops at the date it ends', () => {
    expect(upcomingClosureDates(newClosure({ validTo: '2027-12-31' }), TODAY))
      .toEqual(['2026-12-25', '2027-12-25']);
  });
});

describe('nextRange', () => {
  const range = (opensAt, closesAt) => ({ opensAt, closesAt, description: '' });

  it('starts with 9 to 5', () => {
    expect(nextRange([])).toEqual(range('09:00', '17:00'));
  });

  it('runs two hours, starting an hour after the last range closes', () => {
    expect(nextRange([range('09:00', '12:00')])).toEqual(range('13:00', '15:00'));
    expect(nextRange([range('07:00', '09:30'), range('09:00', '17:00')]))
      .toEqual(range('18:00', '20:00'));
  });

  it('is left empty when it would run past midnight, or the last range is unfinished', () => {
    expect(nextRange([range('18:00', '22:00')])).toEqual(range('', ''));
    expect(nextRange([range('20:00', '02:00')])).toEqual(range('', ''));
    expect(nextRange([range('09:00', '')])).toEqual(range('', ''));
  });
});

describe('copyDay', () => {
  it('copies how a day repeats along with its hours, but not its skipped dates', () => {
    const week = [
      ...atoms(['Monday'], [['09:00', '17:00']], {
        freq: 'MONTHLY', weeks: ['1'], exdates: ['2026-12-07'],
      }),
      ...atoms(['Tuesday', 'Wednesday'], [['09:00', '17:00']]),
    ];
    expect(summary(copyDay(week, 'Monday', ['Tuesday', 'Thursday']))).toEqual([
      '1st Mon of every month: 9AM to 5PM. Skips Dec 7',
      '1st Tue and Thu of every month: 9AM to 5PM',
      'Wed: 9AM to 5PM',
    ]);
  });

  it('makes a day weekly again when copying weekly hours to it', () => {
    const week = [
      ...atoms(['Monday'], [['09:00', '17:00']], { freq: 'MONTHLY', weeks: ['1'] }),
      ...atoms(['Tuesday'], [['10:00', '14:00']]),
    ];
    expect(summary(copyDay(week, 'Tuesday', ['Monday']))).toEqual(['Mon and Tue: 10AM to 2PM']);
  });
});
