import React, { useRef, useState } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';

import {
  WEEK_OPTIONS, MONTHS, sortWeeks, describeRepeat, formatRange, getCardErrors,
  updateCard, setCardDays, updateRange, addRange, removeRange, removeCard,
  mergeCardRanges, upcomingDates,
} from './recurrence';
import {
  Chip, Segmented, TimeInput, NextDayTag, TrashIcon, useId, useModal, focusFirstProblem,
  useFocusNext,
} from './controls';

const MONTH_DAYS = Array.from({ length: 31 }, (_, i) => String(i + 1));
const LAST_DAY = '-1';

const toggle = (items, item) => (items.includes(item)
  ? items.filter(other => other !== item)
  : [...items, item]);

// Days of the month in order, with days counted from the end ("-1") last.
const sortMonthDays = days => [...days].sort((a, b) => {
  const [x, y] = [Number(a), Number(b)];
  if ((x < 0) !== (y < 0)) return x < 0 ? 1 : -1;
  return x < 0 ? y - x : x - y;
});

const formatDate = date => moment(date).format('ddd, MMM D, YYYY');

function FieldError({ error, id }) {
  if (!error) return null;
  return (
    <span id={id} className="oh-field-error">
      <strong>! {error.message}</strong>
    </span>
  );
}

FieldError.propTypes = {
  error: PropTypes.shape({ message: PropTypes.string }),
  id: PropTypes.string,
};

