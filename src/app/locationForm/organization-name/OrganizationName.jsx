import React from 'react';
import { connect } from 'react-redux';
import { selectLocationData } from '../../../reducers';
import { updateOrganization } from '../../../actions';
import { getLocation } from '../../../actions';
import Form from '../common/Form';
import FormEdit from '../common/FormEdit';
import FormView from '../common/FormView';
import { compose, withProps } from 'recompose';

const OrganizationNameEdit = compose(
  withProps({
    headerText : 'What\'s this organizations\'s name?',
    placeholderText : 'Enter the name of the organization',
  })
)(props => <FormEdit {...props} />)

const OrganizationNameView = compose(
  withProps({
    topText : 'ORGANIZATION NAME',
  })
)(props => <FormView {...props} />)

const OrganizationName = compose(
  withProps({
    viewComponent: OrganizationNameView,
    editComponent: OrganizationNameEdit
  })
)(props => <Form {...props} />)

const mapStateToProps = (state, ownProps) => {
  const locationId = ownProps.match.params.locationId;
  const locationData = selectLocationData(state, locationId);

  return {
    value: locationData && 
              locationData.Organization && 
              locationData.Organization.name ? 
              locationData.Organization.name : null,
    locationData,
    id : locationData && 
          locationData.Organization &&
          locationData.Organization.id
  };
};

const mapDispatchToProps = (dispatch, ownProps) => ({
  updateValue: (newOrganizationName, organizationId) => dispatch(updateOrganization(ownProps.match.params.locationId, organizationId, {name : newOrganizationName})),
  getLocation: (locationId) => {
    dispatch(getLocation(locationId));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(OrganizationName);
