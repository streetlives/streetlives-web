import React, { Component } from 'react';
import moment from 'moment';

import Header from '../../../../components/header';
import Button from '../../../../components/button';
import Selector from '../../../../components/selector';
import { DAYS } from '../../../../Constants';
import OpeningHoursEditForm from './OpeningHoursEditForm';
import SpecialHoursEdit from './SpecialHoursEdit';
import SeriesEdit, { ERROR_STYLE } from './SeriesEdit';
import ClosuresEdit from './ClosuresEdit';
import SchedulePreview from './SchedulePreview';
import {
  readSchedule, applySchedule, isSpecialHoursValid, newAtom, groupAtoms, cardKey, addCard,
  skipCardDate, unskipCardDate, describeCard, getCardError, getClosureError, describeConflicts,
} from './recurrence';

const NOTHING_ACTIVE = -1;
const IS_247_ACTIVE = 0;
const IS_NOT_247_ACTIVE = 1;
const IS_CLOSED = 2;
const MIDNIGHT = '00:00';
const ELEVEN_FIFTY_NINE = '23:59';

const ALL_DAY_ATOMS = DAYS.map(day => newAtom({
  day, opensAt: MIDNIGHT, closesAt: ELEVEN_FIFTY_NINE,
}));

// 24/7 is one card open all day on every day, every week, with no dates or skips.
const isAllDayEveryDay = cards => cards.length === 1 &&
  cardKey(cards[0]) === cardKey(groupAtoms(ALL_DAY_ATOMS)[0]) && cards[0].days.length === 7;

// A row that says the whole service is closed: closed, with no dates and no repeat rule.
const isClosedMarker = row => row.closed && !row.freq && !row.validFrom;

function getActive(rows, supportsRecurrence) {
  if (supportsRecurrence) {
    const { atoms, closures, specialHours } = readSchedule(rows);
    if (atoms.length) {
      return isAllDayEveryDay(groupAtoms(atoms)) ? IS_247_ACTIVE : IS_NOT_247_ACTIVE;
    }
    if (rows.some(isClosedMarker)) return IS_CLOSED;
    // Only closures or special hours, such as a one-time event.
    return closures.length || specialHours.length ? IS_NOT_247_ACTIVE : NOTHING_ACTIVE;
  }

  const hours = rows;
  if (hours.length > 0 && hours.filter(({ closed }) => !closed).length === 0) {
    return IS_CLOSED;
  }

  const is247 = DAYS.every(weekday => (
    hours &&
      hours.find(hour => (
        hour.weekday === weekday &&
        hour.opensAt === MIDNIGHT &&
        hour.closesAt === ELEVEN_FIFTY_NINE
      ))
  ));

  if (hours && hours.length) {
    if (is247) {
      return IS_247_ACTIVE;
    }
    return IS_NOT_247_ACTIVE;
  }
  return NOTHING_ACTIVE;
}

function checkAllHoursValid(hours) {
  return hours.every(hour => hour.closed || (hour.opensAt != null && hour.closesAt != null));
}

const getOpenRegularHours = rows => rows.filter(({ closed }) => !closed);

function formatTime(time) {
  const m = moment(time, 'hh:mm');
  if (!m.isValid()) {
    return '';
  }

  return m.minutes() ? m.format('h:mmA') : m.format('hA');
}

function formatHours(hours) {
  const s1 = formatTime(hours.opensAt);
  const s2 = formatTime(hours.closesAt);
  return s1 && s2 ? `${s1} to ${s2}` : '';
}

function splitOvernightHours(hours) {
  const getNextWeekday = weekday => DAYS[(DAYS.indexOf(weekday) + 1) % DAYS.length];

  return hours.reduce((splitHours, hour) => {
    const isOvernight = hour && hour.closesAt && hour.opensAt && hour.opensAt > hour.closesAt;
    if (!isOvernight) {
      return [...splitHours, hour];
    }

    const beforeMidnight = {
      ...hour,
      weekday: hour.weekday,
      opensAt: hour.opensAt,
      closesAt: ELEVEN_FIFTY_NINE,
    };
    const afterMidnight = {
      ...hour,
      weekday: getNextWeekday(hour.weekday),
      opensAt: MIDNIGHT,
      closesAt: hour.closesAt,
    };

    return [...splitHours, beforeMidnight, afterMidnight];
  }, []);
}

