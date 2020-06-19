import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { compose, withProps } from 'recompose';
import {
  getService,
  getServiceId,
} from '../../../../selectors/service';
import { selectLocationError } from '../../../../selectors/location';
import * as actions from '../../../../actions';
import { Form } from '../../../../components/form';
import Edit from './Edit';
import View from './View';

export const selector = service => (service.ServiceAreas || [])[0] || null;

const FormComponent = compose(withProps({
  ViewComponent: View,
  EditComponent: Edit,
}))(props => <Form {...props} />);

const mapStateToProps = (state, ownProps) => {
  const serviceData = getService(state, ownProps);

  return {
    resourceData: serviceData,
    value: selector(serviceData),
    id: getServiceId(ownProps),
    resourceLoadError: selectLocationError(state, ownProps),
  };
};

const mapDispatchToProps = (dispatch, ownProps) => ({
  fetchResourceData: bindActionCreators(actions.getLocation, dispatch),
  updateValue: (area, serviceId, metaDataSection, fieldName) =>
    dispatch(actions.updateService({
      locationId: ownProps.match.params.locationId,
      serviceId,
      params: { area },
      metaDataSection,
      fieldName,
    })),
});

export default connect(mapStateToProps, mapDispatchToProps)(FormComponent);
