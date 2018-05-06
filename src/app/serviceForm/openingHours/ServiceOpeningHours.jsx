import React, { Component } from 'react';

import Header from '../../../components/header';
import Button from '../../../components/button';
import Selector from '../../../components/selector';
import Input from '../../../components/input';
import OpeningHoursEditForm from './OpeningHoursEditForm';

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
                DAYS.map( (day, i) => (
                  [
                    <Selector.Option 
                      key={`selector-${day}`}
                      disablePadding={weekdays[i]} 
                      active={weekdays[i]} 
                      onClick={() => this.onWeekday(i)}>
                      {day}
                    </Selector.Option>,
                    <OpeningHoursEditForm 
                      startTabIndex={i*10}
                      key={`editForm-${day}`}
                      active={weekdays[i]} 
                      onSubmit={this.onSubmit.bind(this, day)}
                      onCancel={() => this.onWeekday(i)}/>
                  ]
                ))
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
