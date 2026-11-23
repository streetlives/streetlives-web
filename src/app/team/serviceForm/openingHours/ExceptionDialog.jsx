import React, { useRef, useState } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';

import { DAYS } from '../../../../Constants';
import {
  WEEK_OPTIONS, MONTHS, newClosure, newSpecialHours, describeClosureRule, getClosureError,
  getSpecialHoursError, upcomingClosureDates, describeSpecialDates, describeSpecialTimes,
  nextRange,
} from './recurrence';
import {
  Segmented, DateAction, TimeInput, NextDayTag, TrashIcon, useId, useModal, useFocusNext,
} from './controls';

const ONCE = 'ONCE';
const HOW_OFTEN = [
  { value: ONCE, label: 'One date' },
  { value: 'YEARLY', label: 'Every year' },
  { value: 'MONTHLY', label: 'Every month' },
];
const WHAT_HAPPENS = [
  { value: 'closed', label: 'Closed' },
  { value: 'hours', label: 'Different hours' },
];
const WHICH_DAY = [
  { value: 'days', label: 'Date(s)' },
  { value: 'weekday', label: 'A weekday' },
  { value: 'month', label: 'Whole month' },
];
const DEFAULT_HOURS = { opensAt: '09:00', closesAt: '17:00' };

const lowerFirst = text => text[0].toLowerCase() + text.slice(1);
const timesOf = ({ opensAt, closesAt }) => ({ opensAt, closesAt });

function MonthSelect({ value, onChange }) {
  return (
    <select
      className="oh-input"
      aria-label="Month"
      value={value}
      onChange={e => onChange(e.target.value)}
    >
      {MONTHS.map((month, i) => <option key={month} value={String(i + 1)}>{month}</option>)}
    </select>
  );
}

MonthSelect.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
};

