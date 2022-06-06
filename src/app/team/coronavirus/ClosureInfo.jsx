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
  multiline: true,
}))(props => <FormEdit {...props} />);

const ClosureInfoView = compose(withProps({
  topText: 'CLOSURE INFO',
}))(props => <FormView {...props} />);

const defaultClosureInfo = 'This location is temporarily closed.';

const ClosureInfo = (props) => {
  const { pathname } = props.location;
  const showThanks = pathname.split('/').pop() === 'thanks';

  const backButtonTarget = `${pathname.slice(0, pathname.indexOf('/closureInfo'))}/isClosed`;
  const backToEditTarget = pathname.slice(0, pathname.indexOf('/thanks'));
  const backToMapTarget = pathname.slice(0, pathname.indexOf('/location'));

  return (
    <div className="text-left">
      <div style={overlayStyles(showThanks)}>
        <ThanksOverlay.GaussianBlur />
        <NavBar
          backButtonTarget={backButtonTarget}
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
              value={props.value && props.value.trim().length ? props.value : defaultClosureInfo}
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
          onNextSection={() => props.history.push(backToMapTarget)}
          onBackSection={() => props.history.push(backToEditTarget)}
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
      { eventRelatedInfo: { information: closureInfo || defaultClosureInfo, event: OCCASIONS.COVID19 } },
      metaDataSection,
      fieldName,
    )),
  fetchResourceData: (locationId) => {
    dispatch(getLocation(locationId));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(ClosureInfo);
