import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { compose, withProps } from 'recompose';
import { getService, getServiceHasHivNutrition, getServiceId } from '../../../../selectors/service';
import { selectLocationError } from '../../../../selectors/location';
import * as actions from '../../../../actions';
import { Form } from '../../../../components/form';
import Edit from './Edit';
import View from './View';

const FormComponent = compose(withProps({
  ViewComponent: View,
  EditComponent: Edit,
}))(props => <Form {...props} />);

const mapStateToProps = (state, ownProps) => {
  const hivNutritionValues = getServiceHasHivNutrition(state, ownProps);
  const value =
    hivNutritionValues && hivNutritionValues.length === 1 && hivNutritionValues[0] === 'true';
  return {
    value,
    resourceData: getService(state, ownProps),
    id: getServiceId(ownProps),
    resourceLoadError: selectLocationError(state, ownProps),
  };
};

const mapDispatchToProps = (dispatch, ownProps) => ({
  fetchResourceData: bindActionCreators(actions.getLocation, dispatch),
  updateValue: (hasHivNutrition, serviceId, metaDataSection, fieldName) =>
    dispatch(actions.updateService({
      locationId: ownProps.match.params.locationId,
      serviceId,
      params: {
        hasHivNutrition: hasHivNutrition ? ['true'] : ['false'],
      },
      metaDataSection,
      fieldName,
    })),
});

export default connect(mapStateToProps, mapDispatchToProps)(FormComponent);
