import React from 'react';
import { connect } from 'react-redux';
import { selectLocationData } from '../../../reducers';
import { updateLocation } from '../../../actions';
import { getLocation } from '../../../actions';
import Form from '../common/Form';
import FormEdit from '../common/FormEdit';
import FormView from '../common/FormView';
import { compose, withProps } from 'recompose';

const LocationNumberEdit = compose(
  withProps({
    headerText : 'What\'s this location\'s phone number?',
    placeholderText : 'e.g. 646-909-4591',
  })
)(props => <FormEdit {...props} />)

const LocationNumberView = compose(
  withProps({
    topText : 'LOCATION PHONE NUMBER',
  })
)(props => <FormView {...props} />)

const LocationNumber = compose(
  withProps({
    viewComponent: LocationNumberView,
    editComponent: LocationNumberEdit
  })
)(props => <Form {...props} />)

const mapStateToProps = (state, ownProps) => {
  const locationId = ownProps.match.params.locationId;
  const locationData = selectLocationData(state, locationId);

  return {
    value: locationData && 
              locationData.Phones &&
              locationData.Phones[0] && 
              locationData.Phones[0].number ? 
              locationData.Phones[0].number : null,
    locationData 
  };
};

const mapDispatchToProps = (dispatch, ownProps) => ({
  updateValue: newLocationNumber => dispatch(updateLocation(ownProps.match.params.locationId, { Phones : [{number : newLocationNumber}]})),
  getLocation: (locationId) => {
    dispatch(getLocation(locationId));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(LocationNumber);
