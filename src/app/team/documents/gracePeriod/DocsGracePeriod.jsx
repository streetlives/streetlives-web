import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { compose, withProps } from 'recompose';

import { getDocuments, getDocumentGracePeriod } from '../../../../selectors/document';
import { getServiceId } from '../../../../selectors/service';
import { selectLocationError } from '../../../../selectors/location';

import * as actions from '../../../../actions';
import { Form, FormEdit, FormView } from '../../../../components/form';

const EditComponent = compose(withProps({
  headerText: 'How long is the grace period?',
  placeholderText: 'e.g. 3 days',
}))(props => <FormEdit {...props} />);

const ViewComponent = compose(withProps({
  topText: 'GRACE PERIOD',
}))(props => <FormView {...props} />);

const FormComponent = compose(withProps({
  ViewComponent,
  EditComponent,
}))(props => <Form {...props} />);

const mapStateToProps = (state, ownProps) => ({
  resourceData: getDocuments(state, ownProps),
  value: getDocumentGracePeriod(state, ownProps),
  id: getServiceId(ownProps),
  resourceLoadError: selectLocationError(state, ownProps),
});

const mapDispatchToProps = (dispatch, ownProps) => ({
  fetchResourceData: bindActionCreators(actions.getLocation, dispatch),
  updateValue: (gracePeriod, serviceId, metaDataSection, fieldName) =>
    dispatch(actions.updateService({
      locationId: ownProps.match.params.locationId,
      serviceId,
      params: { documents: { gracePeriod } },
      metaDataSection,
      fieldName,
    })),
});

export default connect(mapStateToProps, mapDispatchToProps)(FormComponent);
