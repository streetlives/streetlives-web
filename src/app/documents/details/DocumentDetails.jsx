import React, { Component } from 'react';
import moment from 'moment';

import Header from '../../../components/header';
import Button from '../../../components/button';

import ProgressBar from '../../locationInfo/ProgressBar';
import FieldItem from '../../locationInfo/FieldItem';
import NavBar from '../../NavBar';

import { DOCUMENT_FIELDS } from '../routes';

// TODO: update fields to have updated value
const FAKE_UPDATED_AT = moment().subtract(5, 'months');

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
  onNext = () => console.log('Next clicked!'); // eslint-disable-line no-console

  render() {
    const { locationId, serviceId } = this.props.match.params;
    return (
      <div className="text-left d-flex flex-column">
        <NavBar 
          backButtonTarget={`/location/${this.props.match.params.locationId}/services/${this.props.match.params.serviceId}`}
          title="Docs required" />
        <div className="mb-5">
          <ProgressBar step={1} steps={10} />
        </div>
        <DocsHeader>Add information about documentation required</DocsHeader>

        {DOCUMENT_FIELDS.map(field => (
          <FieldItem
            key={field.title}
            title={field.title}
            linkTo={`${getDocsUrl(locationId, serviceId)}${field.route}`}
            updatedAt={FAKE_UPDATED_AT}
          />
        ))}
        <Button fluid primary onClick={this.onNext}>
          Done
        </Button>
      </div>
    );
  }
}

export default DocumentDetails;
