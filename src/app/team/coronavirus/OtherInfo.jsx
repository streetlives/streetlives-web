import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { compose, withProps } from 'recompose';

import { getService, getEventRelatedInfo, getServiceId } from '../../../selectors/service';
import { selectLocationError } from '../../../selectors/location';

import * as actions from '../../../actions';
import { Form, FormEdit, FormView } from '../../../components/form';
import { OCCASIONS } from '../../../Constants/';

const EditComponent = compose(withProps({
  headerText: 'Any other information about operation of this service ' +
    'during the coronavirus outbreak?',
  placeholderText: 'e.g. Open only to ages 65 and over every day at 4-5pm',
  multiline: true,
}))(props => <FormEdit {...props} />);

const ViewComponent = compose(withProps({
  topText: 'OTHER INFORMATION',
}))(props => <FormView {...props} />);

const FormComponent = compose(withProps({
  ViewComponent,
  EditComponent,
}))(props => <Form {...props} />);

const mapStateToProps = (state, ownProps) => {
  const eventRelatedInfo = getEventRelatedInfo(state, ownProps)
    .filter(({ event }) => event === OCCASIONS.COVID19)[0];

  return {
    resourceData: getService(state, ownProps),
    value: eventRelatedInfo && eventRelatedInfo.information,
    id: getServiceId(ownProps),
    resourceLoadError: selectLocationError(state, ownProps),
  };
};

const mapDispatchToProps = (dispatch, ownProps) => ({
  fetchResourceData: bindActionCreators(actions.getLocation, dispatch),
  updateValue: (information, serviceId, metaDataSection, fieldName) =>
    dispatch(actions.updateService({
      locationId: ownProps.match.params.locationId,
      serviceId,
      params: { eventRelatedInfo: { event: OCCASIONS.COVID19, information: information || null } },
      metaDataSection,
      fieldName,
    })),
});

export default connect(mapStateToProps, mapDispatchToProps)(FormComponent);