class ServiceOpeningHours extends Component {
  constructor(props) {
    super(props);

    this.onChange = this.onChange.bind(this);
    this.removeHour = this.removeHour.bind(this);
    this.state = {
      active: getActive(props.value, props.supportsRecurrence),
      weekdaysOpen: {},
      hours: getOpenRegularHours(props.value),
      latestHoursEntered: null,
      schedule: readSchedule(props.value),
    };
  }

  componentWillReceiveProps(props) {
    if (props.value && props.value !== this.props.value) {
      this.setState({
        hours: getOpenRegularHours(props.value),
        active: getActive(props.value, props.supportsRecurrence),
        schedule: readSchedule(props.value),
      });
    }
  }

  onSelect = (active) => {
    const newState = { active };
    if (active === IS_247_ACTIVE) {
      newState.hours = DAYS.map(weekday => ({
        opensAt: MIDNIGHT,
        closesAt: ELEVEN_FIFTY_NINE,
        weekday,
      }));
    }
    if (active === IS_NOT_247_ACTIVE && !this.state.schedule.atoms.length) {
      newState.schedule = { ...this.state.schedule, atoms: addCard([]) };
    }
    if (active === IS_CLOSED) {
      newState.hours = [{
        closed: true,
      }];
    }
    if (active === NOTHING_ACTIVE) {
      newState.hours = [];
    }
    this.setState(newState);
  }

  onWeekday = (index) => {
    const { weekdaysOpen, hours } = this.state;
    const value = weekdaysOpen[index];
    const dayString = DAYS[index];

    const hoursForDay = hours.filter(row => row.weekday === dayString);
    if (!value && (!hoursForDay || !hoursForDay.length)) {
      this.addHour(dayString); // add a row to the clicked weekday, if he is empty
    }

    this.setState({ weekdaysOpen: { ...weekdaysOpen, [index]: !value } });
  };

  onChange = (field, hour, newValue) => {
    const idx = this.state.hours.indexOf(hour);
    const newHoursAtIdx = {
      ...this.state.hours[idx],
      [field]: newValue,
    };

    this.setState({
      hours: [
        ...this.state.hours.slice(0, idx),
        newHoursAtIdx,
        ...this.state.hours.slice(idx + 1),
      ],
      latestHoursEntered: newHoursAtIdx,
    });
  }

  onScheduleChange = (field, value) => this.setState(({ schedule }) => ({
    schedule: { ...schedule, [field]: value },
  }));

  // Applies `operation` from recurrence.js to the atoms behind `card`.
  onEditCard = card => (operation, ...args) => this.onScheduleChange(
    'atoms',
    operation(this.state.schedule.atoms, card, ...args),
  );

  onSkipCardDate = (card, action, date) =>
    this.onEditCard(card)(action === 'skip' ? skipCardDate : unskipCardDate, date);

  onSkipClosure = (index, date, skipped) => this.onScheduleChange(
    'closures',
    this.state.schedule.closures.map((closure, i) => {
      if (i !== index) return closure;
      const exdates = skipped
        ? closure.exdates.filter(d => d !== date)
        : [...closure.exdates, date].sort();
      return { ...closure, exdates };
    }),
  );

  // The schedule in the selected mode: 24/7 is open all day, every day.
  getSchedule = () => (this.state.active === IS_247_ACTIVE
    ? { ...this.state.schedule, atoms: ALL_DAY_ATOMS }
    : this.state.schedule);

