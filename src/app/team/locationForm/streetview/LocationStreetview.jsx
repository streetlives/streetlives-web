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
  isEditing: value => false,
}))(props => <Form {...props} />);

export const selectValue = locationData => (
  locationData ? locationData.Streetview : null
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
