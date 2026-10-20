import moment from 'moment';
import {
  applySchedule, readSchedule, describeWeeks, describeSpecialHours, upcomingHolidays,
  EMPTY_SCHEDULE,
} from './recurrence';

const fridayHours = [{ weekday: 'Friday', opensAt: '09:00', closesAt: '17:00' }];
const christmas = {
  validFrom: '2026-12-25',
  validTo: '',
  closed: true,
  opensAt: null,
  closesAt: null,
  description: 'Christmas Day',
};

describe('applySchedule', () => {
  it('marks plain weekly hours with HSDS WEEKLY and a bare BYDAY', () => {
    expect(applySchedule(fridayHours, EMPTY_SCHEDULE)).toEqual([{
      ...fridayHours[0], freq: 'WEEKLY', byday: 'FR', validFrom: null, validTo: null,
    }]);
  });

  it('stores "the first two Fridays of the month" as MONTHLY with BYDAY=1FR,2FR', () => {
    const schedule = { ...EMPTY_SCHEDULE, weekPatterns: { Friday: ['1', '2'] } };
    const [row] = applySchedule(fridayHours, schedule);
    expect(row).toMatchObject({ freq: 'MONTHLY', byday: '1FR,2FR' });
  });

  it('stores "the last Monday" as BYDAY=-1MO', () => {
    const [row] = applySchedule(
      [{ weekday: 'Monday', opensAt: '09:00', closesAt: '17:00' }],
      { ...EMPTY_SCHEDULE, weekPatterns: { Monday: ['-1'] } },
    );
    expect(row.byday).toBe('-1MO');
  });

  it('adds the season to the regular rows', () => {
    const schedule = { ...EMPTY_SCHEDULE, validFrom: '2026-03-27', validTo: '2026-07-27' };
    expect(applySchedule(fridayHours, schedule)[0])
      .toMatchObject({ validFrom: '2026-03-27', validTo: '2026-07-27' });
  });

  it('ignores weeks and season when withRecurrence is off (24/7)', () => {
    const schedule = {
      ...EMPTY_SCHEDULE, weekPatterns: { Friday: ['1'] }, validFrom: '2026-03-27',
    };
    expect(applySchedule(fridayHours, schedule, { withRecurrence: false })[0])
      .toMatchObject({ freq: 'WEEKLY', byday: 'FR', validFrom: null });
  });

  it('stores special hours as dated rows without a weekday', () => {
    const schedule = {
      ...EMPTY_SCHEDULE,
      specialHours: [
        christmas,
        {
          validFrom: '2026-12-31',
          validTo: '',
          closed: false,
          opensAt: '10:00',
          closesAt: '14:00',
          description: '',
        },
      ],
    };
    expect(applySchedule([], schedule)).toEqual([
      {
        closed: true, validFrom: '2026-12-25', validTo: '2026-12-25', description: 'Christmas Day',
      },
      {
        closed: false,
        opensAt: '10:00',
        closesAt: '14:00',
        validFrom: '2026-12-31',
        validTo: '2026-12-31',
        description: null,
      },
    ]);
  });
});

describe('readSchedule', () => {
  it('round-trips what applySchedule wrote', () => {
    const schedule = {
      weekPatterns: { Friday: ['1', '2'] },
      validFrom: '2026-03-27',
      validTo: '2026-07-27',
      specialHours: [christmas],
    };
    expect(readSchedule(applySchedule(fridayHours, schedule))).toEqual(schedule);
  });

  it('reads an earlier closed-month row as special hours', () => {
    const [entry] = readSchedule([{ closed: true, validFrom: '2026-12-01', validTo: '2026-12-31' }])
      .specialHours;
    expect(entry).toMatchObject({ validFrom: '2026-12-01', validTo: '2026-12-31', closed: true });
  });

  it('does not treat a whole-service closure as special hours', () => {
    expect(readSchedule([{ closed: true }]).specialHours).toEqual([]);
  });
});

describe('describeWeeks', () => {
  it('names the weeks', () => {
    expect(describeWeeks('Friday', ['2', '1'])).toBe('1st and 2nd Fridays of the month');
    expect(describeWeeks('Monday', ['-1'])).toBe('Last Monday of the month');
    expect(describeWeeks('Monday', [])).toBe('Every Monday');
  });
});

describe('describeSpecialHours', () => {
  it('describes a closed holiday and a range with hours', () => {
    expect(describeSpecialHours(christmas)).toBe('Dec 25, 2026 (Christmas Day): Closed');
    expect(describeSpecialHours({
      validFrom: '2026-12-24',
      validTo: '2026-12-26',
      closed: false,
      opensAt: '10:00',
      closesAt: '14:30',
    })).toBe('Dec 24 – Dec 26, 2026: 10AM to 2:30PM');
  });
});

describe('upcomingHolidays', () => {
  it('lists US holidays in the next 120 days, across the new year', () => {
    const holidays = upcomingHolidays(moment('2026-10-20'));
    expect(holidays.map(({ date }) => date)).toEqual([
      '2026-11-11', '2026-11-26', '2026-12-24', '2026-12-25', '2026-12-31',
      '2027-01-01', '2027-01-18', '2027-02-15',
    ]);
  });
});
