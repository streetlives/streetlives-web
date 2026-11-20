import React from 'react';
import { shallow } from 'enzyme';
import ServiceOpeningHoursEdit from './ServiceOpeningHoursEdit';
import PatternDrawer from './PatternDrawer';
import { DAYS } from '../../../../Constants';
import {
  groupAtoms, describeCard, updateCard, updateRange, newClosure, cardOnDay,
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

  it('keeps hours that change on a date, and saves a skipped date and a repeating closure', () => {
    const updateValue = jest.fn();
    const wrapper = render([
      { ...saturday, validTo: '2026-11-30' },
      {
        ...saturday, opensAt: '10:00', closesAt: '14:00', validFrom: '2026-12-01',
      },
    ], false, updateValue);

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

  it('starts "Set hours" with an empty week, which can\'t be saved yet', () => {
    const wrapper = render([], false);

    wrapper.instance().onSelect(1);
    expect(cardsOf(wrapper)).toEqual([]);
    expect(wrapper.instance().isValid()).toBe(false);
  });

  it('fills the week and saves it as one card per set of hours', () => {
    const updateValue = jest.fn();
    const wrapper = render([], false, updateValue);

    wrapper.instance().onSelect(1);
    wrapper.instance().onQuickFill(true);
    expect(cardsOf(wrapper).map(describeCard)).toEqual(['Weekdays: 9AM to 5PM']);
    wrapper.instance().updateValue();
    expect(updateValue.mock.calls[0][0]).toHaveLength(5);
  });

  it('follows the drawer\'s card as it changes, and undoes the changes on Cancel', () => {
    const wrapper = render([saturday], false);
    const [card] = cardsOf(wrapper);

    wrapper.instance().openDrawer(card, null);
    wrapper.instance().onDrawerEdit(updateCard, { freq: 'MONTHLY', weeks: ['1'] });
    expect(describeCard(wrapper.instance().drawerCard()))
      .toBe('1st Sat of every month: 9AM to 5PM');
    wrapper.instance().onDrawerEdit(updateRange, 0, { closesAt: '13:00' });
    expect(describeCard(wrapper.instance().drawerCard()))
      .toBe('1st Sat of every month: 9AM to 1PM');

    wrapper.instance().cancelDrawer();
    expect(wrapper.state('drawer')).toBeNull();
    expect(cardsOf(wrapper).map(describeCard)).toEqual(['Sat: 9AM to 5PM']);
  });

  describe('repeat settings opened from one day', () => {
    const weekdays = DAYS.slice(0, 5).map((weekday, i) => ({
      ...saturday, weekday, byday: CODES[i],
    }));
    const openMonday = () => {
      const wrapper = render(weekdays, false);
      wrapper.instance().openDrawer(cardOnDay(cardsOf(wrapper)[0], 'Monday'), null);
      return wrapper;
    };

    it('changes that day only', () => {
      const wrapper = openMonday();

      wrapper.instance().onDrawerEdit(updateCard, { months: ['6'] });
      wrapper.instance().onDrawerEdit(updateRange, 0, { closesAt: '13:00' });
      expect(cardsOf(wrapper).map(describeCard)).toEqual([
        'Mon, in Jun: 9AM to 1PM',
        'Tue, Wed, Thu, and Fri: 9AM to 5PM',
      ]);
    });

    it('puts the other days back as they were on Cancel', () => {
      const wrapper = openMonday();

      wrapper.instance().onDrawerEdit(updateCard, { months: ['6'] });
      wrapper.instance().cancelDrawer();
      expect(cardsOf(wrapper).map(describeCard)).toEqual(['Weekdays: 9AM to 5PM']);
    });

    it('goes back to that day after days of the month', () => {
      const wrapper = openMonday();
      const choose = (label, value) => wrapper.find(PatternDrawer).dive()
        .find({ label }).prop('onChange')(value);

      choose('Repeat unit', 'MONTHLY');
      choose('Pick by', 'day');
      expect(wrapper.instance().drawerCard().days).toEqual([]);
      choose('Pick by', 'week');
      expect(wrapper.instance().drawerCard().days).toEqual(['Monday']);

      choose('Pick by', 'day');
      choose('Repeat unit', 'WEEKLY');
      expect(describeCard(wrapper.instance().drawerCard())).toBe('Mon: 9AM to 5PM');
    });
  });

  it('asks for special hours on a date from the calendar, adding nothing yet', () => {
    const wrapper = render([saturday], false);

    wrapper.instance().onAddSpecialHours('2026-12-24');
    expect(wrapper.state('exceptionDate')).toBe('2026-12-24');
    expect(wrapper.state('schedule').specialHours).toEqual([]);
  });
});
