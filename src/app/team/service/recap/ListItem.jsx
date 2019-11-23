import React from 'react';
import { Link } from 'react-router-dom';

import Icon from 'components/icon';
import { SERVICE_FIELDS } from '../../serviceForm/routes';
import { DOCUMENT_FIELDS } from '../../documents/routes';

import './ListItem.css';

function getMetadataFromService(service, route) {
  return service.metadata[route.metaDataSection] &&
    service.metadata[route.metaDataSection].find(metadata =>
      metadata.field_name === route.fieldName);
}

function getProgress(service, originalService) {
  const totalNumberOfFields = SERVICE_FIELDS.length + DOCUMENT_FIELDS.length;
  const fieldsWithUpdatedMetadata = SERVICE_FIELDS.concat(DOCUMENT_FIELDS).filter((route) => {
    const currentMetadata = getMetadataFromService(service, route);
    const originalMetadata = getMetadataFromService(originalService, route);
    return (currentMetadata && currentMetadata.last_action_date) !==
              (originalMetadata && originalMetadata.last_action_date);
  }).length;
  return Math.round((fieldsWithUpdatedMetadata / totalNumberOfFields) * 100);
}

function ListItem({ service, originalService }) {
  return (
    <Link to={service.id} className="ListItem d-block py-4 border-top border-bottom">
      <div className="container d-flex justify-content-between align-items-center">
        <div>
          <h5 className="font-weight-normal m-0">{service.name}</h5>
          <span className="text-secondary">{getProgress(service, originalService)}% completed</span>
        </div>
        <Icon name="chevron-right" size="lg" />
      </div>
    </Link>
  );
}

export default ListItem;
