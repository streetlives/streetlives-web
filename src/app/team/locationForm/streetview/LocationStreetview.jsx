import React from 'react';
import { connect } from 'react-redux';
import { compose, withProps } from 'recompose';
import { selectLocationData, selectLocationError } from '../../../../selectors/location';
import { updateLocationStreetview, getLocation } from '../../../../actions';
import { Form } from '../../../../components/form';
import LocationStreetviewView from './LocationStreetviewView';
import LocationStreetviewEdit from './LocationStreetviewEdit';

const LocationStreetview = compose(withProps({
  ViewComponent: LocationStreetviewView,
  EditComponent: LocationStreetviewEdit,
  isEditing: value => !value,
}))(props => <Form {...props} />);

export const selectValue = locationData => (
  locationData ? locationData.Streetview : null
);

const mapStateToProps = (state, ownProps) => {
  const locationData = selectLocationData(state, ownProps);
  const locationError = selectLocationError(state, ownProps);

  // Treat resourceData as unloaded when the streetview key is absent from the cached location
  // data (stale fetch from before the backend added this field). This causes Form to re-fetch.
  const streetviewKeyPresent = locationData &&
    Object.prototype.hasOwnProperty.call(locationData, 'Streetview');

  return {
    resourceData: streetviewKeyPresent ? locationData : null,
    value: selectValue(locationData),
    resourceLoadError: locationError,
  };
};

const mapDispatchToProps = (dispatch, ownProps) => ({
  updateValue: (streetviewData, id, metaDataSection, fieldName) =>
    dispatch(updateLocationStreetview(
      ownProps.match.params.locationId,
      streetviewData,
      metaDataSection,
      fieldName,
    )),
  fetchResourceData: (locationId) => {
    dispatch(getLocation(locationId));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(LocationStreetview);
