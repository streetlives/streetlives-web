import React from 'react';
import { mount } from 'enzyme';
import WeekTable from './WeekTable';
import { groupAtoms, newAtom } from './recurrence';

const render = atoms => mount(<WeekTable
  cards={groupAtoms(atoms)}
  onAtoms={() => {}}
  onOpenCard={() => {}}
/>);
const dayRow = (wrapper, day) => wrapper.find('.oh-day').filterWhere(row =>
  row.find('.oh-day-name').text() === day);

describe('WeekTable', () => {
  it('keeps a day open with its hours when its repeat settings change', () => {
    const wrapper = render([newAtom({ day: 'Monday', months: ['6', '7'] })]);
    const monday = dayRow(wrapper, 'Monday');

    expect(monday.find('button[role="switch"]').prop('aria-checked')).toBe(true);
    expect(monday.find('input[type="time"]').map(input => input.prop('value')))
      .toEqual(['09:00', '17:00']);
    expect(monday.text()).toContain('↻ Mon, in Jun and Jul');
    expect(monday.find('.oh-pattern')).toHaveLength(0);
  });

  it('lists a pattern under a day that also has weekly hours', () => {
    const wrapper = render([
      newAtom({ day: 'Saturday' }),
      newAtom({
        day: 'Saturday', freq: 'MONTHLY', weeks: ['1'], opensAt: '18:00', closesAt: '20:00',
      }),
    ]);
    const saturday = dayRow(wrapper, 'Saturday');

    expect(saturday.find('input[type="time"]').first().prop('value')).toBe('09:00');
    expect(saturday.find('.oh-pattern').text()).toContain('1st Sat of every month');
  });

  it('opens repeat settings for just the day of the row', () => {
    const onOpenCard = jest.fn();
    const wrapper = mount(<WeekTable
      cards={groupAtoms([newAtom({ day: 'Monday' }), newAtom({ day: 'Tuesday' })])}
      onAtoms={() => {}}
      onOpenCard={onOpenCard}
    />);

    wrapper.find('button[aria-label="Repeat settings for Monday"]').simulate('click');
    expect(onOpenCard.mock.calls[0][0].days).toEqual(['Monday']);
  });

  it('shows a day with no hours as closed', () => {
    const sunday = dayRow(render([newAtom({ day: 'Monday' })]), 'Sunday');

    expect(sunday.find('button[role="switch"]').prop('aria-checked')).toBe(false);
    expect(sunday.text()).toContain('Closed');
  });
});
