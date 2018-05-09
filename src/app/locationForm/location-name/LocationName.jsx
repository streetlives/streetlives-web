/* eslint-disable max-len */
import React from 'react';
import { connect } from 'react-redux';
import { compose, withProps } from 'recompose';
import { selectLocationData } from '../../../reducers';
import { updateLocation, getLocation } from '../../../actions';
import { Form } from '../../../components/form';
import LocationNameView from './LocationNameView';
import LocationNameEdit from './LocationNameEdit';

const LocationName = compose(withProps({
  ViewComponent: LocationNameView,
  EditComponent: LocationNameEdit,
}))(props => <Form {...props} />);

const mapStateToProps = (state, ownProps) => {
  const { locationId } = ownProps.match.params;
  const locationData = selectLocationData(state, locationId);

  return {
    resourceData: locationData,
    value: locationData ? locationData.name : null,
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
