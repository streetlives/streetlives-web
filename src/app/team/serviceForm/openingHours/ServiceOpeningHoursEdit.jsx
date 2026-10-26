import React, { Component } from 'react';
import moment from 'moment';

import Header from '../../../../components/header';
import Button from '../../../../components/button';
import Selector from '../../../../components/selector';
import Input from '../../../../components/input';
import { DAYS } from '../../../../Constants';
import OpeningHoursEditForm from './OpeningHoursEditForm';
import SpecialHoursEdit from './SpecialHoursEdit';
import {
  WEEK_OPTIONS, readSchedule, applySchedule, hasRecurrence, isSpecialHours, isSpecialHoursValid,
  describeWeeks, describeSeason, sortWeeks,
} from './recurrence';

const NOTHING_ACTIVE = -1;
const IS_247_ACTIVE = 0;
const IS_NOT_247_ACTIVE = 1;
const IS_CLOSED = 2;
const MIDNIGHT = '00:00';
const ELEVEN_FIFTY_NINE = '23:59';

// Special hours (dated overrides) don't decide the mode; only the regular hours do.
const getRegularHours = rows => rows.filter(row => !isSpecialHours(row));

function getActive(rows) {
  const hours = getRegularHours(rows);
  if (hours.length > 0 && hours.filter(({ closed }) => !closed).length === 0) {
    return IS_CLOSED;
  }

  // Round-the-clock hours that only apply on some weeks of the month or between
  // certain dates aren't 24/7, and the recurrence settings live in that mode.
  if (hasRecurrence(readSchedule(hours))) {
    return IS_NOT_247_ACTIVE;
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

function areSeasonDatesValid({ validFrom, validTo }) {
  return !validFrom || !validTo || validFrom <= validTo;
}

const getOpenRegularHours = rows => getRegularHours(rows).filter(({ closed }) => !closed);

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

// Overnight hours on days that only open on some weeks of the month stay as one row
// (e.g. Friday 22:00-02:00 on the last Friday): the morning after the last Friday isn't
// "the last Saturday", and the next day's own weeks don't apply to it.
function splitOvernightHours(hours, keepWhole = () => false) {
  const getNextWeekday = weekday => DAYS[(DAYS.indexOf(weekday) + 1) % DAYS.length];

  return hours.reduce((splitHours, hour) => {
    const isOvernight = hour && hour.closesAt && hour.opensAt && hour.opensAt > hour.closesAt;
    if (!isOvernight || keepWhole(hour)) {
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
      active: getActive(props.value),
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
        active: getActive(props.value),
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

  // `weeks` is [] for every week, or e.g. ['1', '2'] for the 1st and 2nd of the month.
  onWeeksChange = (weekday, weeks) => this.onScheduleChange('weekPatterns', {
    ...this.state.schedule.weekPatterns,
    [weekday]: sortWeeks(weeks),
  });

  getHoursToSave = () => {
    const { active, schedule } = this.state;
    if (!this.props.supportsRecurrence || (active !== IS_NOT_247_ACTIVE && active !== IS_247_ACTIVE)) {
      return splitOvernightHours(this.state.hours);
    }
    const isMonthly = hour => active === IS_NOT_247_ACTIVE &&
      (schedule.weekPatterns[hour.weekday] || []).length > 0;
    const hours = splitOvernightHours(this.state.hours, isMonthly);
    return applySchedule(hours, schedule, { withRecurrence: active === IS_NOT_247_ACTIVE });
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

  renderWeeksPicker(day) {
    const weeks = this.state.schedule.weekPatterns[day] || [];
    const toggle = (week, checked) => this.onWeeksChange(
      day,
      checked ? [...weeks, week] : weeks.filter(w => w !== week),
    );

    return (
      <div key={`weeks-${day}`} className="px-3 pb-3" style={{ fontSize: '.9em' }}>
        <div>Which {day}s?</div>
        <label className="mr-3" htmlFor={`weeks-every-${day}`}>
          <input
            id={`weeks-every-${day}`}
            type="checkbox"
            checked={!weeks.length}
            onChange={() => this.onWeeksChange(day, [])}
          />{' '}Every {day}
        </label>
        {WEEK_OPTIONS.map(({ value, label }) => (
          <label key={value} className="mr-3" htmlFor={`weeks-${value}-${day}`}>
            <input
              id={`weeks-${value}-${day}`}
              type="checkbox"
              checked={weeks.includes(value)}
              onChange={e => toggle(value, e.target.checked)}
            />{' '}{label}
          </label>
        ))}
        {!!weeks.length && <div>{describeWeeks(day, weeks)}</div>}
      </div>
    );
  }

  renderSeason() {
    const { schedule } = this.state;

    if (this.props.viewMode) {
      const summary = describeSeason(schedule);
      return summary ? <p className="mb-3">{summary}</p> : null;
    }

    return (
      <div className="mb-3">
        <p className="mb-1">Do these hours only run between certain dates? (optional)</p>
        <table>
          <tbody>
            <tr>
              <td style={{ paddingRight: '1em' }}>From:</td>
              <td>
                <Input
                  type="date"
                  value={schedule.validFrom}
                  onChange={e => this.onScheduleChange('validFrom', e.target.value)}
                />
              </td>
            </tr>
            <tr>
              <td>Until:</td>
              <td>
                <Input
                  type="date"
                  value={schedule.validTo}
                  onChange={e => this.onScheduleChange('validTo', e.target.value)}
                />
              </td>
            </tr>
          </tbody>
        </table>
        {!areSeasonDatesValid(schedule) && (
          <div style={{ color: '#A02733', fontSize: '0.8em' }}>
            The end date is before the start date
          </div>
        )}
      </div>
    );
  }

  render() {
    const {
      active, weekdaysOpen, hours, schedule,
    } = this.state;
    const { supportsRecurrence, viewMode } = this.props;
    const showsSpecialHours = supportsRecurrence &&
      (active === IS_NOT_247_ACTIVE || active === IS_247_ACTIVE);
    const allHoursValid = checkAllHoursValid(hours) && (!supportsRecurrence || (
      areSeasonDatesValid(schedule) && schedule.specialHours.every(isSpecialHoursValid)
    ));

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
        {active === IS_NOT_247_ACTIVE && (
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
                      {dayHours.filter(hour => hour.description).map(hour => (
                        <div key={`note-${hour.opensAt}`} style={{ fontSize: '.8em', fontStyle: 'italic' }}>
                          {hour.description}
                        </div>
                      ))}
                      {supportsRecurrence && !!dayHours.length &&
                        !!(schedule.weekPatterns[day] || []).length && (
                        <div style={{ fontSize: '.8em' }}>
                          {describeWeeks(day, schedule.weekPatterns[day])} only
                        </div>
                      )}
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
                      supportsNotes={supportsRecurrence}
                      onNoteChange={this.onChange}
                      viewMode={this.props.viewMode}
                    /> : []).concat(
                    supportsRecurrence && !viewMode && weekdaysOpen[i] && dayHours.length ?
                      this.renderWeeksPicker(day) : [],
                  );
                })
              }
            </Selector>
          </div>
        )}
        {active === IS_NOT_247_ACTIVE && supportsRecurrence && this.renderSeason()}
        {showsSpecialHours && (
          <SpecialHoursEdit
            entries={schedule.specialHours}
            viewMode={viewMode}
            onChange={entries => this.onScheduleChange('specialHours', entries)}
          />
        )}
        {
          !this.props.viewMode && (
            <div>
              {!allHoursValid && (
                <div style={{ color: '#A02733', fontSize: '0.8em' }}>
                  {checkAllHoursValid(hours)
                    ? 'Please fix the dates or special hours above'
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
