import React from 'react';
import { connect } from 'react-redux';
import { compose, withProps } from 'recompose';
import { selectLocationData, selectLocationError } from '../../../selectors/location';
import { updateOrganization, getLocation } from '../../../actions';
import { Form, FormEdit, FormView } from '../../../components/form';

const OrganizationDescriptionEdit = compose(withProps({
  headerText: 'How would you describe this organization?',
  placeholderText: 'Enter a description of the organization',
}))(props => <FormEdit {...props} />);

const OrganizationDescriptionView = compose(withProps({
  topText: 'ORGANIZATION DESCRIPTION',
}))(props => <FormView {...props} />);

const OrganizationDescription = compose(withProps({
  ViewComponent: OrganizationDescriptionView,
  EditComponent: OrganizationDescriptionEdit,
}))(props => <Form {...props} />);

const mapStateToProps = (state, ownProps) => {
  const locationData = selectLocationData(state, ownProps);
  const locationError = selectLocationError(state, ownProps);

  return {
    resourceData: locationData,
    value: selectValue(locationData),
    id: locationData && locationData.Organization && locationData.Organization.id,
    resourceLoadError: locationError,
  };
};

export const selectValue = (locationData) => (
  locationData && locationData.Organization && locationData.Organization.description
);

const mapDispatchToProps = (dispatch, ownProps) => ({
  updateValue: (newOrganizationDescription, organizationId, metaDataSection, fieldName) =>
    dispatch(updateOrganization(
      ownProps.match.params.locationId,
      organizationId,
      { description: newOrganizationDescription },
      metaDataSection,
      fieldName,
    )),
  fetchResourceData: (locationId) => {
    dispatch(getLocation(locationId));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(OrganizationDescription);
