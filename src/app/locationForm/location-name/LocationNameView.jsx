import React from 'react';
import FormView from '../common/FormView';
import { compose, withProps } from 'recompose';

const LocationNameView = compose(
  withProps({
    topText : 'LOCATION NAME (OPTIONAL)',
  })
)(props => <FormView {...props} />)

export default LocationNameView;
