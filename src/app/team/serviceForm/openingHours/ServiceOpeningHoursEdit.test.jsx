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
      expect(wrapper.state('recurrence').ordinal).toBe('1');
    });
  });

  it('shows the monthly rule on the preview', () => {
    expect(render(allDayEveryDay('1'), true).text())
      .toContain('Only the 1st of those days each month');
  });
});
