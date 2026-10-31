import React from 'react';
import { shallow } from 'enzyme';
import ServiceOpeningHoursEdit from './ServiceOpeningHoursEdit';
import { DAYS } from '../../../../Constants';
import {
  groupAtoms, describeCard, updateCard, splitCard, updateRange, newClosure,
} from './recurrence';

const CODES = ['MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU'];
const allDayEveryDay = byday => DAYS.map((weekday, i) => ({
  weekday,
  opensAt: '00:00',
  closesAt: '23:59',
  ...(byday ? { freq: 'MONTHLY', byday: `${byday}${CODES[i]}` } : {}),
}));
const saturday = {
  weekday: 'Saturday', opensAt: '09:00', closesAt: '17:00', freq: 'WEEKLY', byday: 'SA',
};

const render = (value, viewMode, updateValue = () => {}) => shallow(<ServiceOpeningHoursEdit
  value={value}
  viewMode={viewMode}
  supportsRecurrence
  updateValue={updateValue}
  onCancel={() => {}}
/>);
const cardsOf = wrapper => groupAtoms(wrapper.state('schedule').atoms);

describe('ServiceOpeningHoursEdit', () => {
  it('treats round-the-clock hours on every day as 24/7', () => {
    expect(render(allDayEveryDay(), false).state('active')).toBe(0);
  });

  it('keeps round-the-clock hours on the 1st week of each month as not 24/7', () => {
    const wrapper = render(allDayEveryDay('1'), false);

    expect(wrapper.state('active')).toBe(1);
    expect(cardsOf(wrapper).map(describeCard))
      .toEqual(['1st week of every month: 12AM to 11:59PM']);
  });

  it('describes the cards in view mode', () => {
    expect(render(allDayEveryDay('1'), true).html())
      .toContain('1st week of every month: 12AM to 11:59PM');
  });

  it('keeps a 24/7 service with a holiday closure as 24/7', () => {
    const christmas = { closed: true, validFrom: '2026-12-25', validTo: '2026-12-25' };
    const wrapper = render([...allDayEveryDay(), christmas], true);

    expect(wrapper.state('active')).toBe(0);
    expect(wrapper.state('schedule').specialHours).toHaveLength(1);
  });

  it('shows a service with only special hours or closures as not 24/7', () => {
    const closure = {
      closed: true, freq: 'YEARLY', bymonth: '12', bymonthday: '25',
    };
    expect(render([closure], true).state('active')).toBe(1);
    expect(render([{ closed: true }], true).state('active')).toBe(2);
  });

  it('saves a split card, a skipped date and a closure that repeats', () => {
    const updateValue = jest.fn();
    const wrapper = render([saturday], false, updateValue);
    const [card] = cardsOf(wrapper);

    wrapper.instance().onEditCard(card)(splitCard, '2026-12-01');
    const [, later] = cardsOf(wrapper);
    wrapper.instance().onEditCard(later)(updateRange, 0, { opensAt: '10:00', closesAt: '14:00' });
    wrapper.instance().onSkipCardDate(cardsOf(wrapper)[0], 'skip', '2026-11-14');
    wrapper.instance().onScheduleChange('closures', [newClosure({ description: 'Christmas' })]);
    wrapper.instance().updateValue();

    expect(updateValue.mock.calls[0][0]).toEqual([
      {
        closed: false,
        opensAt: '09:00',
        closesAt: '17:00',
        freq: 'WEEKLY',
        weekday: 'Saturday',
        byday: 'SA',
        validTo: '2026-11-30',
        exdates: ['2026-11-14'],
      },
      {
        closed: false,
        opensAt: '10:00',
        closesAt: '14:00',
        freq: 'WEEKLY',
        weekday: 'Saturday',
        byday: 'SA',
        validFrom: '2026-12-01',
      },
      {
        closed: true, freq: 'YEARLY', bymonth: '12', bymonthday: '25', description: 'Christmas',
      },
    ]);
  });

  it('skips and unskips one date of a card', () => {
    const wrapper = render([saturday], false);

    wrapper.instance().onSkipCardDate(cardsOf(wrapper)[0], 'skip', '2026-11-21');
    wrapper.instance().onSkipCardDate(cardsOf(wrapper)[0], 'skip', '2026-11-14');
    expect(cardsOf(wrapper)[0].exdates).toEqual(['2026-11-14', '2026-11-21']);

    wrapper.instance().onSkipCardDate(cardsOf(wrapper)[0], 'unskip', '2026-11-21');
    expect(cardsOf(wrapper)[0].exdates).toEqual(['2026-11-14']);
  });

  it('skips one year of a closure that repeats', () => {
    const wrapper = render([saturday], false);
    wrapper.instance().onScheduleChange('closures', [newClosure()]);

    wrapper.instance().onSkipClosure(0, '2026-12-25', false);
    expect(wrapper.state('schedule').closures[0].exdates).toEqual(['2026-12-25']);
    wrapper.instance().onSkipClosure(0, '2026-12-25', true);
    expect(wrapper.state('schedule').closures[0].exdates).toEqual([]);
  });

  it('does not save while a card is missing what it needs', () => {
    const wrapper = render([{ ...saturday, weekday: 'Sunday', byday: 'SU' }], false);

    wrapper.instance().onEditCard(cardsOf(wrapper)[0])(updateCard, { interval: 2 });
    expect(wrapper.instance().isValid()).toBe(false);

    wrapper.instance().onEditCard(cardsOf(wrapper)[0])(updateCard, { validFrom: '2021-10-31' });
    expect(wrapper.instance().isValid()).toBe(true);
  });

  it('does not save hours that clash', () => {
    const wrapper = render([
      saturday,
      {
        ...saturday, freq: 'MONTHLY', byday: '1SA', opensAt: '16:00', closesAt: '20:00',
      },
    ], false);

    expect(wrapper.instance().isValid()).toBe(false);
    expect(wrapper.html()).toContain('overlap on');
  });

  it('starts "not 24/7" with one card to fill in', () => {
    const wrapper = render([], false);

    wrapper.instance().onSelect(1);
    expect(cardsOf(wrapper).map(describeCard)).toEqual(['No days picked: 9AM to 5PM']);
  });
});
