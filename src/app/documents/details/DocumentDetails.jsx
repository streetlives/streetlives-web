import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import { selectLocationError } from 'selectors/location';
import { getService } from 'selectors/service';
import * as actions from 'actions';
import Header from 'components/header';
import Button from 'components/button';
import ProgressBar from 'components/progressBar';
import LoadingLabel from 'components/form/LoadingLabel';
import ErrorLabel from 'components/form/ErrorLabel';
import FieldItem from '../../locationInfo/FieldItem';
import NavBar from '../../NavBar';

import { DOCUMENT_FIELDS } from '../routes';

const LoadingView = () => (
  <div className="d-flex flex-column">
    <NavBar title="Docs required" />
    <LoadingLabel>Loading documents data...</LoadingLabel>
  </div>
);

function getUpdatedAt(service, metaDataSection, fieldName) {
  const subFields = service.metadata[metaDataSection] || [];
  const field = subFields.find(el => el.field_name === fieldName);
  return field ? field.last_action_date : null;
}

function ListItem({ route, linkTo, service }) {
  const { label, metaDataSection, fieldName } = route;
  const updatedAt = getUpdatedAt(service, metaDataSection, fieldName);
  return <FieldItem key={label} title={label} linkTo={linkTo} updatedAt={updatedAt} />;
}

const getDocsUrl = (locationId, serviceId) =>
  `/location/${locationId}/services/${serviceId}/documents`;

function DocsHeader({ children }) {
  return (
    <div className="container px-4 py-4 text-left">
      <div className="row">
        <Header className="m-0">{children}</Header>
      </div>
    </div>
  );
}

class DocumentDetails extends Component {
  componentDidMount() {
    if (Object.keys(this.props.service).length === 0) {
      const { locationId } = this.props.match.params;
      this.props.getLocation(locationId);
    }
  }

  onNext = () => {
    const { locationId, serviceId } = this.props.match.params;
    const route = DOCUMENT_FIELDS[DOCUMENT_FIELDS.length - 1];
    this.props.history.push(`${getDocsUrl(locationId, serviceId)}${route.urlFragment}/thanks`);
  };

  render() {
    const { locationId, serviceId } = this.props.match.params;
    const { service, locationError } = this.props;

    if (locationError) {
      return <ErrorLabel errorMessage={locationError} />;
    }

    if (Object.keys(service).length === 0) {
      return <LoadingView />;
    }

    return (
      <div className="text-left d-flex flex-column">
        <NavBar
          backButtonTarget={`/location/${this.props.match.params.locationId}/services/${
            this.props.match.params.serviceId
          }`}
          title="Docs required"
        />
        <ProgressBar step={0} steps={DOCUMENT_FIELDS.length} />
        <DocsHeader>Add information about documentation required</DocsHeader>

        {DOCUMENT_FIELDS.map(field => (
          <ListItem
            key={field.label}
            route={field}
            linkTo={`${getDocsUrl(locationId, serviceId)}${field.urlFragment}`}
            service={service}
          />
        ))}
        <Button fluid primary onClick={this.onNext}>
          Done
        </Button>
      </div>
    );
  }
}

const mapStateToProps = (state, ownProps) => ({
  service: getService(state, ownProps),
  locationError: selectLocationError(state, ownProps),
});

const mapDispatchToProps = (dispatch, ownProps) => ({
  getLocation: bindActionCreators(actions.getLocation, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(DocumentDetails);
