import React from 'react';
import { connect } from 'react-redux';
import { selectLocationData } from '../../../reducers';
import { updateOrganization } from '../../../actions';
import { getLocation } from '../../../actions';
import Form from '../common/Form';
import FormEdit from '../common/FormEdit';
import FormView from '../common/FormView';
import { compose, withProps } from 'recompose';

const OrganizationDescriptionEdit = compose(
  withProps({
    headerText : 'How would you describe this organization?',
    placeholderText : 'Enter a description of the organization',
  })
)(props => <FormEdit {...props} />)

const OrganizationDescriptionView = compose(
  withProps({
    topText : 'ORGANIZATION DESCRIPTION',
  })
)(props => <FormView {...props} />)

const OrganizationDescription = compose(
  withProps({
    viewComponent: OrganizationDescriptionView,
    editComponent: OrganizationDescriptionEdit
  })
)(props => <Form {...props} />)

const mapStateToProps = (state, ownProps) => {
  const locationId = ownProps.match.params.locationId;
  const locationData = selectLocationData(state, locationId);

  return {
    value: locationData && 
          locationData.Organization &&
          locationData.Organization.description,
    locationData,
    id : locationData && 
          locationData.Organization &&
          locationData.Organization.id
  };
};

const mapDispatchToProps = (dispatch, ownProps) => ({
  updateValue: (newOrganizationDescription, organizationId, metaDataSection, fieldName) => (
    dispatch(
      updateOrganization(
        ownProps.match.params.locationId, 
        organizationId, 
        { description : newOrganizationDescription},
        metaDataSection, 
        fieldName
      )
    )
  ),
  getLocation: (locationId) => {
    dispatch(getLocation(locationId));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(OrganizationDescription);
