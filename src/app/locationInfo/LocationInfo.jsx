import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';

import NavBar from '../NavBar';
import ProgressBar from './ProgressBar';
import Header from '../../components/header';
import Button from '../../components/button';
import routes from '../locationForm/routes';
import { getLocation } from '../../actions';
import LoadingLabel from '../locationForm/common/LoadingLabel';
import FieldItem from './FieldItem';

const getServicesUrl = locationId => `/location/${locationId}/services`;

function LocationHeader() {
  return (
    <div className="container px-4 py-4 text-left">
      <div className="row">
        <Header className="m-0">Check all these details on this location:</Header>
      </div>
    </div>
  );
}

function LoadingView({ locationId }) {
  return (
    <div className="d-flex flex-column">
      <NavBar backButtonTarget={`/location/${locationId}`} title="Location Info" />
      <LoadingLabel />
    </div>
  );
}

function ListItem({ pathname, route }) {
  const {
    urlFragment, label, metaDataSection, fieldName,
  } = route;
  let lastDateEdited = null;
  if (metaDataSection && fieldName) {
    const subFields = this.props.locationData.metadata[metaDataSection];
    const field = subFields.find(el => el.field_name === fieldName);
    if (field) {
      lastDateEdited = field.last_action_date;
    }
  }
  return (
    <FieldItem
      key={urlFragment}
      title={label}
      linkTo={`${pathname}/${urlFragment}`}
      updatedAt={lastDateEdited}
    />
  );
}

class LocationInfo extends Component {
  componentWillMount() {
    if (!this.props.locationData) {
      this.props.getLocation(this.props.match.params.locationId);
    }
  }

  onGoToServices = () => {
    const { locationId } = this.props.match.params;
    this.props.history.push(`${getServicesUrl(locationId)}`);
  };

  render() {
    if (!this.props.locationData) {
      return <LoadingView locationId={this.props.match.params.locationId} />;
    }

    return (
      <div className="d-flex flex-column">
        <NavBar backButtonTarget={`${this.props.location.pathname}/recap`} title="Location Info" />
        <ProgressBar step={0} steps={routes.length} />
        <LocationHeader />
        {routes.map((route, i) => (
          <ListItem key={route.urlFragment} route={route} pathname={this.props.location.pathname} />
        ))}
        <Button fluid primary onClick={this.onGoToServices}>
          Done
        </Button>
      </div>
    );
  }
}

export function mapStateToProps(state, ownProps) {
  const locationData = state.locations[ownProps.match.params.locationId];

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

  return {
    locationData,
    values,
  };
}

export function mapDispatchToProps(dispatch, ownProps) {
  return {
    getLocation: (locationId) => {
      dispatch(getLocation(locationId));
    },
  };
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(LocationInfo));
