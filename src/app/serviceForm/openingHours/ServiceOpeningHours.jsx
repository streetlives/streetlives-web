import React, { Component } from 'react';

import Header from '../../../components/header';
import Button from '../../../components/button';
import Selector from '../../../components/selector';
import Input from '../../../components/input';

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
              <Selector.Option active={weekdays[0]} onClick={() => this.onWeekday(0)}>
                Monday
              </Selector.Option>
              <Selector.Option active={weekdays[1]} onClick={() => this.onWeekday(1)}>
                Tuesday
              </Selector.Option>
              <Selector.Option active={weekdays[2]} onClick={() => this.onWeekday(2)}>
                Wednesday
              </Selector.Option>
              <Selector.Option active={weekdays[3]} onClick={() => this.onWeekday(3)}>
                Thursday
              </Selector.Option>
              <Selector.Option active={weekdays[4]} onClick={() => this.onWeekday(4)}>
                Friday
              </Selector.Option>
              <Selector.Option active={weekdays[5]} onClick={() => this.onWeekday(5)}>
                Saturday
              </Selector.Option>
              <Selector.Option active={weekdays[6]} onClick={() => this.onWeekday(6)}>
                Sunday
              </Selector.Option>
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