  getHoursToSave = () => {
    const { active } = this.state;
    if (!this.props.supportsRecurrence || (active !== IS_NOT_247_ACTIVE && active !== IS_247_ACTIVE)) {
      return splitOvernightHours(this.state.hours);
    }
    // Overnight hours stay one row: the occurrence belongs to the day it starts on.
    return applySchedule(this.getSchedule());
  };

  updateValue = e => this.props.updateValue(
    this.getHoursToSave(),
    this.props.id,
    this.props.metaDataSection,
    this.props.fieldName,
  );

  addHour = (day) => {
    const latest = this.state.latestHoursEntered;
    // Reuse the last times entered, but not their note, which is about that day.
    const defaultHours = latest
      ? { opensAt: latest.opensAt, closesAt: latest.closesAt }
      : { opensAt: null, closesAt: null };

    this.setState({
      hours: [
        ...this.state.hours,
        { ...defaultHours, weekday: day },
      ],
    });
  }

  removeHour = (hour) => {
    const { hours, weekdaysOpen } = this.state;
    const idx = hours.indexOf(hour);
    const thisDayshours = hours.filter(time => time.weekday === hour.weekday);
    this.setState({
      weekdaysOpen: {
        ...weekdaysOpen,
        [DAYS.indexOf(hour.weekday)]: (thisDayshours.length - 1) > 0,
      },
      hours: [
        ...hours.slice(0, idx),
        ...hours.slice(idx + 1),
      ],
    });
  }

  isValid() {
    const { active, hours } = this.state;
    if (!this.props.supportsRecurrence) return checkAllHoursValid(hours);
    const schedule = this.getSchedule();
    const cards = groupAtoms(schedule.atoms);
    return (active !== IS_NOT_247_ACTIVE || cards.length + schedule.closures.length +
      schedule.specialHours.length > 0) &&
      !cards.some(getCardError) &&
      !schedule.closures.some(getClosureError) &&
      schedule.specialHours.every(isSpecialHoursValid) &&
      !describeConflicts(schedule).length;
  }

  // Repeating hours as cards of Google Calendar-like series.
  renderSeries() {
    const cards = groupAtoms(this.state.schedule.atoms);

    if (this.props.viewMode) {
      return (
        <div className="mb-3">
          {cards.map(card => <div key={cardKey(card)}>{describeCard(card)}</div>)}
        </div>
      );
    }

    return (
      <div className="mb-3">
        <p className="mb-1">
          Add the hours this service repeats on. Each card works like a repeating calendar
          event; days with the same hours share a card.
        </p>
        {cards.map((card, i) => (
          <SeriesEdit
            key={cardKey(card)}
            index={i}
            card={card}
            onEdit={this.onEditCard(card)}
          />
        ))}
        <Button
          onClick={() => this.onScheduleChange('atoms', addCard(this.state.schedule.atoms))}
          basic
          primary
        >
          + ADD REPEATING HOURS
        </Button>
      </div>
    );
  }

  // The legacy weekday grid, for the regular hours field.
  renderWeekdays() {
    const { weekdaysOpen, hours } = this.state;

    return (
      <div className="mb-3">
        {
          !this.props.viewMode &&
            <p> Select the days and times this service is available </p>
        }
        <Selector fluid>
          {
            DAYS.map((day, i) => {
              const dayHours = hours.filter(time => time.weekday === day);
              return [
                <Selector.Option
                  key={`selector-${day}`}
                  disablePadding={weekdaysOpen[i]}
                  active={!!dayHours.length}
                  hide={this.props.viewMode && !dayHours.length}
                  onClick={this.props.viewMode ? undefined : () => this.onWeekday(i)}
                >
                  <div>{day}</div>
                  {dayHours.some(hour => !hour.opensAt || !hour.closesAt) && (
                    <div style={{ fontSize: '.8em' }}>
                      Please enter From & To hours
                    </div>
                  )}
                  <div style={{ fontSize: '.8em' }}>
                    {
                      dayHours
                        .sort((a, b) => a.opensAt < b.openAt)
                        .map(formatHours)
                        .join(' | ')
                    }
                  </div>
                </Selector.Option>,
              ].concat(dayHours && dayHours.length ?
                <OpeningHoursEditForm
                  startTabIndex={i}
                  key={`editForm-${day}`}
                  active={weekdaysOpen[i]}
                  hours={dayHours}
                  onFromChange={this.onChange}
                  onToChange={this.onChange}
                  removeHour={this.removeHour}
                  addHour={() => this.addHour(day)}
                  viewMode={this.props.viewMode}
                /> : []);
            })
          }
        </Selector>
      </div>
    );
  }

