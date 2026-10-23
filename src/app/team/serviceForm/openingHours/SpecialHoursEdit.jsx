import React from 'react';
import PropTypes from 'prop-types';

import Button from '../../../../components/button';
import Input from '../../../../components/input';
import Icon from '../../../../components/icon';
import {
  describeSpecialHours, isSpecialHoursValid,
} from './recurrence';

const ERROR_STYLE = { color: '#A02733', fontSize: '0.8em' };

const DEFAULT_HOURS = { opensAt: '09:00', closesAt: '17:00' };

const newEntry = () => ({
  validFrom: '',
  validTo: '',
  closed: true,
  hours: [],
  description: '',
});

// Google-style "special hours": dates when the service is closed or keeps different hours,
// such as holidays. They override the regular hours on those dates.
function SpecialHoursEdit({
  entries, onChange, viewMode,
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
  const add = () => onChange([...entries, newEntry()]);
  const updateHours = (index, hourIndex, changes) => update(index, {
    hours: entries[index].hours.map((range, j) => (j === hourIndex ? { ...range, ...changes } : range)),
  });
  const addHours = index => update(index, { hours: [...entries[index].hours, { ...DEFAULT_HOURS }] });
  const removeHours = (index, hourIndex) => update(index, {
    hours: entries[index].hours.filter((_, j) => j !== hourIndex),
  });

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
                onChange={() => update(i, { closed: true, hours: [] })}
              />{' '}Closed
            </label>
            <label htmlFor={`special-open-${i}`}>
              <input
                id={`special-open-${i}`}
                type="radio"
                checked={!entry.closed}
                onChange={() => update(i, { closed: false, hours: [{ ...DEFAULT_HOURS }] })}
              />{' '}Open with different hours
            </label>
          </div>
          {!entry.closed && (
            <div className="mb-2">
              <table>
                <tbody>
                  {entry.hours.map((range, j) => (
                    // eslint-disable-next-line react/no-array-index-key
                    <tr key={j}>
                      <td style={{ paddingRight: '1em' }}>From:</td>
                      <td>
                        <Input
                          type="time"
                          value={range.opensAt || ''}
                          onChange={e => updateHours(i, j, { opensAt: e.target.value })}
                        />
                      </td>
                      <td style={{ padding: '0 1em' }}>To:</td>
                      <td>
                        <Input
                          type="time"
                          value={range.closesAt || ''}
                          onChange={e => updateHours(i, j, { closesAt: e.target.value })}
                        />
                      </td>
                      <td>
                        {entry.hours.length > 1 && (
                          <button
                            type="button"
                            className="default"
                            aria-label="Remove hours"
                            onClick={() => removeHours(i, j)}
                          >
                            <Icon name="trash" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <Button onClick={() => addHours(i)} basic primary>+ ADD HOURS</Button>
            </div>
          )}
          {!isSpecialHoursValid(entry) && (
            <div style={ERROR_STYLE}>
              {!entry.validFrom && 'Please pick a date. '}
              {entry.validTo && entry.validFrom && entry.validTo < entry.validFrom &&
                'The end date is before the start date. '}
              {!entry.closed &&
                entry.hours.some(({ opensAt, closesAt }) => !opensAt || !closesAt) &&
                'Please enter From & To hours.'}
            </div>
          )}
        </div>
      ))}

      <Button onClick={() => add()} basic primary>+ ADD A DATE</Button>
    </div>
  );
}

SpecialHoursEdit.propTypes = {
  entries: PropTypes.arrayOf(PropTypes.object).isRequired,
  onChange: PropTypes.func,
  viewMode: PropTypes.bool,
};

SpecialHoursEdit.defaultProps = {
  onChange: () => {},
  viewMode: false,
};

export default SpecialHoursEdit;
