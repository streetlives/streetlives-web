import React, { Component } from 'react';
import moment from 'moment';

import Header from '../../../../components/header';
import Button from '../../../../components/button';
import Selector from '../../../../components/selector';
import Input from '../../../../components/input';
import { DAYS } from '../../../../Constants';
import OpeningHoursEditForm from './OpeningHoursEditForm';

const NOTHING_ACTIVE = -1;
const IS_247_ACTIVE = 0;
const IS_NOT_247_ACTIVE = 1;
const MIDNIGHT = '00:00';
const ELEVEN_FIFTY_NINE = '23:59';

const inputPlaceholder =
  'e.g. Drop-in opens at 6pm, but you should be there by 4pm if you want to get in, etc';

function getActive(hours) {
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
  return hours.every(hour => hour.opensAt != null && hour.closesAt != null);
}

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
      weekday: hour.weekday,
      opensAt: hour.opensAt,
      closesAt: ELEVEN_FIFTY_NINE,
    };
    const afterMidnight = {
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
      hours: props.value,
    };
  }

  componentWillReceiveProps(props) {
    if (props.value && props.value !== this.props.value) {
      this.setState({
        hours: props.value,
        active: getActive(props.value),
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
    this.setState({
      hours: [
        ...this.state.hours.slice(0, idx),
        {
          ...this.state.hours[idx],
          [field]: newValue,
        },
        ...this.state.hours.slice(idx + 1),
      ],
    });
  }

  updateValue = e => this.props.updateValue(
    splitOvernightHours(this.state.hours),
    this.props.id,
    this.props.metaDataSection,
    this.props.fieldName,
  );

  addHour = (day) => {
    this.setState({
      hours: [
        ...this.state.hours,
        {
          weekday: day,
          opensAt: null,
          closesAt: null,
        },
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

  render() {
    const { active, weekdaysOpen, hours } = this.state;
    const allHoursValid = checkAllHoursValid(hours);

    return (
      <div className="w-100">
        {
          !this.props.viewMode &&
            <Header className="mb-3">When is this service available?</Header>
        }
        <Selector fluid>
          <Selector.Option
            hide={this.props.viewMode && active !== IS_247_ACTIVE}
            active={active === IS_247_ACTIVE}
            onClick={this.props.viewMode ? undefined : () => this.onSelect(IS_247_ACTIVE)}
          >
            This service is 24/7
          </Selector.Option>
          <Selector.Option
            hide={this.props.viewMode}
            active={active === IS_NOT_247_ACTIVE}
            onClick={this.props.viewMode ? undefined : () => this.onSelect(IS_NOT_247_ACTIVE)}
          >
            This service is <strong>not</strong> 24/7
          </Selector.Option>
        </Selector>
        {active === IS_247_ACTIVE && (
          <div>
            <p>Is there anything else you would like to add about their opening times?</p>
            <Input fluid placeholder={inputPlaceholder} />
          </div>
        )}
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
        )}
        {
          !this.props.viewMode && (
            <div>
              {!allHoursValid && (
                <div style={{ color: '#A02733', fontSize: '0.8em' }}>
                  Missing hours for some selected days
                </div>
              )}
              <Button
                onClick={this.updateValue}
                primary
                disabled={active === -1 || !allHoursValid}
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
