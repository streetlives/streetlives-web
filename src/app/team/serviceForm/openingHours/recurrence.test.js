import moment from 'moment';
import {
  applyRecurrence, readRecurrence, describeRecurrence, EMPTY_RECURRENCE,
} from './recurrence';

const today = moment('2026-10-19');
const fridayHours = [{ weekday: 'Friday', opensAt: '09:00', closesAt: '17:00' }];

describe('applyRecurrence', () => {
  it('marks plain weekly hours with HSDS WEEKLY and a bare BYDAY', () => {
    expect(applyRecurrence(fridayHours, EMPTY_RECURRENCE, today)).toEqual([{
      ...fridayHours[0], freq: 'WEEKLY', byday: 'FR', validFrom: null, validTo: null,
    }]);
  });

  it('stores "every 2nd Friday" as MONTHLY with BYDAY=2FR', () => {
    const [row] = applyRecurrence(fridayHours, { ...EMPTY_RECURRENCE, ordinal: '2' }, today);
    expect(row).toMatchObject({ freq: 'MONTHLY', byday: '2FR' });
  });

  it('stores "the last Monday" as BYDAY=-1MO', () => {
    const [row] = applyRecurrence(
      [{ weekday: 'Monday', opensAt: '09:00', closesAt: '17:00' }],
      { ...EMPTY_RECURRENCE, ordinal: '-1' },
      today,
    );
    expect(row.byday).toBe('-1MO');
  });

  it('adds a closed row for the next occurrence of each excluded month', () => {
    const recurrence = { ...EMPTY_RECURRENCE, closedMonths: [1, 11] };
    const rows = applyRecurrence(fridayHours, recurrence, today);
    expect(rows.slice(1)).toEqual([
      { closed: true, validFrom: '2027-02-01', validTo: '2027-02-28' },
      { closed: true, validFrom: '2026-12-01', validTo: '2026-12-31' },
    ]);
  });
});

describe('readRecurrence', () => {
  it('round-trips what applyRecurrence wrote', () => {
    const recurrence = {
      ordinal: '2', validFrom: '2026-03-27', validTo: '2026-07-27', closedMonths: [11],
    };
    expect(readRecurrence(applyRecurrence(fridayHours, recurrence, today))).toEqual(recurrence);
  });

  it('does not treat a whole-service closure as a month exception', () => {
    expect(readRecurrence([{ closed: true }]).closedMonths).toEqual([]);
  });
});

describe('describeRecurrence', () => {
  it('summarizes the settings', () => {
    expect(describeRecurrence({
      ordinal: '2', validFrom: '', validTo: '2026-07-27', closedMonths: [11],
    })).toBe('Only the 2nd of those days each month, until Jul 27, 2026, closed in December');
  });

  it('is empty for plain weekly hours', () => {
    expect(describeRecurrence(EMPTY_RECURRENCE)).toBe('');
  });
});
