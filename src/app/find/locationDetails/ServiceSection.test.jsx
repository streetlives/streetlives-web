import React from 'react';
import { shallow } from 'enzyme';
import ServiceSection from './ServiceSection';

const row = extra => ({
  occasion: 'COVID19', closed: false, opens_at: '09:00:00', closes_at: '17:00:00', ...extra,
});

const scheduleText = (holidaySchedules) => {
  const wrapper = shallow(<ServiceSection
    service={{ id: 'svc', name: 'Pantry', HolidaySchedules: holidaySchedules }}
    showOnMount
  />);
  return wrapper.find('InfoItem[icon="clock"]').find('div').map(line => line.text());
};

describe('ServiceSection schedule', () => {
  it('shows weekly, monthly and special hours', () => {
    expect(scheduleText([
      row({ weekday: 1 }),
      row({ weekday: 5, freq: 'MONTHLY', byday: '1FR,2FR' }),
      row({
        weekday: null,
        closed: true,
        opens_at: null,
        closes_at: null,
        valid_from: '2026-12-25',
        valid_to: '2026-12-25',
        description: 'Christmas Day',
      }),
    ])).toEqual([
      'Open Monday 9 AM to 5 PM',
      '1st and 2nd Fridays of the month: 9 AM to 5 PM',
      'Dec 25, 2026 (Christmas Day): Closed',
    ]);
  });

  it('does not mark a service suspended because of a holiday closure', () => {
    const wrapper = shallow(<ServiceSection
      service={{
        id: 'svc',
        name: 'Pantry',
        HolidaySchedules: [row({ weekday: 1 }), row({
          weekday: null, closed: true, valid_from: '2026-12-25', valid_to: '2026-12-25',
        })],
      }}
      showOnMount
    />);
    expect(wrapper.text()).not.toContain('(suspended)');
  });

  it('shows a service that only has special hours, such as a one-time event', () => {
    expect(scheduleText([row({
      weekday: null,
      valid_from: '2026-11-14',
      valid_to: '2026-11-14',
      opens_at: '10:00:00',
      closes_at: '14:00:00',
    })])).toEqual(['Nov 14, 2026: 10AM to 2PM']);
  });
});
