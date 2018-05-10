import React from 'react';
import { connect } from 'react-redux';
import { selectLocationData } from '../../../reducers';
import { updateLocation } from '../../../actions';
import { getLocation } from '../../../actions';
import Form from '../common/Form';
import FormEdit from '../common/FormEdit';
import FormView from '../common/FormView';
import { compose, withProps } from 'recompose';

const LocationAddressEdit = compose(
  withProps({
    headerText : 'What\'s this location\'s address?',
    placeholderText : 'Enter the address of the location',
  })
)(props => <FormEdit {...props} />)

const LocationAddressView = compose(
  withProps({
    topText : 'LOCATION ADDRESS',
  })
)(props => <FormView {...props} />)

const LocationAddress = compose(
  withProps({
    viewComponent: LocationAddressView,
    editComponent: LocationAddressEdit
  })
)(props => <Form {...props} />)

const mapStateToProps = (state, ownProps) => {
  const locationId = ownProps.match.params.locationId;
  const locationData = selectLocationData(state, locationId);

  return {
    value: locationData && 
              locationData.address && 
              locationData.address && 
              locationData.address.street ? 
              locationData.address.street : null,
    locationData 
  };
};

      
const mapDispatchToProps = (dispatch, ownProps) => ({
  updateValue: (newAddress, _, metaDataSection, fieldName) => (
    dispatch(
      updateLocation(
        ownProps.match.params.locationId, 
        { address: { street : newAddress } },
        metaDataSection, 
        fieldName
      )
    )
  ),
  getLocation: (locationId) => {
    dispatch(getLocation(locationId));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(LocationAddress);
