import React from 'react';
import { connect } from 'react-redux';
import { selectLocationData } from '../../../reducers';
import { updateLocation } from '../../../actions';
import { getLocation } from '../../../actions';
import Form from '../common/Form';
import FormEdit from '../common/FormEdit';
import FormView from '../common/FormView';
import { compose, withProps } from 'recompose';

const LocationDescriptionEdit = compose(
  withProps({
    headerText : 'Please describe this location',
    placeholderText : 'Enter a description of the location',
  })
)(props => <FormEdit {...props} />)

const LocationDescriptionView = compose(
  withProps({
    topText : 'LOCATION DESCRIPTION',
  })
)(props => <FormView {...props} />)

const LocationDescription = compose(
  withProps({
    viewComponent: LocationDescriptionView,
    editComponent: LocationDescriptionEdit
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
  updateValue: newLocationDescription => dispatch(updateLocation(ownProps.match.params.locationId, { description : newLocationDescription})),
  getLocation: (locationId) => {
    dispatch(getLocation(locationId));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(LocationDescription);
