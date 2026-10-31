import React, { useState } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';

import Button from '../../../../components/button';
import {
  applySchedule, toApiRow, formatTime, formatRange, groupAtoms, describeRepeat,
  describeClosure, describeSpecialHours, nyToday,
} from './recurrence';
import {
  addDays, isoWeekday, intervalsOn, occursOn, closesOn, coversDate,
} from './scheduleRules';

const WEEKDAY_HEADERS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const CELL_STYLE = {
  verticalAlign: 'top',
  border: '1px solid #ddd',
  padding: '.2em',
  height: '4.5em',
  width: '14%',
  fontSize: '.75em',
};
const CELL_BUTTON_STYLE = {
  display: 'block',
  width: '100%',
  height: '100%',
  padding: 0,
  border: 'none',
  background: 'none',
  textAlign: 'left',
  font: 'inherit',
  cursor: 'pointer',
};
const COLORS = { open: '#e3f4e1', closure: '#fbe3e1', selected: '#fff3c4' };

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

// A month calendar of the hours the schedule gives, so the street team can see what they
// entered. Clicking a date lists what falls on it, where one occurrence of repeating hours, or
// one year of a closure that repeats, can be skipped without touching the rest.
function SchedulePreview({
  schedule, onEditCard, onSkipClosure, viewMode, today: todayProp,
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
  const struck = isStruck => ({ textDecoration: isStruck ? 'line-through' : 'none' });

  return (
    <div className="mb-3">
      <div className="d-flex justify-content-between align-items-center mb-1">
        <Button basic primary compact onClick={() => shiftMonth(-1)}>‹</Button>
        <strong>{moment(first).format('MMMM YYYY')}</strong>
        <Button basic primary compact onClick={() => shiftMonth(1)}>›</Button>
      </div>
      <table style={{ width: '100%', tableLayout: 'fixed', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            {WEEKDAY_HEADERS.map(day => <th key={day} style={{ fontSize: '.75em' }}>{day}</th>)}
          </tr>
        </thead>
        <tbody>
          {weeks.map(week => (
            <tr key={week[0]}>
              {week.map((date) => {
                const intervals = intervalsOn(rows, date);
                const isSpecial = rows.some(row => coversDate(row, date));
                const isClosure = !isSpecial && rows.some(row => closesOn(row, date));
                const isSkipped = schedule.atoms.some(atom => atom.exdates.includes(date)) ||
                  schedule.closures.some(closure => closure.exdates.includes(date));
                let background = 'white';
                if (intervals.length) background = COLORS.open;
                if (isClosure) background = COLORS.closure;
                if (date === selected) background = COLORS.selected;
                return (
                  <td
                    key={date}
                    style={{
                      ...CELL_STYLE,
                      opacity: date.startsWith(month) ? 1 : 0.4,
                      background,
                      outline: date === today ? '2px solid #333' : 'none',
                    }}
                  >
                    <button
                      type="button"
                      aria-pressed={date === selected}
                      onClick={() => select(date)}
                      style={CELL_BUTTON_STYLE}
                    >
                      <div>
                        {Number(date.slice(8))}
                        {isSpecial && <span title="Special hours"> ★</span>}
                        {isClosure && <span title="Closed (repeats)"> ✕</span>}
                        {isSkipped && <span title="Something skips this date"> ⊘</span>}
                      </div>
                      {intervals.map(interval => (
                        <div key={`${interval.open}-${interval.close}`}>
                          {formatInterval(interval)}
                        </div>
                      ))}
                    </button>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{ fontSize: '.75em' }} className="mt-1">
        ★ special hours · ✕ closure that repeats · ⊘ skipped
      </div>

      {details && (
        <div className="border rounded p-2 mt-2" style={{ fontSize: '.9em' }}>
          <strong>{moment(selected).format('dddd, MMMM D, YYYY')}</strong>
          {details.special.map(entry => (
            <div key={describeSpecialHours(entry)}>
              {describeSpecialHours(entry)} (replaces everything else that day)
            </div>
          ))}
          {details.closures.map(({ closure, index, skipped }) => (
            <div key={index} className="d-flex align-items-center justify-content-between">
              <span style={struck(skipped || details.special.length)}>
                Closed: {describeClosure(closure)}
              </span>
              {!viewMode && !details.special.length && (
                <Button
                  basic
                  primary
                  compact
                  onClick={() => onSkipClosure(index, selected, skipped)}
                >
                  {skipped ? 'CLOSE AS USUAL' : 'OPEN AS USUAL THIS TIME'}
                </Button>
              )}
            </div>
          ))}
          {details.series.map(({ card, skipped }) => {
            const replaced = details.special.length ||
              details.closures.some(({ skipped: closureSkipped }) => !closureSkipped);
            return (
              <div
                key={`${describeRepeat(card)}-${card.ranges.map(formatRange).join()}`}
                className="d-flex align-items-center justify-content-between"
              >
                <span style={struck(skipped || replaced)}>
                  {`${describeRepeat(card)}: `}
                  {card.ranges.map(formatRange).join(', ')}
                </span>
                {!viewMode && !replaced && (
                  <Button
                    basic
                    primary
                    compact
                    onClick={() => onEditCard(card, skipped ? 'unskip' : 'skip', selected)}
                  >
                    {skipped ? 'UNSKIP' : 'SKIP THIS DAY'}
                  </Button>
                )}
              </div>
            );
          })}
          {!details.special.length && !details.closures.length && !details.series.length && (
            <div>Closed</div>
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
  viewMode: PropTypes.bool,
  // YYYY-MM-DD, New York's today by default.
  today: PropTypes.string,
};

SchedulePreview.defaultProps = {
  onEditCard: () => {},
  onSkipClosure: () => {},
  viewMode: false,
  today: null,
};

export default SchedulePreview;
