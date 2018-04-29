import React, { Component } from 'react';
import moment from 'moment';
import NavBar from '../NavBar';
import ProgressBar from '../locationInfo/ProgressBar';
import Header from '../../components/header';
import Button from '../../components/button';
import FieldItem from '../locationInfo/FieldItem';

// TODO: Connect with real service data
const FAKE_DATA = {
  description: 'Service description',
  alt_name: 'Alternative name',
  audience: 'Who does it serve?',
  age: 'Ages served',
  hours: 'Opening hours',
  languages: 'Languages spoken',
  payment: 'Cost and payment method',
  other_eligibility: 'Other eligibility criteria',
  other_info: 'Other information',
};

function ServiceHeader({ children }) {
  return (
    <div className="container px-4 py-4 text-left">
      <div className="row">
        <Header className="m-0">{children}</Header>
      </div>
    </div>
  );
}

class ServiceDetailsContainer extends Component {
  onNext = () => console.log('Next clicked!'); // eslint-disable-line no-console

  render() {
    return (
      <div className="text-left d-flex flex-column">
        <NavBar title="Service Details" />
        <div className="mb-5">
          <ProgressBar step={1} steps={10} />
        </div>
        <ServiceHeader>Check all the Soup Kitchen details</ServiceHeader>
        {Object.keys(FAKE_DATA).map(i => (
          <FieldItem
            key={i}
            title={FAKE_DATA[i]}
            linkTo="/"
            updatedAt={moment().subtract(2, 'months')}
          />
        ))}
        <Button fluid primary onClick={this.onNext}>
          Service info completed
        </Button>
      </div>
    );
  }
}

export default ServiceDetailsContainer;
