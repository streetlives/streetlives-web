import React from 'react';
import { shallow } from 'enzyme';
import ServiceOpeningHoursEdit from './ServiceOpeningHoursEdit';
import { DAYS } from '../../../../Constants';

const CODES = ['MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU'];
const allDayEveryDay = byday => DAYS.map((weekday, i) => ({
  weekday,
  opensAt: '00:00',
  closesAt: '23:59',
  byday: byday && `${byday}${CODES[i]}`,
}));

const render = (value, viewMode) => shallow(<ServiceOpeningHoursEdit
  value={value}
  viewMode={viewMode}
  supportsRecurrence
  updateValue={() => {}}
  onCancel={() => {}}
/>);

describe('ServiceOpeningHoursEdit', () => {
  it('treats round-the-clock hours on every day as 24/7', () => {
    expect(render(allDayEveryDay(), false).state('active')).toBe(0);
  });

  [true, false].forEach((viewMode) => {
    it(`keeps round-the-clock hours on the 1st of each month as not 24/7 (viewMode ${viewMode})`, () => {
      const wrapper = render(allDayEveryDay('1'), viewMode);

      expect(wrapper.state('active')).toBe(1);
      expect(wrapper.state('schedule').weekPatterns.Monday).toEqual(['1']);
    });
  });

  it('shows the monthly rule on the preview', () => {
    expect(render(allDayEveryDay('1'), true).html())
      .toContain('1st Monday of the month only');
  });

  it('keeps a 24/7 service with a holiday closure as 24/7', () => {
    const christmas = { closed: true, validFrom: '2026-12-25', validTo: '2026-12-25' };
    const wrapper = render([...allDayEveryDay(), christmas], true);

    expect(wrapper.state('active')).toBe(0);
    expect(wrapper.state('schedule').specialHours).toHaveLength(1);
  });

  it('saves the first two Fridays and a holiday closure', () => {
    const updateValue = jest.fn();
    const wrapper = shallow(<ServiceOpeningHoursEdit
      value={[{ weekday: 'Friday', opensAt: '09:00', closesAt: '17:00' }]}
      viewMode={false}
      supportsRecurrence
      updateValue={updateValue}
      onCancel={() => {}}
    />);
    wrapper.instance().onWeeksChange('Friday', ['2', '1']);
    wrapper.instance().onScheduleChange('specialHours', [{
      validFrom: '2026-12-25', validTo: '', closed: true, description: 'Christmas Day',
    }]);
    wrapper.instance().updateValue();

    expect(updateValue.mock.calls[0][0]).toEqual([
      expect.objectContaining({ weekday: 'Friday', freq: 'MONTHLY', byday: '1FR,2FR' }),
      {
        closed: true, validFrom: '2026-12-25', validTo: '2026-12-25', description: 'Christmas Day',
      },
    ]);
  });
});
