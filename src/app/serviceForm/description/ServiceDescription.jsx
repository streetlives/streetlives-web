import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { compose, withProps } from 'recompose';

import { getService, getServiceDescription, getServiceId } from 'selectors/service';
import { selectLocationError } from 'selectors/location';

import * as actions from 'actions';
import { Form, FormEdit, FormView } from 'components/form';

const EditComponent = compose(withProps({
  headerText: 'How would you describe this service?',
  placeholderText: 'e.g. Free Breakfast & Lunch, 2 helpings',
}))(props => <FormEdit {...props} />);

const ViewComponent = compose(withProps({
  topText: 'SERVICE DESCRIPTION',
}))(props => <FormView {...props} />);

const FormComponent = compose(withProps({
  ViewComponent,
  EditComponent,
}))(props => <Form {...props} />);

const mapStateToProps = (state, ownProps) => ({
  resourceData: getService(state, ownProps),
  value: getServiceDescription(state, ownProps),
  id: getServiceId(ownProps),
  resourceLoadError: selectLocationError(state, ownProps),
});

const mapDispatchToProps = (dispatch, ownProps) => ({
  fetchResourceData: bindActionCreators(actions.getLocation, dispatch),
  updateValue: (description, serviceId, metaDataSection, fieldName) =>
    dispatch(actions.updateService({
      locationId: ownProps.match.params.locationId,
      serviceId,
      params: { description },
      metaDataSection,
      fieldName,
    })),
});

export default connect(mapStateToProps, mapDispatchToProps)(FormComponent);