// Adds or edits a holiday or exception, with what it will do shown beside the fields: special
// hours on one date or a run of dates, or a closure that repeats every year or month. Nothing
// changes until it's added or saved.
function ExceptionDialog({
  kind, value, isNew, today, onSave, onCancel,
}) {
  const [often, setOften] = useState(kind === 'special' ? ONCE : value.freq);
  const [name, setName] = useState(value.description);
  const [closure, setClosure] = useState(() => {
    const base = kind === 'closure' ? value : newClosure();
    return { ...base, weeks: base.weeks.length ? base.weeks : ['1'] };
  });
  const [special, setSpecial] = useState(kind === 'special' ? value : newSpecialHours());
  const [focusNext, isNext] = useFocusNext();
  const ref = useRef(null);
  const id = useId('exception');
  useModal(ref, onCancel);

  const isOnce = often === ONCE;
  const isYearly = often === 'YEARLY';
  const draft = { ...closure, freq: isOnce ? closure.freq : often };
  const update = changes => setClosure({ ...closure, ...changes });
  const updateSpecial = changes => setSpecial({ ...special, ...changes });
  const updateHours = (index, changes) => updateSpecial({
    hours: special.hours.map((range, i) => (i === index ? { ...range, ...changes } : range)),
  });

  const closureError = getClosureError(draft);
  const dayError = getClosureError({ ...draft, validFrom: '', validTo: '' });
  const closureDateError = dayError ? null : closureError;
  const specialError = getSpecialHoursError(special);
  const specialErrorOn = field => (specialError && specialError.field === field
    ? specialError.message
    : null);
  const hasError = isOnce ? !!specialError : !!closureError;

  const nextDates = isOnce || hasError ? [] : upcomingClosureDates(draft, today);
  const nextLabel = nextDates.length > 1 ? `Next ${nextDates.length} dates` : 'Next date';
  const formatNext = date => moment(date)
    .format(draft.on === 'month' ? 'MMMM YYYY' : 'ddd, MMM D, YYYY');
  const isSpecialHours = isOnce && !special.closed;
  const addLabel = isSpecialHours ? 'Add special hours' : 'Add closure';

  const changeOften = (next) => {
    setOften(next);
    if (next === 'MONTHLY' && closure.on === 'month') update({ on: 'days' });
  };
  const changeHappens = (happens) => {
    if (happens !== 'closed') focusNext(0);
    updateSpecial(happens === 'closed'
      ? { closed: true, hours: [] }
      : {
        closed: false,
        weekday: '',
        hours: special.hours.length ? special.hours : [{ ...DEFAULT_HOURS }],
      });
  };
  const save = (e) => {
    e.preventDefault();
    if (hasError) return;
    const description = name.trim();
    onSave(isOnce
      ? { kind: 'special', value: { ...special, description } }
      : { kind: 'closure', value: { ...draft, description } });
  };

  return (
    <div className="oh-overlay is-centered">
      <form
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${id}-title`}
        className="oh-dialog"
        onSubmit={save}
      >
        <div className="oh-dialog-head">
          <h2 id={`${id}-title`}>
            {isNew ? 'Add a holiday or exception' : 'Edit holiday or exception'}
          </h2>
          <button
            type="button"
            aria-label="Close dialog"
            className="oh-icon-btn"
            onClick={onCancel}
          >
            ✕
          </button>
        </div>

        <div className="oh-dialog-body">
          <div className="oh-stack">
            <div className="oh-dialog-grid">
              <span className="oh-label">1. How often?</span>
              <Segmented
                label="How often"
                value={often}
                options={HOW_OFTEN}
                onChange={changeOften}
              />

              {isOnce && <span className="oh-label">2. What happens?</span>}
              {isOnce && (
                <Segmented
                  label="What happens that day"
                  value={special.closed ? 'closed' : 'hours'}
                  options={WHAT_HAPPENS}
                  onChange={changeHappens}
                />
              )}

              {isOnce && (
                <div className="oh-dialog-wide">
                  <span className="oh-label">3. Which date?</span>
                  <div className="oh-two">
                    <label htmlFor={`${id}-date`} className="oh-note">
                      Date
                      <input
                        id={`${id}-date`}
                        type="date"
                        className="oh-input"
                        value={special.validFrom}
                        onChange={e => updateSpecial({ validFrom: e.target.value })}
                      />
                    </label>
                    <label htmlFor={`${id}-until`} className="oh-note">
                      Until (optional)
                      <input
                        id={`${id}-until`}
                        type="date"
                        className="oh-input"
                        aria-invalid={!!specialErrorOn('validTo')}
                        aria-describedby={`${id}-until-error`}
                        value={special.validTo}
                        onChange={e => updateSpecial({ validTo: e.target.value })}
                      />
                    </label>
                  </div>
                  <span id={`${id}-until-error`} className="oh-field-error">
                    {specialErrorOn('validTo') && <strong>! {specialErrorOn('validTo')}</strong>}
                  </span>
                </div>
              )}

              {isSpecialHours && (
                <div className="oh-dialog-wide">
                  <span className="oh-label">Hours</span>
                  {special.hours.map((range, i) => (
                    // eslint-disable-next-line react/no-array-index-key
                    <div key={i} className="oh-drawer-range">
                      <TimeInput
                        label={`Range ${i + 1} opens`}
                        value={range.opensAt || ''}
                        invalid={!range.opensAt}
                        focusOnMount={isNext(i)}
                        onChange={opensAt => updateHours(i, { opensAt })}
                      />
                      <span>to</span>
                      <TimeInput
                        label={`Range ${i + 1} closes`}
                        value={range.closesAt || ''}
                        invalid={!range.closesAt}
                        onChange={closesAt => updateHours(i, { closesAt })}
                      />
                      <NextDayTag range={range} />
                      {special.hours.length > 1 && (
                        <button
                          type="button"
                          className="oh-icon-btn"
                          aria-label={`Remove range ${i + 1}`}
                          onClick={() => updateSpecial({
                            hours: special.hours.filter((_, j) => j !== i),
                          })}
                        >
                          <TrashIcon />
                        </button>
                      )}
                    </div>
                  ))}
                  {specialErrorOn('hours') && (
                    <span className="oh-field-error">
                      <strong>! {specialErrorOn('hours')}</strong>
                    </span>
                  )}
                  <button
                    type="button"
                    className="oh-link oh-start"
                    onClick={() => {
                      focusNext(special.hours.length);
                      updateSpecial({
                        hours: [...special.hours, timesOf(nextRange(special.hours))],
                      });
                    }}
                  >
                    + Add a time range
                  </button>
                </div>
              )}

              {!isOnce && <span className="oh-label">2. Which day?</span>}
              {!isOnce && (
                <Segmented
                  label="Which day"
                  value={draft.on}
                  options={isYearly ? WHICH_DAY : WHICH_DAY.slice(0, 2)}
                  onChange={on => update({ on })}
                />
              )}

              {!isOnce && (
                <div className="oh-dialog-value">
                  {draft.on === 'days' && (
                    <div className="oh-inline">
                      {isYearly && (
                        <MonthSelect value={draft.month} onChange={month => update({ month })} />
                      )}
                      <input
                        className="oh-input oh-days-input"
                        aria-label={isYearly ? 'Dates in the month' : 'Dates of the month'}
                        aria-invalid={!!dayError}
                        aria-describedby={`${id}-days`}
                        placeholder={isYearly ? '25 or 24,25' : '1,15 or -1'}
                        value={draft.monthDays}
                        onChange={e => update({ monthDays: e.target.value.replace(/\s/g, '') })}
                      />
                    </div>
                  )}
                  {draft.on === 'days' && (
                    <span id={`${id}-days`} className={dayError ? 'oh-field-error' : 'oh-help'}>
                      {dayError
                        ? <strong>! {dayError}</strong>
                        : `Separate dates with commas${isYearly ? '' : '. -1 is the last day'}.`}
                    </span>
                  )}
                  {draft.on === 'weekday' && (
                    <div className="oh-inline">
                      <span>The</span>
                      <select
                        className="oh-input"
                        aria-label="Which week"
                        value={draft.weeks[0]}
                        onChange={e => update({ weeks: [e.target.value] })}
                      >
                        {WEEK_OPTIONS.map(option => (
                          <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                      </select>
                      <select
                        className="oh-input"
                        aria-label="Weekday"
                        value={draft.day}
                        onChange={e => update({ day: e.target.value })}
                      >
                        {DAYS.map(day => <option key={day} value={day}>{day}</option>)}
                      </select>
                      {isYearly ? (
                        <span className="oh-inline">
                          <span>of</span>
                          <MonthSelect value={draft.month} onChange={month => update({ month })} />
                        </span>
                      ) : <span>of every month</span>}
                    </div>
                  )}
                  {draft.on === 'month' && (
                    <div className="oh-inline">
                      <span>All of</span>
                      <MonthSelect value={draft.month} onChange={month => update({ month })} />
                    </div>
                  )}
                </div>
              )}

              <label htmlFor={`${id}-name`} className="oh-label">
                Name <span className="oh-optional">(optional)</span>
              </label>
              <input
                id={`${id}-name`}
                className="oh-input oh-dialog-name"
                placeholder="e.g. Thanksgiving"
                value={name}
                onChange={e => setName(e.target.value)}
              />
            </div>

            {!isOnce && (
              <div className="oh-more">
                <span className="oh-label">More options</span>
                <div className="oh-two">
                  <label htmlFor={`${id}-from`} className="oh-note">
                    Starting
                    <input
                      id={`${id}-from`}
                      type="date"
                      className="oh-input"
                      value={draft.validFrom}
                      onChange={e => update({ validFrom: e.target.value })}
                    />
                  </label>
                  <label htmlFor={`${id}-to`} className="oh-note">
                    Until
                    <input
                      id={`${id}-to`}
                      type="date"
                      className="oh-input"
                      aria-invalid={!!closureDateError}
                      aria-describedby={closureDateError ? `${id}-to-error` : undefined}
                      value={draft.validTo}
                      onChange={e => update({ validTo: e.target.value })}
                    />
                  </label>
                </div>
                {closureDateError && (
                  <span id={`${id}-to-error`} className="oh-field-error">
                    <strong>! {closureDateError}</strong>
                  </span>
                )}
                <span className="oh-help">
                  “Open anyway” dates: when this closure doesn’t apply.
                </span>
                <div className="oh-chips">
                  {draft.exdates.map(date => (
                    <span key={date} className="oh-skip-pill">
                      {moment(date).format('MMM D, YYYY')}
                      <button
                        type="button"
                        aria-label={`Remove open anyway date ${moment(date).format('MMM D, YYYY')}`}
                        onClick={() => update({ exdates: draft.exdates.filter(d => d !== date) })}
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                  <DateAction
                    label="+ Add a date"
                    action="Add"
                    isDisabled={date => draft.exdates.includes(date)}
                    onSubmit={date => update({ exdates: [...draft.exdates, date].sort() })}
                  />
                </div>
              </div>
            )}
          </div>

          <div className={`oh-preview${isSpecialHours ? ' is-special' : ''}`} aria-live="polite">
            <span className="oh-th">Preview</span>
            {hasError && (
              <span className="oh-preview-note">Finish the details to see when this applies.</span>
            )}
            {!hasError && isOnce && (
              <>
                <span className="oh-preview-rule">
                  {special.closed ? '✕' : '★'} {describeSpecialTimes(special)}
                </span>
                <div className="oh-preview-dates">
                  <span className="oh-label">When</span>
                  <span>{describeSpecialDates(special)}</span>
                </div>
                <span className="oh-preview-note">Replaces everything else on those dates.</span>
              </>
            )}
            {!hasError && !isOnce && (
              <>
                <span className="oh-preview-rule">
                  ✕ Closed {lowerFirst(describeClosureRule(draft))}.
                </span>
                <div className="oh-preview-dates">
                  <span className="oh-label">
                    {nextDates.length ? nextLabel : 'No upcoming dates'}
                  </span>
                  {nextDates.map(date => <span key={date}>{formatNext(date)}</span>)}
                </div>
                <span className="oh-preview-note">Replaces the regular hours on those days.</span>
              </>
            )}
          </div>
        </div>

        <div className="oh-dialog-foot">
          <span className="oh-flex" />
          <button type="button" className="oh-btn" onClick={onCancel}>Cancel</button>
          <button type="submit" className="oh-btn oh-primary oh-wide" disabled={hasError}>
            {isNew ? addLabel : 'Save changes'}
          </button>
        </div>
      </form>
    </div>
  );
}

ExceptionDialog.propTypes = {
  kind: PropTypes.oneOf(['closure', 'special']).isRequired,
  // The closure or special hours to start from.
  value: PropTypes.shape({ description: PropTypes.string }).isRequired,
  isNew: PropTypes.bool.isRequired,
  // YYYY-MM-DD
  today: PropTypes.string.isRequired,
  // ({ kind, value })
  onSave: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};

export default ExceptionDialog;
