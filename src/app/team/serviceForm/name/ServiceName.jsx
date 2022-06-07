import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { compose, withProps } from 'recompose';

import { getService, getServiceName, getServiceId } from '../../../../selectors/service';
import { selectLocationError } from '../../../../selectors/location';

import * as actions from '../../../../actions';
import { Form, FormEdit, FormView } from '../../../../components/form';

const EditComponent = compose(withProps({
  headerText: 'What is this service called?',
  placeholderText: 'e.g. Mobile Market, Laundry, Friday Soup Kitchen',
}))(props => <FormEdit {...props} />);

const ViewComponent = compose(withProps({
  topText: 'SERVICE NAME',
}))(props => <FormView {...props} />);

const FormComponent = compose(withProps({
  ViewComponent,
  EditComponent,
}))(props => <Form {...props} />);

const mapStateToProps = (state, ownProps) => ({
  resourceData: getService(state, ownProps),
  value: getServiceName(state, ownProps),
  id: getServiceId(ownProps),
  resourceLoadError: selectLocationError(state, ownProps),
});

const mapDispatchToProps = (dispatch, ownProps) => ({
  fetchResourceData: bindActionCreators(actions.getLocation, dispatch),
  updateValue: (name, serviceId, metaDataSection, fieldName) =>
    dispatch(actions.updateService({
      locationId: ownProps.match.params.locationId,
      serviceId,
      params: { name },
      metaDataSection,
      fieldName,
    })),
});

export default connect(mapStateToProps, mapDispatchToProps)(FormComponent);
