import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';

import Button from '../../../../components/button';
import Input from '../../../../components/input';
import Icon from '../../../../components/icon';
import {
  describeSpecialHours, isSpecialHoursValid, upcomingHolidays,
} from './recurrence';

const ERROR_STYLE = { color: '#A02733', fontSize: '0.8em' };

const newEntry = (validFrom = '', description = '') => ({
  validFrom,
  validTo: '',
  closed: true,
  opensAt: null,
  closesAt: null,
  description,
});

// Google-style "special hours": dates when the service is closed or keeps different hours,
// such as holidays. They override the regular hours on those dates.
function SpecialHoursEdit({
  entries, onChange, viewMode, today,
}) {
  if (viewMode) {
    if (!entries.length) return null;
    return (
      <div className="mb-3">
        <div className="font-weight-bold">Special hours</div>
        {entries.map(entry => <div key={`${entry.validFrom}-${entry.description}`}>{describeSpecialHours(entry)}</div>)}
      </div>
    );
  }

  const update = (index, changes) => onChange(entries.map((entry, i) => (
    i === index ? { ...entry, ...changes } : entry
  )));
  const remove = index => onChange(entries.filter((_, i) => i !== index));
  const add = (validFrom, description) => onChange([...entries, newEntry(validFrom, description)]);

  const holidays = upcomingHolidays(today)
    .filter(({ date }) => !entries.some(entry => entry.validFrom === date));

  return (
    <div className="mb-3">
      <p className="font-weight-bold mb-1">Special hours (optional)</p>
      <p style={{ fontSize: '.9em' }}>
        Holidays or other dates when this service is closed or has different hours.
        These replace the regular hours on those dates.
      </p>

      {entries.map((entry, i) => (
        <div
          // eslint-disable-next-line react/no-array-index-key
          key={i}
          className="border rounded p-2 mb-2"
        >
          <div className="d-flex justify-content-between align-items-center mb-2">
            <Input
              placeholder="Label, e.g. Christmas Day (optional)"
              value={entry.description}
              onChange={e => update(i, { description: e.target.value })}
            />
            <button type="button" className="default" aria-label="Remove date" onClick={() => remove(i)}>
              <Icon name="trash" />
            </button>
          </div>
          <table className="mb-2">
            <tbody>
              <tr>
                <td style={{ paddingRight: '1em' }}>Date:</td>
                <td>
                  <Input
                    type="date"
                    value={entry.validFrom}
                    onChange={e => update(i, { validFrom: e.target.value })}
                  />
                </td>
              </tr>
              <tr>
                <td style={{ paddingRight: '1em' }}>Until (optional):</td>
                <td>
                  <Input
                    type="date"
                    value={entry.validTo}
                    onChange={e => update(i, { validTo: e.target.value })}
                  />
                </td>
              </tr>
            </tbody>
          </table>
          <div className="mb-2">
            <label className="mr-3" htmlFor={`special-closed-${i}`}>
              <input
                id={`special-closed-${i}`}
                type="radio"
                checked={entry.closed}
                onChange={() => update(i, { closed: true, opensAt: null, closesAt: null })}
              />{' '}Closed
            </label>
            <label htmlFor={`special-open-${i}`}>
              <input
                id={`special-open-${i}`}
                type="radio"
                checked={!entry.closed}
                onChange={() => update(i, { closed: false, opensAt: '09:00', closesAt: '17:00' })}
              />{' '}Open with different hours
            </label>
          </div>
          {!entry.closed && (
            <table>
              <tbody>
                <tr>
                  <td style={{ paddingRight: '1em' }}>From:</td>
                  <td>
                    <Input
                      type="time"
                      value={entry.opensAt || ''}
                      onChange={e => update(i, { opensAt: e.target.value })}
                    />
                  </td>
                  <td style={{ padding: '0 1em' }}>To:</td>
                  <td>
                    <Input
                      type="time"
                      value={entry.closesAt || ''}
                      onChange={e => update(i, { closesAt: e.target.value })}
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          )}
          {!isSpecialHoursValid(entry) && (
            <div style={ERROR_STYLE}>
              {!entry.validFrom && 'Please pick a date. '}
              {entry.validTo && entry.validFrom && entry.validTo < entry.validFrom &&
                'The end date is before the start date. '}
              {!entry.closed && (!entry.opensAt || !entry.closesAt) && 'Please enter From & To hours.'}
            </div>
          )}
        </div>
      ))}

      {!!holidays.length && (
        <div className="mb-2">
          <div style={{ fontSize: '.9em' }}>Upcoming holidays:</div>
          {holidays.map(({ date, name }) => (
            <button
              key={date}
              type="button"
              className="btn btn-sm btn-outline-secondary mr-2 mb-2"
              onClick={() => add(date, name)}
            >
              + {name} ({moment(date).format('MMM D')})
            </button>
          ))}
        </div>
      )}
      <Button onClick={() => add()} basic primary>+ ADD A DATE</Button>
    </div>
  );
}

SpecialHoursEdit.propTypes = {
  entries: PropTypes.arrayOf(PropTypes.object).isRequired,
  onChange: PropTypes.func,
  viewMode: PropTypes.bool,
  today: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
};

SpecialHoursEdit.defaultProps = {
  onChange: () => {},
  viewMode: false,
  today: undefined,
};

export default SpecialHoursEdit;
