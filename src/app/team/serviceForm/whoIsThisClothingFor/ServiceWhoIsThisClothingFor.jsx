import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { compose, withProps } from 'recompose';
import { getService, getServiceWearerAge, getServiceId } from '../../../../selectors/service';
import { selectLocationError } from '../../../../selectors/location';
import * as actions from '../../../../actions';
import { Form } from '../../../../components/form';
import WhatKindOfClothingEdit from './WhatKindOfClothingEdit';
import WhatKindOfClothingView from './WhatKindOfClothingView';

const FormComponent = compose(withProps({
  ViewComponent: WhatKindOfClothingView,
  EditComponent: WhatKindOfClothingEdit
}))(props => <Form {...props} />);

const mapStateToProps = (state, ownProps) => ({
  resourceData: getService(state, ownProps),
  value: getServiceWearerAge(state, ownProps),
  id: getServiceId(ownProps),
  resourceLoadError: selectLocationError(state, ownProps),
});

const mapDispatchToProps = (dispatch, ownProps) => ({
  fetchResourceData: bindActionCreators(actions.getLocation, dispatch),
  updateValue: (wearerAge, serviceId, metaDataSection, fieldName) =>
    dispatch(actions.updateService({
      locationId: ownProps.match.params.locationId,
      serviceId,
      params: { wearerAge },
      metaDataSection,
      fieldName,
    })),
});

export default connect(mapStateToProps, mapDispatchToProps)(FormComponent);
