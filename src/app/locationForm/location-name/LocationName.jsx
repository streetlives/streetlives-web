/* eslint-disable max-len */
import React from 'react';
import { connect } from 'react-redux';
import { compose, withProps } from 'recompose';
import { getLocation as selectLocationData, getLocationError } from '../../../selectors/location';
import { updateLocation, getLocation } from '../../../actions';
import { Form } from '../../../components/form';
import LocationNameView from './LocationNameView';
import LocationNameEdit from './LocationNameEdit';

const LocationName = compose(withProps({
  ViewComponent: LocationNameView,
  EditComponent: LocationNameEdit,
}))(props => <Form {...props} />);

const mapStateToProps = (state, ownProps) => {
  const locationData = selectLocationData(state, ownProps);
  const locationError = getLocationError(state, ownProps);

  return {
    resourceData: locationData,
    value: locationData ? locationData.name : null,
    resourceLoadError: locationError 
  };
};

const mapDispatchToProps = (dispatch, ownProps) => ({
  updateValue: (name, _, metaDataSection, fieldName) =>
    dispatch(updateLocation(ownProps.match.params.locationId, { name }, metaDataSection, fieldName)),
  fetchResourceData: (locationId) => {
    dispatch(getLocation(locationId));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(LocationName);
