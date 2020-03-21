import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { compose, withProps } from 'recompose';
import { getService, getIrregularOpeningHours, getServiceId } from '../../../selectors/service';
import { selectLocationError } from '../../../selectors/location';
import * as actions from '../../../actions';
import { Form } from '../../../components/form';
import { OCCASIONS } from '../../../Constants/';
import ServiceOpeningHoursEdit from '../serviceForm/openingHours/ServiceOpeningHoursEdit';
import ServiceOpeningHoursView from '../serviceForm/openingHours/ServiceOpeningHoursView';

const ViewComponent = compose(withProps({
  topText: 'CORONAVIRUS OPENING HOURS',
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
  value: getIrregularOpeningHours(state, ownProps)
    .filter(({ occasion, closed }) => occasion === OCCASIONS.COVID19 && !closed),
  id: getServiceId(ownProps),
  resourceLoadError: selectLocationError(state, ownProps),
});

const mapDispatchToProps = (dispatch, ownProps) => ({
  fetchResourceData: bindActionCreators(actions.getLocation, dispatch),
  updateValue: (hours, serviceId, metaDataSection, fieldName) =>
    dispatch(actions.updateService({
      locationId: ownProps.match.params.locationId,
      serviceId,
      params: {
        [fieldName]: hours.map(hoursPart => ({
          closed: false,
          ...hoursPart,
          occasion: OCCASIONS.COVID19,
        })),
      },
      metaDataSection,
      fieldName,
    })),
});

export default connect(mapStateToProps, mapDispatchToProps)(FormComponent);
