import React from 'react';
import { connect } from 'react-redux';
import { compose, withProps } from 'recompose';
import { selectLocationData, selectLocationError } from 'selectors/location';
import { updateOrganization, getLocation } from 'actions';
import { Form, FormEdit, FormView } from 'components/form';

const WebsiteEdit = compose(withProps({
  headerText: "What is this organization's website?",
  placeholderText: 'Enter a wesbite for this organization',
}))(props => <FormEdit {...props} />);

const WebsiteView = compose(withProps({
  topText: 'ORGANIZATION WEBSITE',
}))(props => <FormView {...props} />);

const Website = compose(withProps({
  ViewComponent: WebsiteView,
  EditComponent: WebsiteEdit,
}))(props => <Form {...props} />);

export const selectValue = locationData => (
  locationData && locationData.Organization && locationData.Organization.url
);

const mapStateToProps = (state, ownProps) => {
  const locationData = selectLocationData(state, ownProps);

  return {
    resourceData: locationData,
    value: selectValue(locationData),
    id: locationData && locationData.Organization && locationData.Organization.id,
    resourceLoadError: selectLocationError(state, ownProps),
  };
};

const mapDispatchToProps = (dispatch, ownProps) => ({
  updateValue: (newWebsite, organizationId, metaDataSection, fieldName) =>
    dispatch(updateOrganization(
      ownProps.match.params.locationId,
      organizationId,
      { url: newWebsite },
      metaDataSection,
      fieldName,
    )),
  fetchResourceData: (locationId) => {
    dispatch(getLocation(locationId));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(Website);
