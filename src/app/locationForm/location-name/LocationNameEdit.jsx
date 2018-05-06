import React from 'react';
import { compose, withProps } from 'recompose';
import { FormEdit } from '../../../components/form';

const LocationNameEdit = compose(withProps({
  headerText: "What's this location's name?",
  placeholderText: 'Enter the name of the location',
}))(props => <FormEdit {...props} />);

export default LocationNameEdit;
