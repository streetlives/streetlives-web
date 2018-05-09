import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { compose, withProps } from 'recompose';

import { getService, getServiceNicknames, getServiceId } from '../../../selectors/service';

import * as actions from '../../../actions';
import { Form, FormEdit, FormView } from '../../../components/form';

const EditComponent = compose(withProps({
  headerText: 'Does this service have an alternative name?',
  placeholderText: 'e.g. BNL Pantry',
}))(props => <FormEdit {...props} />);

const ViewComponent = compose(withProps({
  topText: 'SERVICE NICKNAMES',
}))(props => <FormView {...props} />);

const FormComponent = compose(withProps({
  ViewComponent,
  EditComponent,
}))(props => <Form {...props} />);

const mapStateToProps = (state, ownProps) => ({
  resourceData: getService(state, ownProps),
  value: getServiceNicknames(state, ownProps),
  id: getServiceId(ownProps),
});

const mapDispatchToProps = (dispatch, ownProps) => ({
  fetchResourceData: bindActionCreators(actions.getLocation, dispatch),
  updateValue: (nicknames, serviceId, metaDataSection, fieldName) =>
    dispatch(actions.updateService({
      locationId: ownProps.match.params.locationId,
      serviceId,
      params: { nicknames },
      metaDataSection,
      fieldName,
    })),
});

export default connect(mapStateToProps, mapDispatchToProps)(FormComponent);
