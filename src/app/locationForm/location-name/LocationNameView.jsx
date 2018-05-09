import React from 'react';
import { compose, withProps } from 'recompose';
import { FormView } from '../../../components/form';

const LocationNameView = compose(withProps({
  topText: 'LOCATION NAME (OPTIONAL)',
}))(props => <FormView {...props} />);

export default LocationNameView;
