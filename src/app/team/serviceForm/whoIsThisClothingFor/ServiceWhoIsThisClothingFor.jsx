import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { compose, withProps } from 'recompose';
import { getService, getServiceWearerAge, getServiceId } from '../../../../selectors/service';
import { selectLocationError } from '../../../../selectors/location';
import * as actions from '../../../../actions';
import { Form } from '../../../../components/form';
import WhoIsThisClothingForEdit from './WhoIsThisClothingForEdit';
import WhoIsThisClothingForView from './WhoIsThisClothingForView';
import { getWearerAgeFromOptions, getGenderFromOptions, getLabelsFromWearerAge } from './options';

const FormComponent = compose(withProps({
  ViewComponent: WhoIsThisClothingForView,
  EditComponent: WhoIsThisClothingForEdit,
}))(props => <Form {...props} />);

const mapStateToProps = (state, ownProps) => ({
  resourceData: getService(state, ownProps),
  value: getLabelsFromWearerAge(getServiceWearerAge(state, ownProps)),
  id: getServiceId(ownProps),
  resourceLoadError: selectLocationError(state, ownProps),
});

const mapDispatchToProps = (dispatch, ownProps) => ({
  fetchResourceData: bindActionCreators(actions.getLocation, dispatch),
  updateValue: (value, serviceId, metaDataSection, fieldName) =>
    dispatch(actions.updateService({
      locationId: ownProps.match.params.locationId,
      serviceId,
      params: {
        wearerAge: getWearerAgeFromOptions(value),
        gender: {
          eligible_values: getGenderFromOptions(value),
        },
      },
      metaDataSection,
      fieldName,
    })),
});

export default connect(mapStateToProps, mapDispatchToProps)(FormComponent);
