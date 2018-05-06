import React from 'react';
import { connect } from 'react-redux';
import { compose, withProps } from 'recompose';

import { selectLocationData } from '../../../reducers';
import { updatePhone, getLocation, createPhone } from '../../../actions';
import { Form, FormView } from '../../../components/form';
import LocationNumberEdit from './LocationNumberEdit';

const getPhoneNumber = props =>
  props.value &&
  props.value.number &&
  `${props.value.number.replace(/\./g, '-')}${
    props.value.extension ? ` ext.${props.value.extension}` : ''
  }`;

const LocationNumberView = compose(withProps({
  topText: 'LOCATION PHONE NUMBER',
}))((props) => {
  const o = { ...props, value: getPhoneNumber(props) };
  return <FormView {...o} />;
});

const LocationNumber = compose(withProps({
  ViewComponent: LocationNumberView,
  EditComponent: LocationNumberEdit,
}))(props => <Form {...props} />);

const mapStateToProps = (state, ownProps) => {
  const { locationId } = ownProps.match.params;
  const locationData = selectLocationData(state, locationId);
  const phone = locationData && locationData.Phones && locationData.Phones[0];

  return {
    resourceData: locationData,
    value: phone,
    id: phone && phone.id,
  };
};

const mapDispatchToProps = (dispatch, ownProps) => ({
  updateValue: ({ number, extension }, phoneId, metaDataSection, fieldName) =>
    dispatch((phoneId ? updatePhone : createPhone)(
      ownProps.match.params.locationId,
      phoneId,
      { number, extension },
      metaDataSection,
      fieldName,
    )),
  fetchResourceData: (locationId) => {
    dispatch(getLocation(locationId));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(LocationNumber);
