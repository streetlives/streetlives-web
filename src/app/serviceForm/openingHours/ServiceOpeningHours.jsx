import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { compose, withProps } from 'recompose';
import ServiceOpeningHoursEdit from './ServiceOpeningHoursEdit';
import { getService, getServiceOpeningHours, getServiceId } from '../../../selectors/service';
import * as actions from '../../../actions';
import { Form } from '../../../components/form';

const FormComponent = compose(withProps({
  ViewComponent: ServiceOpeningHoursEdit,
  EditComponent: ServiceOpeningHoursEdit,
}))(props => <Form {...props} />);

const mapStateToProps = (state, ownProps) => ({
  resourceData: getService(state, ownProps),
  value: getServiceOpeningHours(state, ownProps),
  id: getServiceId(ownProps),
});

const mapDispatchToProps = (dispatch, ownProps) => ({
  fetchResourceData: bindActionCreators(actions.getLocation, dispatch),
  updateValue: (hours, serviceId, metaDataSection, fieldName) =>
    dispatch(actions.updateService({
      locationId: ownProps.match.params.locationId,
      serviceId,
      params: hours,
      metaDataSection,
      fieldName,
    })),
});

export default connect(mapStateToProps, mapDispatchToProps)(FormComponent);
