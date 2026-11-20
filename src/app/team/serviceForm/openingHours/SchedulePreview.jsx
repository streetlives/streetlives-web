import React, { useState } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';

import {
  applySchedule, toApiRow, formatTime, formatRange, groupAtoms, describeRepeat,
  describeClosure, describeSpecialHours, nyToday,
} from './recurrence';
import {
  addDays, isoWeekday, intervalsOn, occursOn, closesOn, coversDate,
} from './scheduleRules';

const WEEKDAY_HEADERS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const rowsOf = schedule => applySchedule(schedule).map(toApiRow);
const without = (list, item) => list.filter(other => other !== item);

// "9AM–5PM", with overnight hours ending "(+1)".
const formatInterval = ({ open, close }) => {
  const time = minutes =>
    formatTime(moment.utc(0).add(minutes % (24 * 60), 'minutes').format('HH:mm'));
  return `${time(open)}–${time(close)}${close > 24 * 60 ? ' (+1)' : ''}`;
};

// What one date looks like: the special hours on it, the closures that fall on it (or skip
// it), and each card that falls on it (or skips it).
function describeDate(schedule, date) {
  const cards = groupAtoms(schedule.atoms);
  const special = schedule.specialHours.filter(entry => rowsOf({ atoms: [], specialHours: [entry] })
    .some(row => coversDate(row, date)));
  const closureOn = (closure, skips) =>
    rowsOf({ atoms: [], closures: [{ ...closure, exdates: skips }] })
      .some(row => closesOn(row, date));
  const closures = schedule.closures
    .map((closure, index) => ({
      closure,
      index,
      closes: closureOn(closure, closure.exdates),
      skipped: closure.exdates.includes(date) && closureOn(closure, without(closure.exdates, date)),
    }))
    .filter(({ closes, skipped }) => closes || skipped);
  const cardOn = (card, skips) =>
    rowsOf({ atoms: card.atoms.map(atom => ({ ...atom, exdates: skips })) })
      .some(row => occursOn(row, date));
  const series = cards
    .map(card => ({
      card,
      occurs: cardOn(card, card.exdates),
      skipped: card.exdates.includes(date) && cardOn(card, without(card.exdates, date)),
    }))
    .filter(({ occurs, skipped }) => occurs || skipped);
  return { special, closures, series };
}

// What a date shows in the calendar: its look, its marker, and a sentence for screen readers.
function dayKind({
  intervals, isSpecial, isClosure, isSkipped,
}) {
  if (isSpecial) return { kind: 'special', marker: '★', text: 'special hours' };
  if (isClosure) return { kind: 'closure', marker: '✕', text: 'closed (repeating closure)' };
  if (isSkipped && !intervals.length) return { kind: 'skip', marker: '⊘', text: 'skipped, closed' };
  if (intervals.length) return { kind: 'open', marker: isSkipped ? '⊘' : '', text: 'open' };
  return { kind: 'closed', marker: '', text: 'closed' };
}

// Why a card's hours don't apply on the selected date.
function notUsedBecause(details, skipped) {
  if (details.special.length) return 'Not used this day. Special hours replace it.';
  const closure = details.closures.find(({ skipped: closureSkipped }) => !closureSkipped);
  if (closure) {
    const label = closure.closure.description;
    return `Not used this day. Closed${label ? ` for ${label}` : ''}.`;
  }
  return skipped ? 'Skipped this day.' : '';
}

