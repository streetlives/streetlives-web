import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';

import { DAYS } from '../../../../Constants';
import {
  isPlainWeekly, dayCardOn, cardOnDay, setDayRanges, getCardError, mergeCardRanges, describeRepeat,
  describeDates, formatRange, cardKey, nextRange, copyDay,
} from './recurrence';
import {
  Switch, TimeInput, NextDayTag, TrashIcon, useFocusNext,
} from './controls';

const WEEKDAYS = DAYS.slice(0, 5);
const DEFAULT_RANGES = [{ opensAt: '09:00', closesAt: '17:00', description: '' }];

const formatSkip = date => moment(date).format('MMM D');

// Which days "Copy to…" offers ticked: the other weekdays, or the other weekend day.
const defaultTargets = day => (WEEKDAYS.includes(day)
  ? WEEKDAYS.filter(other => other !== day)
  : DAYS.slice(5).filter(other => other !== day));

function CopyPopover({
  day, ranges, onCopy, onClose,
}) {
  const [targets, setTargets] = useState(defaultTargets(day));
  const ref = useRef(null);
  const close = useRef(onClose);
  close.current = onClose;

  useEffect(() => {
    const popover = ref.current;
    popover.querySelector('input').focus();
    const closeOutside = (e) => {
      if (!popover.contains(e.target)) close.current(false);
    };
    const closeOnEscape = e => e.key === 'Escape' && close.current(true);
    document.addEventListener('mousedown', closeOutside);
    popover.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('mousedown', closeOutside);
      popover.removeEventListener('keydown', closeOnEscape);
    };
  }, []);

  const toggle = other => setTargets(targets.includes(other)
    ? targets.filter(d => d !== other)
    : [...targets, other]);

  return (
    <div
      ref={ref}
      role="dialog"
      aria-label={`Copy ${day}'s hours`}
      className="oh-popover"
    >
      <span><strong>Copy {ranges.map(formatRange).join(', ')}</strong> to</span>
      <div className="oh-popover-days">
        {DAYS.filter(other => other !== day).map(other => (
          <label key={other} htmlFor={`copy-${day}-${other}`}>
            <input
              id={`copy-${day}-${other}`}
              type="checkbox"
              checked={targets.includes(other)}
              onChange={() => toggle(other)}
            />
            {other}
          </label>
        ))}
      </div>
      <div className="oh-popover-actions">
        <button
          type="button"
          className="oh-link"
          onClick={() => setTargets(WEEKDAYS.filter(other => other !== day))}
        >
          Weekdays only
        </button>
        <span className="oh-flex" />
        <button type="button" className="oh-link" onClick={() => onClose(true)}>Cancel</button>
        <button
          type="button"
          className="oh-btn oh-primary"
          disabled={!targets.length}
          onClick={() => {
            onCopy(targets);
            onClose(true);
          }}
        >
          Copy to {targets.length} day{targets.length === 1 ? '' : 's'}
        </button>
      </div>
    </div>
  );
}

