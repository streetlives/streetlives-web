import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';

import Button from '../../../../components/button';
import Input from '../../../../components/input';
import Icon from '../../../../components/icon';
import { DAYS } from '../../../../Constants';
import {
  WEEK_OPTIONS, MONTHS, newClosure, describeClosure, getClosureError,
} from './recurrence';
import { Chip, ERROR_STYLE } from './SeriesEdit';

const LABEL_STYLE = { minWidth: '6em', display: 'inline-block' };

// Closures that come back every year or month, so nobody has to enter Christmas again next
// year: "every December 25", "every 4th Thursday of November", "all of August", "the last
// Friday of every month". On those days they close the service, unless special hours for that
// date say otherwise.
function ClosuresEdit({ closures, onChange, viewMode }) {
  if (viewMode) {
    if (!closures.length) return null;
    return (
      <div className="mb-3">
        <div className="font-weight-bold">Closures that repeat</div>
        {closures.map(closure => (
          <div key={describeClosure(closure)}>{describeClosure(closure)}</div>
        ))}
      </div>
    );
  }

  const update = (index, changes) => onChange(closures.map((closure, i) => (
    i === index ? { ...closure, ...changes } : closure
  )));
  const remove = index => onChange(closures.filter((_, i) => i !== index));

  return (
    <div className="mb-3">
      <p className="font-weight-bold mb-1">Closures that repeat (optional)</p>
      <p style={{ fontSize: '.9em' }}>
        Holidays and other days this service is closed every year or every month. They close
        the service on those days, so they don&apos;t need entering again next year.
      </p>

      {closures.map((closure, i) => {
        const id = name => `closure-${i}-${name}`;
        const isYearly = closure.freq === 'YEARLY';
        const error = getClosureError(closure);
        return (
          <div
            // eslint-disable-next-line react/no-array-index-key
            key={i}
            className="border rounded p-2 mb-2"
          >
            <div className="d-flex justify-content-between align-items-start mb-2">
              <strong>{describeClosure(closure)}</strong>
              <button
                type="button"
                className="default"
                aria-label="Remove this closure"
                onClick={() => remove(i)}
              >
                <Icon name="trash" />
              </button>
            </div>
            <div className="mb-2">
              <Input
                fluid
                id={id('label')}
                placeholder="Label, e.g. Thanksgiving (optional)"
                value={closure.description}
                onChange={e => update(i, { description: e.target.value })}
              />
            </div>
            <div className="mb-2 d-flex align-items-center flex-wrap">
              <span style={LABEL_STYLE}>Closed</span>
              <select
                aria-label="How often"
                value={closure.freq}
                onChange={e => update(i, {
                  freq: e.target.value,
                  on: closure.on === 'month' ? 'days' : closure.on,
                })}
              >
                <option value="YEARLY">every year</option>
                <option value="MONTHLY">every month</option>
              </select>
              {isYearly && (
                <span className="ml-2">
                  in{' '}
                  <select
                    aria-label="Month"
                    value={closure.month}
                    onChange={e => update(i, { month: e.target.value })}
                  >
                    {MONTHS.map((month, m) => (
                      <option key={month} value={String(m + 1)}>{month}</option>
                    ))}
                  </select>
                </span>
              )}
            </div>
            <div className="mb-2">
              <span style={LABEL_STYLE}>On</span>
              <label className="mr-2" htmlFor={id('on-days')}>
                <input
                  id={id('on-days')}
                  type="radio"
                  checked={closure.on === 'days'}
                  onChange={() => update(i, { on: 'days' })}
                />{' '}day
              </label>
              {closure.on === 'days' && (
                <span className="mr-3 d-inline-block" style={{ width: '9em' }}>
                  <Input
                    id={id('month-days')}
                    placeholder="25 or 24,25"
                    value={closure.monthDays}
                    onChange={e => update(i, { monthDays: e.target.value.replace(/\s/g, '') })}
                  />
                </span>
              )}
              <label className="mr-2" htmlFor={id('on-weekday')}>
                <input
                  id={id('on-weekday')}
                  type="radio"
                  checked={closure.on === 'weekday'}
                  onChange={() => update(i, { on: 'weekday' })}
                />{' '}the
              </label>
              {closure.on === 'weekday' && (
                <span className="mr-3">
                  <select
                    aria-label="Week of the month"
                    value={closure.weeks[0]}
                    onChange={e => update(i, { weeks: [e.target.value] })}
                  >
                    {WEEK_OPTIONS.map(({ value, label }) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>{' '}
                  <select
                    aria-label="Weekday"
                    value={closure.day}
                    onChange={e => update(i, { day: e.target.value })}
                  >
                    {DAYS.map(day => <option key={day} value={day}>{day}</option>)}
                  </select>
                </span>
              )}
              {isYearly && (
                <label htmlFor={id('on-month')}>
                  <input
                    id={id('on-month')}
                    type="radio"
                    checked={closure.on === 'month'}
                    onChange={() => update(i, { on: 'month' })}
                  />{' '}the whole month
                </label>
              )}
            </div>
            <div className="mb-2 d-flex align-items-center flex-wrap">
              <label htmlFor={id('starts')} style={LABEL_STYLE}>Starting</label>
              <Input
                id={id('starts')}
                type="date"
                value={closure.validFrom}
                onChange={e => update(i, { validFrom: e.target.value })}
              />
              <label htmlFor={id('ends')} className="mx-2">until</label>
              <Input
                id={id('ends')}
                type="date"
                value={closure.validTo}
                onChange={e => update(i, { validTo: e.target.value })}
              />
              <span style={{ fontSize: '.85em', color: '#666', paddingLeft: '.5em' }}>
                Optional
              </span>
            </div>
            {!!closure.exdates.length && (
              <div className="mb-2">
                <span style={LABEL_STYLE}>Open anyway</span>
                {closure.exdates.map(date => (
                  <Chip
                    key={date}
                    selected
                    onClick={() => update(i, { exdates: closure.exdates.filter(d => d !== date) })}
                  >
                    {moment(date).format('MMM D, YYYY')} ×
                  </Chip>
                ))}
              </div>
            )}
            {error && <div style={ERROR_STYLE}>{error}</div>}
          </div>
        );
      })}

      <Button onClick={() => onChange([...closures, newClosure()])} basic primary>
        + ADD A CLOSURE THAT REPEATS
      </Button>
    </div>
  );
}

ClosuresEdit.propTypes = {
  closures: PropTypes.arrayOf(PropTypes.shape({
    description: PropTypes.string,
    freq: PropTypes.oneOf(['YEARLY', 'MONTHLY']),
    month: PropTypes.string,
    on: PropTypes.oneOf(['days', 'weekday', 'month']),
    monthDays: PropTypes.string,
    weeks: PropTypes.arrayOf(PropTypes.string),
    day: PropTypes.string,
    validFrom: PropTypes.string,
    validTo: PropTypes.string,
    exdates: PropTypes.arrayOf(PropTypes.string),
  })).isRequired,
  onChange: PropTypes.func,
  viewMode: PropTypes.bool,
};

ClosuresEdit.defaultProps = {
  onChange: () => {},
  viewMode: false,
};

export default ClosuresEdit;
