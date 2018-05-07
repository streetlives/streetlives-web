import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import { getService } from '../../../selectors/service';
import * as actions from '../../../actions';
import Header from '../../../components/header';
import Button from '../../../components/button';

import ProgressBar from '../../locationInfo/ProgressBar';
import FieldItem from '../../locationInfo/FieldItem';
import NavBar from '../../NavBar';
import LoadingLabel from '../../../components/form/LoadingLabel';

import { SERVICE_FIELDS } from '../../serviceForm/routes';

const getServiceUrl = (locationId, serviceId) => `/location/${locationId}/services/${serviceId}`;

function ServiceHeader({ children }) {
  return (
    <div className="container px-4 py-4 text-left">
      <div className="row">
        <Header className="m-0">{children}</Header>
      </div>
    </div>
  );
}

const LoadingView = () => (
  <div className="d-flex flex-column">
    <NavBar title="Services Details" />
    <LoadingLabel>Loading service data...</LoadingLabel>
  </div>
);
function ListItem({
  pathname, route, location, service,
}) {
  const { label, metaDataSection, fieldName } = route;
  const locationId = location.id;
  const serviceId = service.id;
  let lastDateEdited = null;
  if (metaDataSection && fieldName) {
    const subFields = service.metadata[metaDataSection];
    const field = subFields.find(el => el.field_name === fieldName);
    if (field) {
      lastDateEdited = field.last_action_date;
    }
  }
  return (
    <FieldItem
      key={label}
      title={label}
      linkTo={`${getServiceUrl(locationId, serviceId)}${route.route}`}
      updatedAt={lastDateEdited}
    />
  );
}

class ServiceDetails extends Component {
  componentWillMount() {
    if (Object.keys(this.props.service).length === 0) {
      const { locationId } = this.props.match.params;
      this.props.getLocation(locationId);
    }
  }

  onGoToDocs = () => {
    const { locationId, serviceId } = this.props.match.params;
    this.props.history.push(`${getServiceUrl(locationId, serviceId)}/documents`);
  };

  render() {
    const { service } = this.props;

    if (!this.props.locationData || Object.keys(service).length === 0) {
      return <LoadingView />;
    }

    return (
      <div className="text-left d-flex flex-column">
        <NavBar
          backButtonTarget={`/location/${this.props.match.params.locationId}/services`}
          title="Service Details"
        />
        <div className="mb-5">
          <ProgressBar step={1} steps={10} />
        </div>
        <ServiceHeader>Check all the {service.name} details</ServiceHeader>

        {SERVICE_FIELDS.map(field => (
          <ListItem
            key={field.route}
            route={field}
            pathname={this.props.location.pathname}
            location={this.props.locationData}
            service={service}
          />
        ))}
        <Button fluid primary onClick={this.onGoToDocs}>
          Go to docs required
        </Button>
      </div>
    );
  }
}

const mapStateToProps = (state, ownProps) => ({
  service: getService(state, ownProps),
  locationData: state.locations[ownProps.match.params.locationId],
});

const mapDispatchToProps = (dispatch, ownProps) => ({
  getLocation: bindActionCreators(actions.getLocation, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(ServiceDetails);
