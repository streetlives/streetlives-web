import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { compose, withProps } from 'recompose';
import { getService, getServiceId } from '../../../../selectors/service';
import { selectLocationError } from '../../../../selectors/location';
import { getLocation, updateService } from '../../../../actions';
import { Form } from '../../../../components/form';
import MembershipCriteriaEdit from './MembershipCriteriaEdit';
import MembershipCriteriaView from './MembershipCriteriaView';

export const selector = service =>
  (service.Eligibilities || []).find(e => e.EligibilityParameter.name === 'membership') || {};

const FormComponent = compose(withProps({
  ViewComponent: MembershipCriteriaView,
  EditComponent: MembershipCriteriaEdit,
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
  fetchResourceData: bindActionCreators(getLocation, dispatch),
  updateValue: (membership, serviceId, metaDataSection, fieldName) => {
    const params = { membership };

    dispatch(updateService({
      locationId: ownProps.match.params.locationId,
      serviceId,
      params,
      metaDataSection,
      fieldName,
    }));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(FormComponent);
