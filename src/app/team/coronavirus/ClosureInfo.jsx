import React from 'react';
import { connect } from 'react-redux';
import { compose, withProps } from 'recompose';
import {
  selectLocationData,
  selectLocationError,
  selectEventRelatedInfo,
} from '../../../selectors/location';
import { updateLocation, getLocation } from '../../../actions';
import { Form, FormEdit, FormView } from '../../../components/form';
import NavBar from '../../../components/navBar';
import ThanksOverlay, { overlayStyles } from '../locationForm/thanks/ThanksOverlay';
import { OCCASIONS } from '../../../Constants';

const thanksHeader = 'Great work!';
const thanksContent =
  "You're making it easier for people to get the help they need because of the work you're doing.";

const ClosureInfoEdit = compose(withProps({
  headerText: 'Update about the closure?',
  placeholderText: 'e.g. Current clients should contact their case managers for more information',
}))(props => <FormEdit {...props} />);

const ClosureInfoView = compose(withProps({
  topText: 'CLOSURE INFO',
}))(props => <FormView {...props} />);

const ClosureInfo = (props) => {
  const showThanks = props.location.pathname.split('/').pop() === 'thanks';

  return (
    <div className="text-left">
      <div style={overlayStyles(showThanks)}>
        <ThanksOverlay.GaussianBlur />
        <NavBar
          backButtonTarget={`/team/coronavirus/location/${props.match.params.locationId}/isClosed`}
          title="Closure info"
        />
        <div
          style={{ marginBottom: '5em' }}
          className="container"
        >
          <div className="row px-4">
            <Form
              {...props}
              ViewComponent={ClosureInfoView}
              EditComponent={ClosureInfoEdit}
              metaDataSection="location"
              fieldName="eventRelatedInfo"
              onFieldVerified={() => props.history.push(`${props.location.pathname}/thanks`)}
            />
          </div>
        </div>
      </div>
      {showThanks && (
        <ThanksOverlay
          header={thanksHeader}
          content={thanksContent}
          nextLabel="BACK TO THE MAP"
          backLabel="BACK TO EDIT"
          onNextSection={() => props.history.push('/team/coronavirus')}
          onBackSection={() => {
            const { pathname } = props.location;
            const serviceRecapUrl = pathname.slice(0, pathname.indexOf('/thanks'));
            props.history.push(serviceRecapUrl);
          }}
        />
      )}
    </div>
  );
};

export const selectValue = locationData => (
  locationData && locationData.eventRelatedInfo && locationData.Organization.url
);

const mapStateToProps = (state, ownProps) => {
  const locationData = selectLocationData(state, ownProps);
  const eventRelatedInfo = selectEventRelatedInfo(state, ownProps)
    .filter(({ event }) => event === OCCASIONS.COVID19)[0];

  return {
    resourceData: locationData,
    value: eventRelatedInfo && eventRelatedInfo.information,
    id: locationData && locationData.id,
    resourceLoadError: selectLocationError(state, ownProps),
  };
};

const mapDispatchToProps = (dispatch, ownProps) => ({
  updateValue: (closureInfo, organizationId, metaDataSection, fieldName) =>
    dispatch(updateLocation(
      ownProps.match.params.locationId,
      { eventRelatedInfo: { information: closureInfo, event: OCCASIONS.COVID19 } },
      metaDataSection,
      fieldName,
    )),
  fetchResourceData: (locationId) => {
    dispatch(getLocation(locationId));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(ClosureInfo);
