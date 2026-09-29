import React from 'react';
import { connect } from 'react-redux';
import { compose, withProps } from 'recompose';
import { selectLocationData, selectLocationError } from '../../../../selectors/location';
import {
  updateLocationStreetview,
  getLocation,
  uploadLocationPhoto,
  removeLocationPhoto,
} from '../../../../actions';
import { Form } from '../../../../components/form';
import LocationStreetviewView from './LocationStreetviewView';
import LocationStreetviewEdit from './LocationStreetviewEdit';

// Form hands its children a fixed prop list, so the photo actions are connected
// onto the two components directly rather than widening a component every other
// question also renders through. The location id comes from resourceData, which
// Form already passes to both.
const withPhotoActions = connect(null, (dispatch, ownProps) => ({
  onUploadPhoto: prepared =>
    dispatch(uploadLocationPhoto(ownProps.resourceData.id, prepared)),
  onRemovePhoto: () => dispatch(removeLocationPhoto(ownProps.resourceData.id)),
}));

const LocationStreetview = compose(withProps({
  ViewComponent: LocationStreetviewView,
  EditComponent: withPhotoActions(LocationStreetviewEdit),
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
