import React from 'react';
import FormEdit from '../common/FormEdit';
import { compose, withProps } from 'recompose';

const LocationNameEdit = compose(
  withProps({
    headerText : 'What\'s this location\'s name?',
    placeholderText : 'Enter the name of the location',
  })
)(props => <FormEdit {...props} />)


export default LocationNameEdit;
