/* eslint-disable max-len */
import React from 'react';
import { connect } from 'react-redux';
import { compose, withProps } from 'recompose';
import { selectLocationData, selectLocationError } from 'selectors/location';
import { updateLocation, getLocation } from 'actions';
import { Form } from 'components/form';
import LocationNameView from './LocationNameView';
import LocationNameEdit from './LocationNameEdit';

const LocationName = compose(withProps({
  ViewComponent: LocationNameView,
  EditComponent: LocationNameEdit,
}))(props => <Form {...props} />);

export const selectValue = locationData => (
  locationData ? locationData.name : null
);

const mapStateToProps = (state, ownProps) => {
  const locationData = selectLocationData(state, ownProps);
  const locationError = selectLocationError(state, ownProps);

  return {
    resourceData: locationData,
    value: selectValue(locationData),
    resourceLoadError: locationError,
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
