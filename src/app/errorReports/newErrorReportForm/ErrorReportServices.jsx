import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Header from '../../../components/header';
import Button from '../../../components/button';
import Checkbox from '../../../components/checkbox';
import withErrorReportsForm from '../withErrorReportsForm';

/*

function Checkbox({
  name,
  label,
  checked,
  onChange,
  className,
  disabled = undefined,
})

*/

class ErrorReportServices extends Component {
  constructor(props) {
    super(props);

    this.onServiceChange = this.onServiceChange.bind(this);
    this.onGeneralLocationChange = this.onGeneralLocationChange.bind(this);
  }

  onServiceChange(event) {
    console.log('Services change triggered');
    this.props.onServiceChange(event.target.value);
  }

  onGeneralLocationChange(event) {
    console.log('General location change triggered');
    this.props.onGeneralLocationChange(event);
  }

  render() {
    return (
      <div>
        <div className="mx-4 mb-3 text-left">
          <div className="w-100 mr-5">
            <Header size="large" className="mb-3">Which part of the information has errors?</Header>
          </div>
          <div>
            <Checkbox
              name="Test"
              label="Information about the location"
              checked={this.props.generalLocationError}
              onChange={this.onGeneralLocationChange}
            />
            <div>
              Rest of services list (if any) here.
              {/* Look at the example JSON file for Taxonomy(?) names to list */}
            </div>
          </div>
        </div>
        <div className="mx-4 mb-1">
          <Button
            primary
            fluid
            disabled={!this.props.generalLocationError && !this.props.services.length}
            onClick={this.props.onSubmit}
          >
            Next
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
  services: PropTypes.instanceOf(Array),
};

export default withErrorReportsForm(ErrorReportServices);
