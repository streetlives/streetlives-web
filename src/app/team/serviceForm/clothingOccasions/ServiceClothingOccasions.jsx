import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { compose, withProps } from 'recompose';
import {
  getService,
  getServiceClothingOccasions,
  getServiceId,
} from '../../../../selectors/service';
import { selectLocationError } from '../../../../selectors/location';
import * as actions from '../../../../actions';
import { Form } from '../../../../components/form';
import ClothingOccasionsEdit from './ClothingOccasionsEdit';
import ClothingOccasionsView from './ClothingOccasionsView';

const FormComponent = compose(withProps({
  ViewComponent: ClothingOccasionsView,
  EditComponent: ClothingOccasionsEdit,
}))(props => <Form {...props} />);

const mapStateToProps = (state, ownProps) => ({
  resourceData: getService(state, ownProps),
  value: getServiceClothingOccasions(state, ownProps) || [],
  id: getServiceId(ownProps),
  resourceLoadError: selectLocationError(state, ownProps),
});

const mapDispatchToProps = (dispatch, ownProps) => ({
  fetchResourceData: bindActionCreators(actions.getLocation, dispatch),
  updateValue: (clothingOccasion, serviceId, metaDataSection, fieldName) =>
    dispatch(actions.updateService({
      locationId: ownProps.match.params.locationId,
      serviceId,
      params: { clothingOccasion },
      metaDataSection,
      fieldName,
    })),
});

export default connect(mapStateToProps, mapDispatchToProps)(FormComponent);
