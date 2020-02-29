import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { compose, withProps } from 'recompose';

import { getDocuments, getDocumentRecertificationTime } from '../../../../selectors/document';
import { getServiceId } from '../../../../selectors/service';
import { selectLocationError } from '../../../../selectors/location';

import * as actions from '../../../../actions';
import { Form, FormEdit, FormView } from '../../../../components/form';

const EditComponent = compose(withProps({
  headerText: 'How often is the recertification?',
  placeholderText: 'e.g. Every six months',
}))(props => <FormEdit {...props} />);

const ViewComponent = compose(withProps({
  topText: 'RECERTIFICATION TIME',
}))(props => <FormView {...props} />);

const FormComponent = compose(withProps({
  ViewComponent,
  EditComponent,
}))(props => <Form {...props} />);

const mapStateToProps = (state, ownProps) => ({
  resourceData: getDocuments(state, ownProps),
  value: getDocumentRecertificationTime(state, ownProps),
  id: getServiceId(ownProps),
  resourceLoadError: selectLocationError(state, ownProps),
});

const mapDispatchToProps = (dispatch, ownProps) => ({
  fetchResourceData: bindActionCreators(actions.getLocation, dispatch),
  updateValue: (recertificationTime, serviceId, metaDataSection, fieldName) =>
    dispatch(actions.updateService({
      locationId: ownProps.match.params.locationId,
      serviceId,
      params: { documents: { recertificationTime } },
      metaDataSection,
      fieldName,
    })),
});

export default connect(mapStateToProps, mapDispatchToProps)(FormComponent);
