import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { compose, withProps } from 'recompose';

import { getDocuments, getDocumentAdditionalInfo } from '../../../selectors/document';
import { getServiceId } from '../../../selectors/service';
import { getLocationError } from '../../../selectors/location';

import * as actions from '../../../actions';
import { Form, FormEdit, FormView } from '../../../components/form';

const EditComponent = compose(withProps({
  headerText: 'Would you like to provide any other information about required documents?',
  placeholderText: 'e.g. All Photo IDs shown must be valid',
}))(props => <FormEdit {...props} />);

const ViewComponent = compose(withProps({
  topText: 'OTHER INFORMATION',
}))(props => <FormView {...props} />);

const FormComponent = compose(withProps({
  ViewComponent,
  EditComponent,
}))(props => <Form {...props} />);

const mapStateToProps = (state, ownProps) => ({
  resourceData: getDocuments(state, ownProps),
  value: getDocumentAdditionalInfo(state, ownProps),
  id: getServiceId(ownProps),
  resourceLoadError: getLocationError(state, ownProps),
});

const mapDispatchToProps = (dispatch, ownProps) => ({
  fetchResourceData: bindActionCreators(actions.getLocation, dispatch),
  updateValue: (additionalInfo, serviceId, metaDataSection, fieldName) =>
    dispatch(actions.updateService({
      locationId: ownProps.match.params.locationId,
      serviceId,
      params: { documents: { additionalInfo } },
      metaDataSection,
      fieldName,
    })),
});

export default connect(mapStateToProps, mapDispatchToProps)(FormComponent);
