import React from 'react';
import { connect } from 'react-redux';
import { selectLocationData } from '../../../reducers';
import { updateLocation } from '../../../actions';
import LocationNameView from './LocationNameView';
import LocationNameEdit from './LocationNameEdit';
import { getLocation } from '../../../actions';
import Form from '../common/Form';
import { compose, withProps } from 'recompose';

const LocationName = compose(
  withProps({
    viewComponent: LocationNameView,
    editComponent: LocationNameEdit
  })
)(props => <Form {...props} />)


const mapStateToProps = (state, ownProps) => {
  const locationId = ownProps.match.params.locationId;
  const locationData = selectLocationData(state, locationId);

  return {
    value: locationData ? locationData.name : null,
    locationData 
  };
};

const mapDispatchToProps = (dispatch, ownProps) => ({
  updateValue: (name, _, metaDataSection, fieldName) => (
    dispatch(
      updateLocation(
        ownProps.match.params.locationId, 
        { name },
        metaDataSection, 
        fieldName
      )
    )
  ),
  getLocation: (locationId) => {
    dispatch(getLocation(locationId));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(LocationName);