  render() {
    const { active, schedule } = this.state;
    const { supportsRecurrence, viewMode } = this.props;
    const showsCalendar = supportsRecurrence &&
      (active === IS_NOT_247_ACTIVE || active === IS_247_ACTIVE);
    const allHoursValid = this.isValid();
    const conflicts = showsCalendar && !viewMode ? describeConflicts(this.getSchedule()) : [];

    return (
      <div className="w-100">
        {
          !this.props.viewMode &&
            <Header className="mb-3">When is this service available?</Header>
        }
        <Selector fluid>
          <Selector.Option
            hide={this.props.viewMode && active !== IS_CLOSED}
            active={active === IS_CLOSED}
            onClick={this.props.viewMode ? undefined : () => this.onSelect(active === IS_CLOSED ? NOTHING_ACTIVE : IS_CLOSED)}
          >
            This service is <strong>closed</strong>
          </Selector.Option>
          <Selector.Option
            hide={this.props.viewMode && active !== IS_247_ACTIVE}
            active={active === IS_247_ACTIVE}
            onClick={this.props.viewMode ? undefined : () => this.onSelect(active === IS_247_ACTIVE ? NOTHING_ACTIVE : IS_247_ACTIVE)}
          >
            This service is 24/7
          </Selector.Option>
          <Selector.Option
            hide={this.props.viewMode}
            active={active === IS_NOT_247_ACTIVE}
            onClick={this.props.viewMode ? undefined : () => this.onSelect(active === IS_NOT_247_ACTIVE ? NOTHING_ACTIVE : IS_NOT_247_ACTIVE)}
          >
            This service is <strong>not</strong> 24/7
          </Selector.Option>
        </Selector>
        {active === IS_NOT_247_ACTIVE &&
          (supportsRecurrence ? this.renderSeries() : this.renderWeekdays())}
        {showsCalendar && (
          <ClosuresEdit
            closures={schedule.closures}
            viewMode={viewMode}
            onChange={closures => this.onScheduleChange('closures', closures)}
          />
        )}
        {showsCalendar && (
          <SpecialHoursEdit
            entries={schedule.specialHours}
            viewMode={viewMode}
            onChange={entries => this.onScheduleChange('specialHours', entries)}
          />
        )}
        {showsCalendar && (
          <SchedulePreview
            schedule={this.getSchedule()}
            viewMode={viewMode}
            onEditCard={active === IS_247_ACTIVE ? () => {} : this.onSkipCardDate}
            onSkipClosure={this.onSkipClosure}
          />
        )}
        {showsCalendar && !viewMode && conflicts.map(conflict => (
          <div key={conflict} style={ERROR_STYLE}>{conflict}</div>
        ))}
        {
          !this.props.viewMode && (
            <div>
              {!allHoursValid && (
                <div style={{ color: '#A02733', fontSize: '0.8em' }}>
                  {supportsRecurrence
                    ? 'Please fix the hours or special hours above'
                    : 'Missing hours for some selected days'}
                </div>
              )}
              <Button
                onClick={this.updateValue}
                primary
                disabled={!allHoursValid}
              >
                OK
              </Button>&nbsp;
              <Button onClick={this.props.onCancel} basic primary>
                CANCEL
              </Button>
            </div>
          )
        }
      </div>
    );
  }
}

export default ServiceOpeningHours;
