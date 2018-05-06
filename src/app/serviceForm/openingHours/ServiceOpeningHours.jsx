import React, { Component } from 'react';

import Header from '../../../components/header';
import Button from '../../../components/button';
import Selector from '../../../components/selector';
import Input from '../../../components/input';
import OpeningHoursEditForm from './OpeningHoursEditForm';
import moment from 'moment';

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
  state = { active: -1, weekdays: {} };

  onSelect = active => this.setState({ active });

  onWeekday = (index) => {
    const { weekdays } = this.state;
    const value = weekdays[index];
    this.setState({ weekdays: { ...weekdays, [index]: !value } });
  };

  onSubmit = (weekday, e, formState) => {
    const {opensAt, closesAt} = formState;
    const {hours} = this.state;
    e.preventDefault();
    this.setState({ 
      ...hours,
      hours: [ 
      {
        weekday,
        opensAt, 
        closesAt
      }
    ]}, () => {
      console.log('state', this.state);
    });
  }

  formatTime(time){
    const m = moment(time,'hh:mm')
    return m.minutes() ? m.format('h:mmA') : m.format('hA');
  }

  render() {
    const { active, weekdays } = this.state;
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
                  const hours = FAKE_DATA.hours.filter( time => time.weekday === day )
                  return [
                    <Selector.Option 
                      key={`selector-${day}`}
                      disablePadding={weekdays[i]} 
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
                      startTabIndex={i*10}
                      key={`editForm-${day}`}
                      active={weekdays[i]} 
                      defaultValue={hours[0]}
                      onSubmit={this.onSubmit.bind(this, day)}
                      onCancel={() => this.onWeekday(i)}/>
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
