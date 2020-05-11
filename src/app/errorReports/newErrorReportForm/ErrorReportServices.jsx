import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Header from '../../../components/header';
import Button from '../../../components/button';
import Checkbox from '../../../components/checkbox';
import withErrorReportsForm from '../withErrorReportsForm';

class ErrorReportServices extends Component {
  constructor(props) {
    super(props);

    this.onServiceChange = this.onServiceChange.bind(this);
    this.onGeneralLocationChange = this.onGeneralLocationChange.bind(this);
  }

  onServiceChange(value) {
    this.props.onServiceChange(value);
  }

  onGeneralLocationChange(value) {
    console.log('General location change triggered');
    this.props.onGeneralLocationChange(value);
  }

  render() {
    const { locationData, errorReportServices, generalLocationError } = this.props;

    return (
      <div>
        <Header size="large" className="locationTitle">Error Report</Header>
        <div className="mx-4 mb-3 text-left">
          <div className="w-100 mr-5">
            <Header size="medium" className="mb-3">
              Which part of the information has errors?
            </Header>
          </div>
          <div>
            <Checkbox
              key="generalLocationError"
              name="generalLocationError"
              label="Information about the location"
              checked={generalLocationError}
              onChange={this.onGeneralLocationChange}
            />
            <div />
            {locationData.Services.map(service => (
              <div key={service.id}>
                <Checkbox
                  key={service.id}
                  name={service.id}
                  label={`${service.name} service`}
                  checked={errorReportServices.includes(service.id)}
                  onChange={() => this.onServiceChange(service.id)}
                />
              </div>
            ))}
          </div>
        </div>
        <div className="mx-4 mb-1">
          <Button
            primary
            fluid
            onClick={this.props.onSubmit}
          >
            {
              (!this.props.generalLocationError && !this.props.errorReportServices.length)
                ? 'Skip'
                : 'Next'
            }
          </Button>
        </div>
        <div className="mx-4">
          <Button
            secondary
            fluid
            onClick={() => console.log('Cancel button triggered. Still need to implement function.')}
          >
            Cancel
          </Button>
        </div>
      </div>
    );
  }
}

ErrorReportServices.propTypes = {
  onServiceChange: PropTypes.func.isRequired,
  onGeneralLocationChange: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  generalLocationError: PropTypes.bool.isRequired,
  errorReportServices: PropTypes.instanceOf(Array),
};

export default withErrorReportsForm(ErrorReportServices);
