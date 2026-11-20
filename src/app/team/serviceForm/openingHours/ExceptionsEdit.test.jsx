import React from 'react';
import { mount } from 'enzyme';
import ExceptionsEdit, { ExceptionsView } from './ExceptionsEdit';
import { newClosure, newSpecialHours } from './recurrence';

const christmas = newClosure({ description: 'Christmas' });
const dayAfter = newSpecialHours({
  description: 'Day after Thanksgiving',
  validFrom: '2026-11-27',
  closed: false,
  hours: [{ opensAt: '09:00', closesAt: '13:00' }],
});
const render = (closures, specialHours, onChange = () => {}, props = {}) => mount(<ExceptionsEdit
  closures={closures}
  specialHours={specialHours}
  onChange={onChange}
  {...props}
/>);
const openNew = (wrapper) => {
  wrapper.find('.oh-section-head button').simulate('click');
  return wrapper;
};
const choose = (wrapper, group, label) => wrapper
  .find(`[aria-label="${group}"] button`)
  .filterWhere(button => button.text().includes(label))
  .simulate('click');
const type = (wrapper, selector, value) =>
  wrapper.find(selector).first().simulate('change', { target: { value } });

describe('ExceptionsEdit', () => {
  it('lists closures and special hours together', () => {
    const rows = render([christmas], [dayAfter]).find('.oh-exception-row');

    expect(rows.at(0).text()).toContain('Every December 25');
    expect(rows.at(1).text()).toContain('Nov 27, 2026');
    expect(rows.at(1).text()).toContain('9AM to 1PM');
  });

  it('adds a date the service is closed', () => {
    const onChange = jest.fn();
    const wrapper = openNew(render([], [], onChange));

    expect(wrapper.find('button[type="submit"]').prop('disabled')).toBe(true);
    type(wrapper, 'input[type="date"]', '2026-12-24');
    type(wrapper, 'input.oh-dialog-name', ' Christmas Eve ');
    wrapper.find('form').simulate('submit');

    expect(onChange.mock.calls[0][0].specialHours).toEqual([newSpecialHours({
      validFrom: '2026-12-24', description: 'Christmas Eve',
    })]);
  });

  it('adds different hours on a date', () => {
    const onChange = jest.fn();
    const wrapper = openNew(render([], [], onChange));

    choose(wrapper, 'What happens that day', 'Different hours');
    type(wrapper, 'input[type="date"]', '2026-12-24');
    expect(wrapper.find('.oh-preview-rule').text()).toContain('9AM to 5PM');
    wrapper.find('form').simulate('submit');

    expect(onChange.mock.calls[0][0].specialHours[0]).toMatchObject({
      closed: false, hours: [{ opensAt: '09:00', closesAt: '17:00' }],
    });
  });

  it('waits for the hours and an end date after the start', () => {
    const onChange = jest.fn();
    const wrapper = render([], [dayAfter], onChange);

    wrapper.find('button[aria-label="Edit Day after Thanksgiving"]').simulate('click');
    type(wrapper, 'input[aria-label="Range 1 closes"]', '');
    expect(wrapper.find('button[type="submit"]').prop('disabled')).toBe(true);
    type(wrapper, 'input[aria-label="Range 1 closes"]', '13:00');
    type(wrapper, 'input[type="date"]', '2026-11-27');
    wrapper.find('input[type="date"]').at(1).simulate('change', {
      target: { value: '2026-11-01' },
    });
    expect(wrapper.find('.oh-field-error').text()).toContain('before the start date');
    wrapper.find('form').simulate('submit');
    expect(onChange).not.toHaveBeenCalled();
  });

  it('adds a closure that repeats', () => {
    const onChange = jest.fn();
    const wrapper = openNew(render([christmas], [], onChange));

    choose(wrapper, 'How often', 'Every year');
    choose(wrapper, 'Which day', 'A weekday');
    type(wrapper, 'select[aria-label="Month"]', '11');
    type(wrapper, 'input.oh-dialog-name', 'Thanksgiving');
    expect(wrapper.find('.oh-preview-rule').text())
      .toContain('Closed every 4th Thursday of November.');
    wrapper.find('form').simulate('submit');

    expect(onChange.mock.calls[0][0].closures[1]).toMatchObject({
      description: 'Thanksgiving', on: 'weekday', month: '11', weeks: ['4'], day: 'Thursday',
    });
  });

  it('saves an edit over the item it came from', () => {
    const onChange = jest.fn();
    const other = newClosure({ description: 'New Year', month: '1', monthDays: '1' });
    const wrapper = render([christmas, other], [], onChange);

    wrapper.find('button[aria-label="Edit Christmas"]').simulate('click');
    type(wrapper, 'input.oh-dialog-name', 'Xmas');
    wrapper.find('form').simulate('submit');
    expect(onChange.mock.calls[0][0].closures.map(({ description }) => description))
      .toEqual(['Xmas', 'New Year']);
  });

  it('moves an item when an edit changes what kind it is', () => {
    const onChange = jest.fn();
    const wrapper = render([christmas], [], onChange);

    wrapper.find('button[aria-label="Edit Christmas"]').simulate('click');
    choose(wrapper, 'How often', 'One date');
    type(wrapper, 'input[type="date"]', '2026-12-25');
    wrapper.find('form').simulate('submit');

    const { closures, specialHours } = onChange.mock.calls[0][0];
    expect(closures).toEqual([]);
    expect(specialHours).toEqual([newSpecialHours({
      validFrom: '2026-12-25', description: 'Christmas',
    })]);
  });

  it('keeps older closures to their weekday until they get hours', () => {
    const onChange = jest.fn();
    const saturdays = newSpecialHours({
      validFrom: '2026-12-01', validTo: '2026-12-31', weekday: 'Saturday',
    });
    const wrapper = render([], [saturdays], onChange);

    expect(wrapper.find('.oh-exception-row').text()).toContain('Closed on Saturdays');
    wrapper.find('button[aria-label="Edit Special hours"]').simulate('click');
    wrapper.find('form').simulate('submit');
    expect(onChange.mock.calls[0][0].specialHours[0].weekday).toBe('Saturday');
  });

  it('changes nothing on Cancel', () => {
    const onChange = jest.fn();
    const wrapper = openNew(render([], [], onChange));

    wrapper.find('.oh-dialog-foot button[type="button"]').simulate('click');
    expect(onChange).not.toHaveBeenCalled();
    expect(wrapper.update().find('form')).toHaveLength(0);
  });

  it('opens on a date picked in the calendar', () => {
    const onRequestHandled = jest.fn();
    const wrapper = render([], [], () => {}, {
      requestedDate: '2026-12-24', onRequestHandled,
    });

    wrapper.update();
    expect(wrapper.find('input[type="date"]').first().prop('value')).toBe('2026-12-24');
    expect(wrapper.find('.oh-preview-rule').text()).toContain('9AM to 5PM');
    expect(onRequestHandled).toHaveBeenCalled();
  });

  it('describes them in view mode', () => {
    const text = mount((
      <div><ExceptionsView closures={[christmas]} specialHours={[dayAfter]} /></div>
    )).text();

    expect(text).toContain('Every December 25 (Christmas)');
    expect(text).toContain('Nov 27, 2026 (Day after Thanksgiving): 9AM to 1PM');
  });
});