// One card of repeating hours, edited in a drawer while the week stays in view: its time
// ranges on the left, how it repeats on the right, as in a Google Calendar event's custom
// recurrence. Every edit goes through `onEdit(operation, ...args)` from recurrence.js. Problems
// show next to their fields, and Done waits until they're fixed; Cancel undoes every edit made
// since the drawer opened.
function PatternDrawer({
  card, weekdays, onEdit, onDone, onCancel, today,
}) {
  const ref = useRef(null);
  const titleId = useId('drawer-title');
  const isMonthly = card.freq === 'MONTHLY';
  const byMonthDay = isMonthly && card.monthDays !== '';
  const errors = getCardErrors(card);
  const errorOn = field => errors.find(error => error.field === field);
  const monthDays = card.monthDays.split(',').filter(Boolean);
  const ranges = card.ranges.map(formatRange).join(', ');
  // The last day picked stays: no days of the month would mean weeks of the month instead.
  const toggleMonthDay = (day) => {
    const next = toggle(monthDays, day);
    if (next.length) onEdit(updateCard, { monthDays: sortMonthDays(next).join(',') });
  };
  // Days of the month have no weekday, so leaving them goes back to `weekdays`.
  const leaveMonthDays = changes => onEdit((atoms, current) =>
    setCardDays(atoms, { ...current, ...changes, monthDays: '' }, weekdays));

  // No months picked means all year, so all year shows every month picked. Turning every month
  // back on goes back to all year, and the last month can't be turned off.
  const allYear = !card.months.length;
  const toggleMonth = (month) => {
    const next = toggle(allYear ? MONTHS.map((_, i) => String(i + 1)) : card.months, month);
    if (!next.length) return;
    onEdit(updateCard, {
      months: next.length === MONTHS.length ? [] : next.sort((x, y) => x - y),
    });
  };
  const [confirmRemove, setConfirmRemove] = useState(false);
  const [focusNext, isNext] = useFocusNext();

  useModal(ref, onCancel);

  return (
    <div className="oh-overlay">
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="oh-drawer"
      >
        <div className="oh-drawer-head">
          <div className="oh-flex">
            <span className="oh-th">Edit hours</span>
            <h2 id={titleId}>{`${describeRepeat(card)}: ${ranges}`}</h2>
          </div>
          <button
            type="button"
            aria-label="Close drawer"
            className="oh-icon-btn"
            onClick={onCancel}
          >
            ✕
          </button>
        </div>

        <div className="oh-drawer-body">
          <div className="oh-stack">
            <div className="oh-field">
              <span className="oh-label">Hours</span>
              <div className={`oh-box${errorOn('ranges') ? ' is-invalid' : ''}`}>
                {card.ranges.map((range, i) => (
                  // eslint-disable-next-line react/no-array-index-key
                  <div key={i} className="oh-stack-sm oh-range-block">
                    {card.ranges.length > 1 && (
                      <div className="oh-range-head">
                        <span className="oh-label">Range {i + 1}</span>
                        <button
                          type="button"
                          className="oh-icon-btn"
                          aria-label={`Remove range ${i + 1}`}
                          onClick={() => onEdit(removeRange, i)}
                        >
                          <TrashIcon />
                        </button>
                      </div>
                    )}
                    <div className="oh-drawer-range">
                      <TimeInput
                        label={`Range ${i + 1} opens`}
                        value={range.opensAt}
                        invalid={!range.opensAt}
                        focusOnMount={isNext(i)}
                        onChange={opensAt => onEdit(updateRange, i, { opensAt })}
                      />
                      <span>to</span>
                      <TimeInput
                        label={`Range ${i + 1} closes`}
                        value={range.closesAt}
                        invalid={!range.closesAt}
                        onChange={closesAt => onEdit(updateRange, i, { closesAt })}
                      />
                    </div>
                    <NextDayTag range={range} />
                    <label className="oh-note" htmlFor={`${titleId}-note-${i}`}>
                      Note shown to clients (optional)
                      <input
                        id={`${titleId}-note-${i}`}
                        className="oh-input"
                        placeholder="e.g. Please arrive by 1 PM"
                        value={range.description}
                        onChange={e => onEdit(updateRange, i, { description: e.target.value })}
                      />
                    </label>
                  </div>
                ))}
                {errorOn('ranges') && (
                  <div role="alert" className="oh-alert">
                    <FieldError error={errorOn('ranges')} />
                    {errorOn('ranges').canMerge && (
                      <button
                        type="button"
                        className="oh-btn oh-danger"
                        onClick={() => onEdit(mergeCardRanges)}
                      >
                        Make them one range
                      </button>
                    )}
                  </div>
                )}
              </div>
              <button
                type="button"
                className="oh-link oh-start"
                onClick={() => {
                  focusNext(card.ranges.length);
                  onEdit(addRange);
                }}
              >
                + Add a time range (like a lunch break)
              </button>
            </div>

            {!errors.length && (
              <div className="oh-next-dates">
                <span className="oh-label">Next dates with these hours</span>
                {upcomingDates(card, today).map(({ date, skipped }) => (
                  <span key={date} className={skipped ? 'oh-struck' : ''}>
                    {formatDate(date)}
                    {skipped ? ' · ⊘ Skipped' : ` · ${ranges}`}
                  </span>
                ))}
              </div>
            )}

            {confirmRemove ? (
              <div role="alert" className="oh-alert oh-confirm">
                <strong>{`Remove ${describeRepeat(card)}: ${ranges}?`}</strong>
                <span>These hours come off every day they repeat on.</span>
                <div className="oh-inline">
                  <button
                    type="button"
                    className="oh-btn oh-danger"
                    onClick={() => onEdit(removeCard)}
                  >
                    Remove
                  </button>
                  <button
                    type="button"
                    className="oh-btn oh-small"
                    onClick={() => setConfirmRemove(false)}
                  >
                    Keep them
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                className="oh-link oh-start oh-danger-link"
                onClick={() => setConfirmRemove(true)}
              >
                Remove these hours
              </button>
            )}
          </div>

          <div className="oh-stack oh-drawer-side">
            <span className="oh-drawer-subhead">Repeat settings</span>

            <div className="oh-field">
              <span className="oh-label">Repeats every</span>
              <div className="oh-inline">
                <input
                  type="number"
                  min="1"
                  aria-label="Repeat interval"
                  className="oh-input oh-number"
                  value={card.interval}
                  onChange={e => onEdit(updateCard, {
                    interval: Math.max(1, Number(e.target.value) || 1),
                  })}
                />
                <Segmented
                  label="Repeat unit"
                  value={card.freq}
                  options={[
                    { value: 'WEEKLY', label: card.interval > 1 ? 'Weeks' : 'Week' },
                    { value: 'MONTHLY', label: card.interval > 1 ? 'Months' : 'Month' },
                  ]}
                  onChange={(freq) => {
                    if (freq === card.freq) return;
                    if (byMonthDay) leaveMonthDays({ freq, weeks: [] });
                    else onEdit(updateCard, { freq, weeks: [], monthDays: '' });
                  }}
                />
              </div>
              {!isMonthly && (
                <span className="oh-help">
                  To repeat on certain weeks or days of the month, choose Month.
                </span>
              )}
              <FieldError error={errorOn('days')} />
            </div>

            {isMonthly && (
              <div className="oh-field">
                <span className="oh-label">Pick by</span>
                <Segmented
                  label="Pick by"
                  value={byMonthDay ? 'day' : 'week'}
                  options={[
                    { value: 'week', label: 'Week of month' },
                    { value: 'day', label: 'Day of month' },
                  ]}
                  onChange={by => (by === 'day'
                    ? !byMonthDay && onEdit(updateCard, { monthDays: '1', weeks: [] })
                    : byMonthDay && leaveMonthDays({}))}
                />
                {byMonthDay ? (
                  <div role="group" aria-label="Days of the month" className="oh-month-days">
                    {MONTH_DAYS.map(day => (
                      <Chip
                        key={day}
                        selected={monthDays.includes(day)}
                        onClick={() => toggleMonthDay(day)}
                      >
                        {day}
                      </Chip>
                    ))}
                    <span className="oh-last-day">
                      <Chip
                        selected={monthDays.includes(LAST_DAY)}
                        onClick={() => toggleMonthDay(LAST_DAY)}
                      >
                        Last day
                      </Chip>
                    </span>
                  </div>
                ) : (
                  <div role="group" aria-label="Weeks of the month" className="oh-chips">
                    {WEEK_OPTIONS.map(({ value, label }) => (
                      <Chip
                        key={value}
                        selected={card.weeks.includes(value)}
                        onClick={() => onEdit(updateCard, {
                          weeks: sortWeeks(toggle(card.weeks, value)),
                        })}
                      >
                        {label}
                      </Chip>
                    ))}
                  </div>
                )}
                <FieldError error={errorOn('weeks') || errorOn('monthDays')} />
              </div>
            )}

            <div className="oh-field">
              <span className="oh-split">
                <span className="oh-label">Months</span>
                <span className="oh-help">{allYear ? 'All year' : ''}</span>
              </span>
              <div role="group" aria-label="Months" className="oh-months">
                {MONTHS.map((month, i) => (
                  <Chip
                    key={month}
                    label={month}
                    selected={allYear || card.months.includes(String(i + 1))}
                    onClick={() => toggleMonth(String(i + 1))}
                  >
                    {month.slice(0, 3)}
                  </Chip>
                ))}
              </div>
              <span className="oh-help">
                For seasonal hours, turn off the months these hours skip.
              </span>
            </div>

            <div className="oh-two">
              <div className="oh-field">
                <label htmlFor={`${titleId}-starts`} className="oh-label">
                  Starts{' '}
                  {card.interval <= 1 && <span className="oh-optional">(optional)</span>}
                </label>
                <input
                  id={`${titleId}-starts`}
                  type="date"
                  className="oh-input"
                  aria-invalid={!!errorOn('validFrom')}
                  aria-describedby={errorOn('validFrom') ? `${titleId}-starts-error` : undefined}
                  value={card.validFrom}
                  onChange={e => onEdit(updateCard, { validFrom: e.target.value })}
                />
                <FieldError id={`${titleId}-starts-error`} error={errorOn('validFrom')} />
              </div>
              <div className="oh-field">
                <span className="oh-label">Ends</span>
                <Segmented
                  label="Ends"
                  value={card.validTo ? 'date' : 'never'}
                  options={[
                    { value: 'never', label: 'Never' },
                    { value: 'date', label: 'On a date' },
                  ]}
                  onChange={ends => onEdit(updateCard, {
                    validTo: ends === 'never' ? '' : card.validTo || card.validFrom || today,
                  })}
                />
                {!!card.validTo && (
                  <input
                    type="date"
                    aria-label="Ends on"
                    className="oh-input"
                    aria-invalid={!!errorOn('validTo')}
                    value={card.validTo}
                    onChange={e => onEdit(updateCard, { validTo: e.target.value })}
                  />
                )}
                <FieldError error={errorOn('validTo')} />
              </div>
            </div>
          </div>
        </div>

        <div className={`oh-drawer-foot${errors.length ? ' is-invalid' : ''}`}>
          {!!errors.length && (
            <>
              <span className="oh-problems">
                ! {errors.length} thing{errors.length === 1 ? '' : 's'} to fix before saving
              </span>
              <button
                type="button"
                className="oh-link"
                onClick={() => focusFirstProblem(ref.current)}
              >
                Go to first problem
              </button>
            </>
          )}
          <span className="oh-flex" />
          <button type="button" className="oh-btn" onClick={onCancel}>Cancel</button>
          <button
            type="button"
            className="oh-btn oh-primary oh-wide"
            disabled={!!errors.length}
            onClick={onDone}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

PatternDrawer.propTypes = {
  card: PropTypes.shape({
    days: PropTypes.arrayOf(PropTypes.string),
    ranges: PropTypes.arrayOf(PropTypes.shape({
      opensAt: PropTypes.string,
      closesAt: PropTypes.string,
      description: PropTypes.string,
    })),
    freq: PropTypes.oneOf(['WEEKLY', 'MONTHLY']),
    interval: PropTypes.number,
    weeks: PropTypes.arrayOf(PropTypes.string),
    monthDays: PropTypes.string,
    months: PropTypes.arrayOf(PropTypes.string),
    validFrom: PropTypes.string,
    validTo: PropTypes.string,
    exdates: PropTypes.arrayOf(PropTypes.string),
  }).isRequired,
  // The days the card had when the drawer opened.
  weekdays: PropTypes.arrayOf(PropTypes.string).isRequired,
  // (operation from recurrence.js, ...its arguments)
  onEdit: PropTypes.func.isRequired,
  onDone: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  today: PropTypes.string.isRequired,
};

export default PatternDrawer;
