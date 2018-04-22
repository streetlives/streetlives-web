import React from 'react';
import { connect } from 'react-redux';
import { selectLocationData } from '../../../reducers';
import { updateLocation } from '../../../actions';
import { getLocation } from '../../../actions';
import Form from '../common/Form';
import FormEdit from '../common/FormEdit';
import FormView from '../common/FormView';
import { compose, withProps } from 'recompose';

const OrganizationDescriptionEdit = compose(
  withProps({
    headerText : 'How would you describe this organization?',
    placeholderText : 'Enter a description of the location',
  })
)(props => <FormEdit {...props} />)

const OrganizationDescriptionView = compose(
  withProps({
    topText : 'LOCATION DESCRIPTION',
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
              locationData.description ? 
              locationData.description : null,
    locationData 
  };
};

const mapDispatchToProps = (dispatch, ownProps) => ({
  updateValue: newOrganizationDescription => dispatch(updateLocation(ownProps.match.params.locationId, { description : newOrganizationDescription})),
  getLocation: (locationId) => {
    dispatch(getLocation(locationId));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(OrganizationDescription);
