import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { compose, withProps } from 'recompose';
import ServiceOpeningHoursEdit from './ServiceOpeningHoursEdit';
import ServiceOpeningHoursView from './ServiceOpeningHoursView';
import { getService, getServiceOpeningHours, getServiceId } from '../../../selectors/service';
import { getLocationError } from '../../../selectors/location';
import * as actions from '../../../actions';
import { Form } from '../../../components/form';

const ViewComponent = compose(withProps({
  topText: 'OPENING HOURS',
}))(props => <ServiceOpeningHoursView {...props} />);

const EditComponent = compose(withProps({
  viewMode: false,
}))(props => <ServiceOpeningHoursEdit {...props} />);

const FormComponent = compose(withProps({
  ViewComponent,
  EditComponent,
}))(props => <Form {...props} />);

const mapStateToProps = (state, ownProps) => ({
  resourceData: getService(state, ownProps),
  value: getServiceOpeningHours(state, ownProps),
  id: getServiceId(ownProps),
  resourceLoadError: getLocationError(state, ownProps)
});

const mapDispatchToProps = (dispatch, ownProps) => ({
  fetchResourceData: bindActionCreators(actions.getLocation, dispatch),
  updateValue: (hours, serviceId, metaDataSection, fieldName) =>
    dispatch(actions.updateService({
      locationId: ownProps.match.params.locationId,
      serviceId,
      params: { hours },
      metaDataSection,
      fieldName,
    })),
});

export default connect(mapStateToProps, mapDispatchToProps)(FormComponent);
