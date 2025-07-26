import React from 'react';
import { compose, withProps } from 'recompose';
import { FormEdit } from '../../../../components/form';

const LocationStreetviewEdit = compose(withProps({
  headerText: 'What is the streetview for this location (leave blank for default)?',
  placeholderText: 'Enter the google map streetview url',
}))(props => <FormEdit {...props} />);

export default LocationStreetviewEdit;
