import React from 'react';
import { Link } from 'react-router-dom';

import Icon from '../../../components/icon';
import { SERVICE_FIELDS } from '../../serviceForm/routes';
import { DOCUMENT_FIELDS } from '../../documents/routes';

import './ListItem.css';

function filterRoutes(service, route){
  return service.metadata[route.metaDataSection].find( metadata => metadata.field_name === route.fieldName)
}

function getProgress(service){
  const totalNumberOfFields = SERVICE_FIELDS.length + DOCUMENT_FIELDS.length;
  const f = filterRoutes.bind(this, service);
  const fieldsWithMetadata = SERVICE_FIELDS.filter(f).length + DOCUMENT_FIELDS.filter(f).length;
  return Math.round((fieldsWithMetadata / totalNumberOfFields) * 100)
}

function ListItem({ service }) {
  return (
    <Link to={service.id} className="ListItem d-block py-4 border-top border-bottom">
      <div className="container d-flex justify-content-between align-items-center">
        <div>
          <h5 className="font-weight-normal m-0">{service.name}</h5>
          <span className="text-secondary">{getProgress(service)}% completed</span>
        </div>
        <Icon name="chevron-right" size="lg" />
      </div>
    </Link>
  );
}

export default ListItem;
