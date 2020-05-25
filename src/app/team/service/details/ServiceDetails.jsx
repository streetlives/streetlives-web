import React from 'react';

import ErrorLabel from '../../../../components/form/ErrorLabel';
import Header from '../../../../components/header';
import ProgressBar from '../../../../components/progressBar';
import LoadingLabel from '../../../../components/form/LoadingLabel';
import NavBar from '../../../../components/navBar';
import FieldItem from '../../locationInfo/FieldItem';

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

function getUpdatedAt(service, route) {
  const { metaDataSection, fieldName, taxonomySpecificFieldName, selector } = route;

  if (selector) {
    const value = selector(service);
    return value ? value.updated_at : null;
  }

  if (taxonomySpecificFieldName) {
    const attributes = service.ServiceTaxonomySpecificAttributes;
    const field = attributes.find(el => el.attribute.name === taxonomySpecificFieldName);
    return field ? field.updated_at : null;
  }

  const subFields = service.metadata[metaDataSection];
  const field = subFields.find(el => el.field_name === fieldName);
  return field ? field.last_action_date : null;
}

function ListItem({ route, linkTo, service }) {
  const { label } = route;
  const updatedAt = getUpdatedAt(service, route);
  return <FieldItem title={label} linkTo={linkTo} updatedAt={updatedAt} />;
}

const ServiceDetails = ({
  service,
  backButtonTarget,
  getServiceUrl,
  locationData,
  locationError,
  serviceFields,
  children,
}) => {
  if (locationError) {
    return <ErrorLabel errorMessage={locationError} />;
  }

  if (!locationData ||
    Object.keys(locationData).length === 0 ||
    !service ||
    Object.keys(service).length === 0) {
    return <LoadingView />;
  }

  return (
    <div className="text-left d-flex flex-column">
      <NavBar backButtonTarget={backButtonTarget} title="Service Details" />
      <ProgressBar step={0} steps={serviceFields.length} />
      <ServiceHeader>Check all the {service.name} details</ServiceHeader>

      {serviceFields.map(field => (
        <ListItem
          key={field.label}
          route={field}
          linkTo={`${getServiceUrl()}${field.urlFragment}`}
          service={service}
        />
      ))}
      {children}
    </div>
  );
};

export default ServiceDetails;
