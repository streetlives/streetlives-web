import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import { postErrorReport, getLocation } from '../../../actions';
import { selectIsPostingErrorReport } from '../../../reducers';
import { selectLocationError, selectLocationData } from '../../../selectors/location';
import LoadingLabel from '../../../components/form/LoadingLabel';
import ErrorLabel from '../../../components/form/ErrorLabel';
import Modal from '../../../components/modal';
import Icon from '../../../components/icon';
// import ErrorReportText from './ErrorReportText';
// import ErrorReportInformationSelect from './ErrorReportInformationSelect';
import ErrorReportRoutes from './Router';

// Remove this style, if no longer needed
const fullScreenStyles = {
  position: 'absolute',
  top: '0',
  left: '0',
  width: '100%',
  height: '100%',
  overflow: 'auto',
};

const LoadingView = ({ message }) => (
  <div className="m-4">
    <LoadingLabel>
      {message}
    </LoadingLabel>
  </div>
);

class ErrorReportContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      errorReportText: '',
      errorReportGeneralLocationError: false,
      errorReportServices: [],
      // isOnErrorReportTextScreen: false, // control with Router
    };

    // eslint-disable-next-line max-len
    this.onErrorReportGeneralLocationErrorChanged = this.onErrorReportGeneralLocationErrorChanged.bind(this);
    this.onErrorReportTextChanged = this.onErrorReportTextChanged.bind(this);
    this.onErrorReportServicesChanged = this.onErrorReportServicesChanged.bind(this);
    // this.onErrorReportTextScreen = this.onErrorReportTextScreen.bind(this);
    this.onErrorReportSubmitted = this.onErrorReportSubmitted.bind(this);
  }

  componentDidMount() {
    if (!this.props.locationData) {
      this.props.getLocation(this.props.match.params.locationId);
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.isPostingErrorReport && !this.props.isPostingErrorReport) {
      this.props.history.push(`/find/location/${this.props.match.params.locationId}/thanks`);
    }
  }

  onErrorReportTextChanged(event) {
    this.setState({ errorReportText: event.target.value });
  }

  onErrorReportServicesChanged(value) {
    this.setState((state) => {
      const errorReportServices = state.errorReportServices.includes(value)
        ? state.errorReportServices.filter(service => service !== value)
        : [...state.errorReportServices, value];
      return {
        errorReportServices,
      };
    });
  }

  onErrorReportGeneralLocationErrorChanged(value) {
    this.setState({ errorReportGeneralLocationError: value });
  }

  // onErrorReportTextScreen() {
  //   this.setState({ isOnErrorReportTextScreen: true });
  // }

  onErrorReportSubmitted() {
    const {
      errorReportText,
      errorReportGeneralLocationError,
      errorReportServices,
    } = this.state;

    this.props.postErrorReport(
      errorReportText,
      errorReportGeneralLocationError,
      errorReportServices,
    );
  }

  render() {
    const {
      locationData,
      isPostingErrorReport,
      locationError,
      goToViewLocation,
    } = this.props;

    if (locationError) {
      return <ErrorLabel errorMessage={locationError} />;
    }

    if (isPostingErrorReport) {
      return (
        <LoadingView message="Adding error report..." />
      );
    }

    if (!locationData) {
      return <LoadingView message="Loading location..." />;
    }

    return (
      <div style={fullScreenStyles}>
        <Modal>
          <div className="mx-3 mt-4 position-relative">
            <Icon
              name="times"
              onClick={goToViewLocation}
              style={{
                position: 'absolute',
                right: 0,
                top: '0.2em',
              }}
            />
          </div>
          <ErrorReportRoutes {...this.props} />
        </Modal>
      </div>
    );
  }
}

const mapStateToProps = (state, ownProps) => {
  const locationData = selectLocationData(state, ownProps);
  const locationError = selectLocationError(state, ownProps);
  const isPostingErrorReport = selectIsPostingErrorReport(state);

  if (!locationData) {
    return { locationError };
  }

  return {
    locationData,
    locationError,
    isPostingErrorReport,
    organizationName: locationData.Organization.name,
    organizationId: locationData.Organization.id,
  };
};

const mapDispatchToProps = (dispatch, ownProps) => ({
  getLocation: locationId => dispatch(getLocation(locationId)),
  goToViewLocation: () => ownProps.history.push(`/find/location/${ownProps.match.params.locationId}`),
  postErrorReport: (content, generalLocationError, services) => dispatch(postErrorReport(
    ownProps.match.params.locationId,
    { content, generalLocationError, services },
  )),
});

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(ErrorReportContainer));
