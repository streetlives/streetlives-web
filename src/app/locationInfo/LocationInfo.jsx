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
      <NavBar 
        backButtonTarget={`/location/${locationId}`}
        title="Location Info" />
      <LoadingLabel />
    </div>
  );
}

class LocationInfo extends Component {
  componentWillMount() {
    if (!this.props.locationData) {
      this.props.getLocation(this.props.match.params.locationId);
    }
  }

  onNext = () => {
    this.props.history.push(`/location/${this.props.match.params.locationId}/services`);
  };

  render() {
    if (!this.props.locationData) {
      return <LoadingView locationId={this.props.match.params.locationId}/>;
    }

    return (
      <div className="d-flex flex-column">
        <NavBar 
          backButtonTarget={`${this.props.location.pathname}/recap`}
          title="Location Info" />
        <ProgressBar step={0} steps={routes.length} />
        <LocationHeader />
        {
          routes.map(({
              urlFragment,
              label,
              metaDataSection,
              fieldName,
            }, i) => {
            let lastDateEdited = null;
            if(metaDataSection && fieldName){
              const subFields = this.props.locationData.metadata[metaDataSection];
              const field = subFields.find( field => field.field_name === fieldName );
              if(field){
                lastDateEdited = field.last_action_date;
              }
            } 
            return <FieldItem
              key={urlFragment}
              title={label}
              linkTo={`${this.props.location.pathname}/${urlFragment}`}
              updatedAt={lastDateEdited}
            />
          })
        }
        <Button fluid primary onClick={this.onNext}>
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
