import locationsReducer from './locations';
import { OPTIMISTIC_UPDATE_SERVICE } from '../actions';
import { getIrregularOpeningHours } from '../selectors/service';
import {
  applySchedule, readSchedule, newAtom, newClosure,
} from '../app/team/serviceForm/openingHours/recurrence';

// What GoGetta saves for "1st and 2nd Fridays 9-5, closed every Thanksgiving, Christmas closed,
// New Year's Eve 10-12 and 1-3", applied as an optimistic update and read back by the editor.
describe('optimistic update of HSDS schedule fields', () => {
  const props = { match: { params: { locationId: 'loc', serviceId: 'svc' } } };
  const schedule = {
    atoms: [newAtom({
      day: 'Friday',
      opensAt: '09:00',
      closesAt: '17:00',
      description: 'Line up early.',
      freq: 'MONTHLY',
      weeks: ['1', '2'],
    })],
    closures: [newClosure({
      month: '11', on: 'weekday', weeks: ['4'], day: 'Thursday', description: 'Thanksgiving',
    })],
    specialHours: [
      {
        validFrom: '2026-12-25', validTo: '', closed: true, hours: [], description: 'Christmas Day',
      },
      {
        validFrom: '2026-12-31',
        validTo: '',
        closed: false,
        hours: [{ opensAt: '10:00', closesAt: '12:00' }, { opensAt: '13:00', closesAt: '15:00' }],
        description: '',
      },
    ],
  };
  const irregularHours = applySchedule(schedule);

  const state = {
    locations: locationsReducer(
      {
        loc: {
          id: 'loc',
          metadata: {},
          Services: [{ id: 'svc', metadata: {}, HolidaySchedules: [] }],
        },
      },
      {
        type: OPTIMISTIC_UPDATE_SERVICE,
        payload: {
          locationId: 'loc',
          serviceId: 'svc',
          metaDataSection: 'service',
          fieldName: 'irregularHours',
          params: { irregularHours },
        },
      },
    ),
  };

  it('stores the rows the way the API returns them', () => {
    const rows = state.locations.loc.Services[0].HolidaySchedules;
    expect(rows[0]).toMatchObject({
      weekday: 5, opens_at: '09:00:00', closes_at: '17:00:00', freq: 'MONTHLY', byday: '1FR,2FR',
    });
    expect(rows[1]).toMatchObject({
      closed: true, freq: 'YEARLY', bymonth: '11', byday: '4TH', weekday: null,
    });
    // Special hours have no weekday (not 0, which would read as Sunday).
    expect(rows.slice(2).map(({ weekday, valid_from: from }) => [weekday, from])).toEqual([
      [null, '2026-12-25'], [null, '2026-12-31'], [null, '2026-12-31'],
    ]);
    expect(rows[2]).toMatchObject({ closed: true, opens_at: null, closes_at: null });
  });

  it('reads back into the same editor state', () => {
    const rows = getIrregularOpeningHours(state, props);
    expect(rows[0]).toMatchObject({
      weekday: 'Friday', opensAt: '09:00', closesAt: '17:00', description: 'Line up early.',
    });
    expect(readSchedule(rows, '2026-11-01')).toEqual(schedule);
  });
});
