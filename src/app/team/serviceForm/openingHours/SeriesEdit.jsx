import React, { useState } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';

import Button from '../../../../components/button';
import Input from '../../../../components/input';
import Icon from '../../../../components/icon';
import { DAYS } from '../../../../Constants';
import {
  WEEK_OPTIONS, MONTHS, sortDays, sortWeeks, describeCard, getCardError, updateCard,
  setCardDays, updateRange, addRange, removeRange, removeRangeOnDay, removeCard, splitCard,
  skipCardDate, unskipCardDate, mergeCardRanges,
} from './recurrence';

export const ERROR_STYLE = { color: '#A02733', fontSize: '0.8em' };
const HINT_STYLE = { fontSize: '.85em', color: '#666' };
const LABEL_STYLE = { minWidth: '6em', display: 'inline-block' };

const chipStyle = (selected, small) => ({
  border: '1px solid #333',
  borderRadius: '1em',
  padding: small ? '0 .45em' : '.1em .7em',
  fontSize: small ? '.75em' : undefined,
  marginRight: '.3em',
  marginBottom: '.3em',
  background: selected ? '#333' : 'white',
  color: selected ? 'white' : '#333',
  cursor: 'pointer',
});

export function Chip({
  selected, onClick, children, small, title,
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      title={title}
      style={chipStyle(selected, small)}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

Chip.propTypes = {
  selected: PropTypes.bool.isRequired,
  onClick: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired,
  small: PropTypes.bool,
  title: PropTypes.string,
};

Chip.defaultProps = { small: false, title: undefined };

const formatShort = ({ opensAt, closesAt }) => `${opensAt || '?'}–${closesAt || '?'}`;

const toggle = (items, item) => (items.includes(item)
  ? items.filter(other => other !== item)
  : [...items, item]);

// One card of repeating hours, edited like a Google Calendar event's custom recurrence: which
// days, the time ranges on them (several for a lunch break), how often it repeats, in which
// months, when it starts (what "every 2 weeks" counts from) and ends, and the dates it skips.
// Every edit goes through `onEdit(operation, ...args)` from recurrence.js, and the cards are
// regrouped afterwards: taking a range off one day gives that day its own card.
function SeriesEdit({ card, index, onEdit }) {
  const [skipDate, setSkipDate] = useState('');
  const [splitDate, setSplitDate] = useState('');
  const id = name => `series-${index}-${name}`;
  const isMonthly = card.freq === 'MONTHLY';
  const byMonthDay = isMonthly && card.monthDays !== '';
  const error = getCardError(card);

  return (
    <div className="border rounded p-2 mb-2">
      <div className="d-flex justify-content-between align-items-start mb-2">
        <strong>{describeCard(card)}</strong>
        <button
          type="button"
          className="default"
          aria-label="Remove these hours"
          onClick={() => onEdit(removeCard)}
        >
          <Icon name="trash" />
        </button>
      </div>

      <div className="mb-2">
        <label htmlFor={id('interval')} style={LABEL_STYLE}>Repeat every</label>
        <input
          id={id('interval')}
          type="number"
          min="1"
          style={{ width: '4em', marginRight: '.5em' }}
          value={card.interval}
          onChange={e => onEdit(updateCard, { interval: Math.max(1, Number(e.target.value) || 1) })}
        />
        <select
          aria-label="Repeat unit"
          value={card.freq}
          onChange={e => onEdit(updateCard, { freq: e.target.value, weeks: [], monthDays: '' })}
        >
          <option value="WEEKLY">{card.interval > 1 ? 'weeks' : 'week'}</option>
          <option value="MONTHLY">{card.interval > 1 ? 'months' : 'month'}</option>
        </select>
      </div>

      {isMonthly && (
        <div className="mb-2">
          <label className="mr-3" htmlFor={id('by-week')}>
            <input
              id={id('by-week')}
              type="radio"
              checked={!byMonthDay}
              onChange={() => onEdit(updateCard, { monthDays: '' })}
            />{' '}On weeks of the month
          </label>
          <label htmlFor={id('by-day')}>
            <input
              id={id('by-day')}
              type="radio"
              checked={byMonthDay}
              onChange={() => onEdit(updateCard, { monthDays: '1', weeks: [] })}
            />{' '}On days of the month
          </label>
          {byMonthDay ? (
            <div>
              <Input
                id={id('month-days')}
                placeholder="e.g. 1,15 or -1 for the last day"
                value={card.monthDays}
                onChange={e => onEdit(updateCard, { monthDays: e.target.value.replace(/\s/g, '') })}
              />
            </div>
          ) : (
            <div>
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
        </div>
      )}

      {!byMonthDay && (
        <div className="mb-2">
          <span style={LABEL_STYLE}>On</span>
          {DAYS.map(day => (
            <Chip
              key={day}
              selected={card.days.includes(day)}
              onClick={() => onEdit(setCardDays, sortDays(toggle(card.days, day)))}
            >
              {day.slice(0, 3)}
            </Chip>
          ))}
        </div>
      )}

      <div className="mb-2">
        <div>Hours</div>
        {card.ranges.map((range, i) => (
          <div
            // eslint-disable-next-line react/no-array-index-key
            key={i}
            className="d-flex align-items-center flex-wrap mb-1"
          >
            <Input
              type="time"
              value={range.opensAt}
              onChange={e => onEdit(updateRange, i, { opensAt: e.target.value })}
            />
            <span style={{ padding: '0 .5em' }}>to</span>
            <Input
              type="time"
              value={range.closesAt}
              onChange={e => onEdit(updateRange, i, { closesAt: e.target.value })}
            />
            {range.opensAt && range.closesAt && range.closesAt < range.opensAt && (
              <span style={{ padding: '0 .5em' }}>next day</span>
            )}
            <span style={{ flex: '1 1 12em', margin: '0 .5em' }}>
              <Input
                fluid
                value={range.description}
                placeholder="Note (optional), e.g. Please arrive by 5 PM."
                onChange={e => onEdit(updateRange, i, { description: e.target.value })}
              />
            </span>
            {card.days.length > 1 && (
              <span title="Click a day to drop this time range on it">
                {card.days.map(day => (
                  <Chip
                    key={day}
                    small
                    selected
                    title={`Drop ${formatShort(range)} on ${day}s`}
                    onClick={() => onEdit(removeRangeOnDay, i, day)}
                  >
                    {day.slice(0, 2)}
                  </Chip>
                ))}
              </span>
            )}
            {card.ranges.length > 1 && (
              <button
                type="button"
                className="default"
                aria-label="Remove this time range"
                onClick={() => onEdit(removeRange, i)}
              >
                <Icon name="trash" />
              </button>
            )}
          </div>
        ))}
        <Button basic primary compact onClick={() => onEdit(addRange)}>
          + ADD A TIME RANGE (E.G. AFTER A LUNCH BREAK)
        </Button>
      </div>

      <div className="mb-2">
        <span style={LABEL_STYLE}>Months</span>
        {MONTHS.map((month, i) => (
          <Chip
            key={month}
            small
            selected={card.months.includes(String(i + 1))}
            onClick={() => onEdit(updateCard, {
              months: toggle(card.months, String(i + 1)).sort((x, y) => x - y),
            })}
          >
            {month.slice(0, 3)}
          </Chip>
        ))}
        <span style={HINT_STYLE}>{card.months.length ? '' : 'All year'}</span>
      </div>

      <div className="mb-2 d-flex align-items-center flex-wrap">
        <label htmlFor={id('starts')} style={LABEL_STYLE}>Starts</label>
        <Input
          id={id('starts')}
          type="date"
          value={card.validFrom}
          onChange={e => onEdit(updateCard, { validFrom: e.target.value })}
        />
        <span style={{ ...HINT_STYLE, paddingLeft: '.5em' }}>
          {card.interval > 1
            ? `"Every ${card.interval}" counts from this date`
            : 'Optional: leave empty if these hours already apply'}
        </span>
      </div>

      <div className="mb-2 d-flex align-items-center flex-wrap">
        <span style={LABEL_STYLE}>Ends</span>
        <label className="mr-3" htmlFor={id('never')}>
          <input
            id={id('never')}
            type="radio"
            checked={!card.validTo}
            onChange={() => onEdit(updateCard, { validTo: '' })}
          />{' '}Never
        </label>
        <label className="mr-2" htmlFor={id('ends-on')}>
          <input
            id={id('ends-on')}
            type="radio"
            checked={!!card.validTo}
            onChange={() => onEdit(updateCard, {
              validTo: card.validFrom || moment().format('YYYY-MM-DD'),
            })}
          />{' '}On
        </label>
        {!!card.validTo && (
          <Input
            id={id('ends-date')}
            type="date"
            value={card.validTo}
            onChange={e => onEdit(updateCard, { validTo: e.target.value })}
          />
        )}
      </div>

      <div className="mb-2">
        <label htmlFor={id('skip-date')} style={LABEL_STYLE}>Skips</label>
        {card.exdates.map(date => (
          <Chip key={date} selected onClick={() => onEdit(unskipCardDate, date)}>
            {moment(date).format('MMM D, YYYY')} ×
          </Chip>
        ))}
        <span className="d-inline-flex align-items-center">
          <Input
            id={id('skip-date')}
            type="date"
            value={skipDate}
            onChange={e => setSkipDate(e.target.value)}
          />
          <Button
            basic
            primary
            disabled={!skipDate || card.exdates.includes(skipDate)}
            onClick={() => {
              onEdit(skipCardDate, skipDate);
              setSkipDate('');
            }}
          >
            SKIP DATE
          </Button>
        </span>
      </div>

      <div className="mb-1 d-flex align-items-center flex-wrap">
        <label htmlFor={id('split-date')} style={{ ...HINT_STYLE, marginRight: '.5em' }}>
          New hours from a date on?
        </label>
        <Input
          id={id('split-date')}
          type="date"
          value={splitDate}
          onChange={e => setSplitDate(e.target.value)}
        />
        <Button
          basic
          primary
          disabled={!splitDate || (!!card.validFrom && splitDate <= card.validFrom)}
          onClick={() => {
            onEdit(splitCard, splitDate);
            setSplitDate('');
          }}
        >
          CHANGE FROM THIS DATE
        </Button>
      </div>

      {error && (
        <div style={ERROR_STYLE}>
          {error.message}{' '}
          {error.canMerge && (
            <Button basic primary compact onClick={() => onEdit(mergeCardRanges)}>
              MAKE THEM ONE RANGE
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

SeriesEdit.propTypes = {
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
  index: PropTypes.number.isRequired,
  onEdit: PropTypes.func.isRequired,
};

export default SeriesEdit;
