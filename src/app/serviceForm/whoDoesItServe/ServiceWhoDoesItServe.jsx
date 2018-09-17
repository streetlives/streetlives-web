import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { compose, withProps } from 'recompose';
import WhoDoesItServeEdit from './WhoDoesItServeEdit';
import WhoDoesItServeView from './WhoDoesItServeView';
import { getService, getServiceWhoDoesItServe, getServiceId } from '../../../selectors/service';
import { selectLocationError } from '../../../selectors/location';
import * as actions from '../../../actions';
import { Form } from '../../../components/form';
import { isEditing } from './util';

const FormComponent = compose(withProps({
  ViewComponent: WhoDoesItServeView,
  EditComponent: WhoDoesItServeEdit,
  isEditing,
}))(props => <Form {...props} />);

const mapStateToProps = (state, ownProps) => ({
  resourceData: getService(state, ownProps),
  value: getServiceWhoDoesItServe(state, ownProps),
  id: getServiceId(ownProps),
  resourceLoadError: selectLocationError(state, ownProps),
});

const mapDispatchToProps = (dispatch, ownProps) => ({
  fetchResourceData: bindActionCreators(actions.getLocation, dispatch),
  updateValue: (whoDoesItServe, serviceId, metaDataSection, fieldName) =>
    dispatch(actions.updateService({
      locationId: ownProps.match.params.locationId,
      serviceId,
      params: { whoDoesItServe },
      metaDataSection,
      fieldName,
    })),
});

export default connect(mapStateToProps, mapDispatchToProps)(FormComponent);