// A month calendar of the hours the schedule gives, so the street team can see what they
// entered. Clicking a date lists what falls on it, where one occurrence of repeating hours, or
// one year of a closure that repeats, can be skipped without touching the rest.
function SchedulePreview({
  schedule, onEditCard, onSkipClosure, onAddSpecialHours, viewMode, today: todayProp,
}) {
  const today = todayProp || nyToday();
  const [month, setMonth] = useState(today.slice(0, 7));
  const [selected, setSelected] = useState(null);

  const first = `${month}-01`;
  const gridStart = addDays(first, -(isoWeekday(first) % 7));
  const weeks = [...Array(6)].map((_, week) => [...Array(7)]
    .map((__, day) => addDays(gridStart, (week * 7) + day)))
    .filter(week => week.some(date => date.startsWith(month)));
  const rows = rowsOf(schedule);
  const shiftMonth = n => setMonth(moment(`${month}-01`).add(n, 'months').format('YYYY-MM'));
  const details = selected && describeDate(schedule, selected);
  const select = date => setSelected(date === selected ? null : date);

  return (
    <div className="oh-calendar">
      <div className="oh-calendar-head">
        <h2 className="oh-flex">{moment(first).format('MMMM YYYY')}</h2>
        {month !== today.slice(0, 7) && (
          <button type="button" className="oh-link" onClick={() => setMonth(today.slice(0, 7))}>
            Today
          </button>
        )}
        <button
          type="button"
          aria-label="Previous month"
          className="oh-icon-btn oh-outlined"
          onClick={() => shiftMonth(-1)}
        >
          ‹
        </button>
        <button
          type="button"
          aria-label="Next month"
          className="oh-icon-btn oh-outlined"
          onClick={() => shiftMonth(1)}
        >
          ›
        </button>
      </div>
      <div className="oh-calendar-grid oh-weekdays" aria-hidden="true">
        {WEEKDAY_HEADERS.map(day => <span key={day}>{day}</span>)}
      </div>
      <div className="oh-calendar-grid">
        {weeks.flat().map((date) => {
          const intervals = intervalsOn(rows, date);
          const isSpecial = rows.some(row => coversDate(row, date));
          const isClosure = !isSpecial && rows.some(row => closesOn(row, date));
          const isSkipped = schedule.atoms.some(atom => atom.exdates.includes(date)) ||
            schedule.closures.some(closure => closure.exdates.includes(date));
          const { kind, marker, text } = dayKind({
            intervals, isSpecial, isClosure, isSkipped,
          });
          const hours = intervals.map(formatInterval).join(', ');
          const label = [
            `${DAY_NAMES[isoWeekday(date) % 7]}, ${moment(date).format('MMM D')}: ${text}`,
            hours,
            date === today ? '(today)' : '',
          ].filter(Boolean).join(' ');
          const classes = ['oh-cal-day', `is-${kind}`];
          if (!date.startsWith(month)) classes.push('is-outside');
          if (date === today) classes.push('is-today');
          if (date === selected) classes.push('is-selected');
          return (
            <button
              key={date}
              type="button"
              className={classes.join(' ')}
              aria-pressed={date === selected}
              aria-label={label}
              onClick={() => select(date)}
            >
              <span className="oh-cal-top">
                <span>{Number(date.slice(8))}</span>
                <span>{marker}</span>
              </span>
              {intervals.map(interval => (
                <span key={`${interval.open}-${interval.close}`} className="oh-cal-hours">
                  {formatInterval(interval)}
                </span>
              ))}
            </button>
          );
        })}
      </div>
      <div className="oh-legend">
        <span><span className="oh-swatch is-open" />Open</span>
        <span><span className="oh-swatch is-closed" />Closed</span>
        <span>★ Special</span>
        <span>✕ Repeating closure</span>
        <span>⊘ Skipped</span>
        <span><span className="oh-swatch is-today" />Today</span>
      </div>

      {details && (
        <div className="oh-day-panel">
          <h3>{moment(selected).format('dddd, MMM D, YYYY')}</h3>
          {details.special.map(entry => (
            <div key={describeSpecialHours(entry)} className="oh-day-item is-special">
              <span className="oh-flex">
                <strong>★ {describeSpecialHours(entry)}</strong>
                <span>Replaces everything else that day.</span>
              </span>
            </div>
          ))}
          {details.closures.map(({ closure, index, skipped }) => (
            <div
              key={index}
              className={`oh-day-item ${
                skipped || details.special.length ? 'is-struck' : 'is-closure'
              }`}
            >
              <span className="oh-flex">
                <strong>✕ Closed{closure.description ? ` · ${closure.description}` : ''}</strong>
                <span>{describeClosure(closure)}</span>
              </span>
              {!viewMode && !details.special.length && (
                <button
                  type="button"
                  className="oh-btn oh-small"
                  onClick={() => onSkipClosure(index, selected, skipped)}
                >
                  {skipped ? 'Close as usual' : 'Open as usual this time'}
                </button>
              )}
            </div>
          ))}
          {details.series.map(({ card, skipped }) => {
            const replaced = details.special.length ||
              details.closures.some(({ skipped: closureSkipped }) => !closureSkipped);
            const reason = notUsedBecause(details, skipped);
            return (
              <div
                key={`${describeRepeat(card)}-${card.ranges.map(formatRange).join()}`}
                className={`oh-day-item${skipped || replaced ? ' is-struck' : ''}`}
              >
                <span className="oh-flex">
                  <span className="oh-strike-text">
                    {`${describeRepeat(card)}: `}
                    {card.ranges.map(formatRange).join(', ')}
                  </span>
                  {(skipped || replaced) && <span>{reason}</span>}
                </span>
                {!viewMode && !replaced && (
                  <button
                    type="button"
                    className="oh-btn oh-small"
                    onClick={() => onEditCard(card, skipped ? 'unskip' : 'skip', selected)}
                  >
                    {skipped ? 'Unskip' : 'Skip this day'}
                  </button>
                )}
              </div>
            );
          })}
          {!details.special.length && !details.closures.length && !details.series.length && (
            <div className="oh-muted">Closed</div>
          )}
          {!viewMode && !details.special.length && (
            <button
              type="button"
              className="oh-btn oh-dashed"
              onClick={() => onAddSpecialHours(selected)}
            >
              + Add special hours for this day
            </button>
          )}
        </div>
      )}
    </div>
  );
}

SchedulePreview.propTypes = {
  schedule: PropTypes.shape({
    atoms: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
    closures: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
    specialHours: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  }).isRequired,
  // (card, 'skip' | 'unskip', date)
  onEditCard: PropTypes.func,
  // (closure index, date, whether it's skipped already)
  onSkipClosure: PropTypes.func,
  // (date)
  onAddSpecialHours: PropTypes.func,
  viewMode: PropTypes.bool,
  // YYYY-MM-DD, New York's today by default.
  today: PropTypes.string,
};

SchedulePreview.defaultProps = {
  onEditCard: () => {},
  onSkipClosure: () => {},
  onAddSpecialHours: () => {},
  viewMode: false,
  today: null,
};

export default SchedulePreview;