CopyPopover.propTypes = {
  day: PropTypes.string.isRequired,
  ranges: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  onCopy: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

// More hours on a day than its row shows, such as "1st and 3rd Sat of every month" on a day that
// also has weekly hours, or a card with no weekday.
function PatternLine({ card, onOpen }) {
  const notes = card.ranges.map(range => range.description).filter(Boolean);
  const dates = describeDates(card);
  const error = getCardError(card);
  return (
    <div className={`oh-pattern${error ? ' is-invalid' : ''}`}>
      <span className="oh-flex">
        <strong>↻ {describeRepeat(card)}</strong>
        {' · '}{card.ranges.map(formatRange).join(', ')}
        {dates && ` · ${dates}`}
        {notes.map(note => <span key={note} className="oh-muted"> · “{note}”</span>)}
        {error && <span className="oh-field-error"> ! {error.message}</span>}
      </span>
      <button type="button" className="oh-link" onClick={e => onOpen(card, e.currentTarget)}>
        Edit pattern
      </button>
    </div>
  );
}

PatternLine.propTypes = {
  card: PropTypes.shape({}).isRequired,
  onOpen: PropTypes.func.isRequired,
};

// The week as a table, one row per day: a switch, the day's time ranges, and actions that show
// on hover or focus. Each row is a view of the card that day belongs to (see dayCardOn), and
// says how it repeats unless that's every week; changing one day's hours gives it its own card
// (see setDayRanges). Any other cards on a day sit under its row, and open in the drawer to edit.
function WeekTable({ cards, onAtoms, onOpenCard }) {
  const [copyFrom, setCopyFrom] = useState(null);
  const copyButtons = useRef({});
  const [focusNext, isNext] = useFocusNext();

  const closeCopy = (restoreFocus) => {
    if (restoreFocus && copyButtons.current[copyFrom]) copyButtons.current[copyFrom].focus();
    setCopyFrom(null);
  };
  const setRanges = (day, ranges) => onAtoms(atoms => setDayRanges(atoms, day, ranges));
  const rangesOn = (day) => {
    const card = dayCardOn(cards, day);
    return card ? card.ranges : [];
  };
  // A day switched on takes the hours of the nearest open day before it.
  const switchOn = (day) => {
    focusNext(`${day}-0`);
    const before = DAYS.slice(0, DAYS.indexOf(day)).reverse().find(d => rangesOn(d).length);
    setRanges(day, before ? rangesOn(before) : DEFAULT_RANGES);
  };
  const patternsOn = day => cards.filter(card => card.days.includes(day) &&
    card !== dayCardOn(cards, day));
  const otherPatterns = cards.filter(card => !card.days.length);
  // A card's error shows once, on its first day.
  const shownErrors = new Set();

  return (
    <div className="oh-table">
      <div className="oh-week-row oh-thead">
        <span className="oh-th">Day</span>
        <span className="oh-th">Open</span>
        <span className="oh-th">Hours</span>
        <span className="oh-th oh-right">Actions</span>
      </div>
      {DAYS.map((day) => {
        const card = dayCardOn(cards, day);
        const ranges = card ? card.ranges : [];
        const open = ranges.length > 0;
        const dayPatterns = patternsOn(day);
        const skips = card ? card.exdates.filter(date => moment(date).format('dddd') === day) : [];
        const error = card && !shownErrors.has(card) && getCardError(card);
        if (error) shownErrors.add(card);
        const updateRange = (i, changes) =>
          setRanges(day, ranges.map((range, j) => (i === j ? { ...range, ...changes } : range)));

        return (
          <div key={day} className="oh-day">
            <div className={`oh-week-row oh-row${copyFrom === day ? ' is-active' : ''}`}>
              <span className="oh-day-name">{day}</span>
              <Switch
                checked={open}
                label={`Open on ${day}`}
                onChange={on => (on ? switchOn(day) : setRanges(day, []))}
              />
              <div className="oh-ranges">
                {!open && <span className="oh-muted">Closed</span>}
                {ranges.map((range, i) => (
                  // eslint-disable-next-line react/no-array-index-key
                  <div key={i} className="oh-range">
                    <TimeInput
                      label={`${day} opens${ranges.length > 1 ? ` (range ${i + 1})` : ''}`}
                      value={range.opensAt}
                      invalid={!range.opensAt}
                      focusOnMount={isNext(`${day}-${i}`)}
                      onChange={opensAt => updateRange(i, { opensAt })}
                    />
                    <span aria-hidden="true">–</span>
                    <TimeInput
                      label={`${day} closes${ranges.length > 1 ? ` (range ${i + 1})` : ''}`}
                      value={range.closesAt}
                      invalid={!range.closesAt}
                      onChange={closesAt => updateRange(i, { closesAt })}
                    />
                    <NextDayTag range={range} />
                    {ranges.length > 1 && (
                      <button
                        type="button"
                        className="oh-icon-btn"
                        aria-label={`Remove ${day}'s range ${i + 1}`}
                        onClick={() => setRanges(day, ranges.filter((_, j) => j !== i))}
                      >
                        <TrashIcon />
                      </button>
                    )}
                    {i === ranges.length - 1 && (
                      <button
                        type="button"
                        className="oh-link oh-reveal"
                        aria-label={`Add a time range on ${day}`}
                        onClick={() => {
                          focusNext(`${day}-${ranges.length}`);
                          setRanges(day, [...ranges, nextRange(ranges)]);
                        }}
                      >
                        + Range
                      </button>
                    )}
                    {range.description && <span className="oh-muted">“{range.description}”</span>}
                    {i === 0 && !!skips.length && (
                      <span className="oh-muted">⊘ Skipped {skips.map(formatSkip).join(', ')}</span>
                    )}
                  </div>
                ))}
                {open && !isPlainWeekly(card) && (
                  <span className="oh-muted">
                    ↻ {[describeRepeat(card), describeDates(card)].filter(Boolean).join(' · ')}
                  </span>
                )}
              </div>
              <div className="oh-row-actions">
                {open && (
                  <>
                    <button
                      type="button"
                      className="oh-link oh-reveal"
                      aria-expanded={copyFrom === day}
                      ref={(el) => { copyButtons.current[day] = el; }}
                      onClick={() => setCopyFrom(copyFrom === day ? null : day)}
                    >
                      Copy to…
                    </button>
                    <button
                      type="button"
                      className="oh-link oh-reveal"
                      aria-label={`Repeat settings for ${day}`}
                      onClick={e => onOpenCard(cardOnDay(card, day), e.currentTarget)}
                    >
                      Repeat settings
                    </button>
                  </>
                )}
              </div>
              {copyFrom === day && (
                <CopyPopover
                  day={day}
                  ranges={ranges}
                  onClose={closeCopy}
                  onCopy={targets => onAtoms(atoms => copyDay(atoms, day, targets))}
                />
              )}
            </div>
            {error && (
              <div className="oh-row-error oh-error" role="alert" tabIndex={-1}>
                <span className="oh-flex"><strong>!</strong> {error.message}</span>
                {error.canMerge && (
                  <button
                    type="button"
                    className="oh-link"
                    onClick={() => onAtoms(atoms => mergeCardRanges(atoms, card))}
                  >
                    Make them one range
                  </button>
                )}
              </div>
            )}
            {dayPatterns.map(pattern => (
              <PatternLine key={cardKey(pattern)} card={pattern} onOpen={onOpenCard} />
            ))}
          </div>
        );
      })}
      {!!otherPatterns.length && (
        <div className="oh-day">
          <div className="oh-week-row oh-row">
            <span className="oh-day-name">Other</span>
          </div>
          {otherPatterns.map(pattern => (
            <PatternLine key={cardKey(pattern)} card={pattern} onOpen={onOpenCard} />
          ))}
        </div>
      )}
    </div>
  );
}

WeekTable.propTypes = {
  cards: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  // (atoms => new atoms)
  onAtoms: PropTypes.func.isRequired,
  // (card, the element that opened it, to return focus to)
  onOpenCard: PropTypes.func.isRequired,
};

export default WeekTable;
