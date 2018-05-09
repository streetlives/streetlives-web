import React, { Component } from 'react';
import moment from 'moment';

import OpeningHoursEditForm from './OpeningHoursEditForm';
import Header from '../../../components/header';
import Button from '../../../components/button';
import Selector from '../../../components/selector';
import Input from '../../../components/input';

const FAKE_DATA = {
  hours : [
    {
      weekday : 'Monday',
      opensAt: '08:00',
      closesAt: '11:00'
    },
    {
      weekday : 'Monday',
      opensAt: '12:00',
      closesAt: '13:00'
    },
    {
      weekday : 'Tuesday',
      opensAt: '17:00',
      closesAt: '20:00'
    }
  ]
};

const DAYS = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday'
];

const inputPlaceholder =
  'e.g. Drop-in opens at 6pm, but you should be there by 4pm if you want to get in, etc';
class ServiceOpeningHours extends Component {

  constructor(props){
    super(props);

    this.onChange = this.onChange.bind(this);
    this.state = { 
      active: -1, 
      weekdaysOpen: {},
      data: FAKE_DATA
    };
  }

  onSelect = active => this.setState({ active });

  onWeekday = (index) => {
    const { weekdaysOpen } = this.state;
    const value = weekdaysOpen[index];
    this.setState({ weekdaysOpen: { ...weekdaysOpen, [index]: !value } });
  };

  onChange = (field, hour, newValue) => {
    const idx = this.state.data.hours.indexOf(hour);
    this.setState({
      data : {
        hours : [
          ...this.state.data.hours.slice(0, idx),
          {
            ...this.state.data.hours[idx],
            [field] : newValue
          },
          ...this.state.data.hours.slice(idx + 1),
        ]
      }
    })
  }
  
  removeHour = (hour) => {
    const { data : {hours}, weekdaysOpen} = this.state;
    const idx = hours.indexOf(hour);
    const thisDayshours = hours.filter( time => time.weekday === hour.weekday )
    this.setState({
      weekdaysOpen: {
        ...weekdaysOpen,
        [DAYS.indexOf(hour.weekday)]: (thisDayshours.length - 1) > 0
      },
      data : {
        hours : [
          ...hours.slice(0, idx),
          ...hours.slice(idx + 1),
        ]
      }
    })
  }

  addHour = (day) => {
    this.setState({
      data : {
        hours : [
          ...this.state.data.hours,
          { 
            weekday: day,
            opensAt: null,
            closesAt: null
          }
        ]
      }
    })
  }

  formatTime(time){
    const m = moment(time,'hh:mm')
    return !m.isValid() ? 
            '' : 
            (m.minutes() ? m.format('h:mmA') : m.format('hA'));
  }

  render() {
    const { active, weekdaysOpen } = this.state;
    return (
      <div className="w-100">
        <Header className="mb-3">When is this service available?</Header>
        <Selector fluid>
          <Selector.Option active={active === 0} onClick={() => this.onSelect(0)}>
            This service is 24/7
          </Selector.Option>
          <Selector.Option active={active === 1} onClick={() => this.onSelect(1)}>
            This service is <strong>not</strong> 24/7
          </Selector.Option>
        </Selector>
        {active === 0 && (
          <div>
            <p>Is there anything else you would like to add about their opening times?</p>
            <Input fluid placeholder={inputPlaceholder} />
          </div>
        )}
        {active === 1 && (
          <div>
            <p>Select the days and times this service is available</p>
            <Selector fluid>
              {
                DAYS.map( (day, i) => {
                  const hours = this.state.data.hours.filter( time => time.weekday === day )
                  return [
                    <Selector.Option 
                      key={`selector-${day}`}
                      disablePadding={weekdaysOpen[i]} 
                      active={!!hours.length} 
                      onClick={() => this.onWeekday(i)}>
                      <div>{day}</div>
                      <div style={{fontSize: '.8em'}}>
                        {
                          hours 
                            .sort( (a,b) => a.opensAt < b.openAt )
                            .map( time => `${this.formatTime(time.opensAt)} to ${this.formatTime(time.closesAt)}` )
                            .join(' | ')
                        }
                      </div>
                    </Selector.Option>,
                    <OpeningHoursEditForm 
                      startTabIndex={i}
                      key={`editForm-${day}`}
                      active={weekdaysOpen[i]} 
                      hours={hours}
                      onFromChange={this.onChange}
                      onToChange={this.onChange}
                      removeHour={this.removeHour.bind(this)}
                      addHour={() => this.addHour(day)}
                      />
                  ]
                })
              }
            </Selector>
          </div>
        )}
        <Button onClick={() => {}} primary disabled={active === -1} className="mt-3">
          OK
        </Button>
      </div>
    );
  }
}

export default ServiceOpeningHours;
