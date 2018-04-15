import React, { Component } from 'react';
import moment from 'moment';
import NavBar from '../NavBar';
import ProgressBar from './ProgressBar';
import Header from '../../components/header';
import Button from '../../components/button';
import LocationField from './LocationField';
import routes from '../locationForm/routes';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { getLocation } from '../../actions';

function LocationHeader() {
  return (
    <div className="container px-4 py-4 text-left">
      <div className="row">
        <Header className="m-0">Check all these details on this location:</Header>
      </div>
    </div>
  );
}

class LocationInfo extends Component {
  constructor(props) {
    super(props);

    this.dummyLastUpdatedValues = [
      null,
      moment().subtract(1, 'years'),
      moment().subtract(30, 'days'),
      moment().subtract(3, 'months'),
      moment().subtract(3, 'months'),
      null,
      moment().subtract(3, 'months'),
      null,
    ];

    if (!props.locationData) {
      props.getLocation(props.match.params.locationId);
    }
  }

  render() {
    if (!this.props.locationData) return <i className="fa fa-spinner fa-spin" aria-hidden="true" />;

    return (
      <div className="d-flex flex-column">
        <NavBar title="Location Info" />
        <ProgressBar step={this.props.step} steps={routes.length} />
        <LocationHeader />
        {routes.map((route, i) => (
          <LocationField
            key={route[0]}
            updatedAt={this.dummyLastUpdatedValues[i]}
            title={route[2]}
            navigateToLocation={route[0]}
            required={isRequired(this.props.values[i])}
          />
        ))}
        <Button fluid primary onClick={() => console.log('Clicked done')}>
          Done
        </Button>
      </div>
    );
  }
}

export function mapStateToProps(state, ownProps) {
  const locationData = state.db[ownProps.match.params.locationId];

  const organizationName =
    locationData && locationData.Organization && locationData.Organization.name;
  const addresses = locationData && locationData.PhysicalAddresses;
  const locationName = locationData && locationData.name;
  const locationDescription = locationData && locationData.description;
  const phoneNumbers = locationData && locationData.Phones;
  const website = locationData && locationData.Organization && locationData.Organization.url;

  const values = [
    organizationName,
    addresses,
    locationName,
    locationDescription,
    phoneNumbers,
    website,
  ];

  const step = values.length - values.filter(isRequired).length;

  return {
    locationData,
    values,
    step,
  };
}

export function mapDispatchToProps(dispatch, ownProps) {
  return {
    getLocation: (locationId) => {
      dispatch(getLocation(locationId));
    },
  };
}

function isRequired(x) {
  return !(Array.isArray(x) ? x.length : x);
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(LocationInfo));
