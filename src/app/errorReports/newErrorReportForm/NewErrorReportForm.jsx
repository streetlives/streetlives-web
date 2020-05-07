import React, { Component } from 'react';
import { connect } from 'react-redux';
import { postErrorReport, getLocation } from '../../../actions';
import { selectIsPostingErrorReport } from '../../../reducers';
import { selectLocationError, selectLocationData } from '../../../selectors/location';
import LoadingLabel from '../../../components/form/LoadingLabel';
import ErrorLabel from '../../../components/form/ErrorLabel';
import ErrorReportText from './ErrorReportText';
import ErrorReportServices from './ErrorReportServices';

class NewErrorReportForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      errorReportText: '',
      errorReportGeneralLocationError: false,
      errorReportServices: [],
      isErrorReportFinished: false,
    };

    this.onErrorReportTextChanged = this.onErrorReportTextChanged.bind(this);
    this.onErrorReportServicesChanged = this.onErrorReportServicesChanged.bind(this);
    this.onErrorReportGeneralLocationErrorChanged = this.onErrorReportGeneralLocationErrorChanged.bind(this);
    this.onErrorReportFinished = this.onErrorReportFinished.bind(this);
    this.onErrorReportSubmitted = this.onErrorReportSubmitted.bind(this);
  }

  componentDidMount() {
    console.log('Component mounting with props:', this.props);
    if (!this.props.locationData) {
      this.props.getLocation(this.props.match.params.locationId);
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.isPostingErrorReport && !this.props.isPostingErrorReport) {
      this.props.history.push(`/errorreports/${this.props.match.params.locationId}/thanks`);
    }
  }

  onErrorReportTextChanged(text) {
    this.setState({ errorReportText: text });
  }

  onErrorReportServicesChanged(service) {
    console.log('onErrorReportServicesChanged triggered with', service);
    // handle generalLocationError
    this.setState({ errorReportServices: [], errorReportGeneralLocationError: false }); // FIX
  }

  onErrorReportGeneralLocationErrorChanged(value) {
    this.setState({ errorReportGeneralLocationError: value });
  }

  onErrorReportFinished() {
    console.log('onErrorReportFinished triggered.');
    this.setState({ isErrorReportFinished: true });
  }

  onErrorReportSubmitted(info) {
    console.log('onErrorReportSubmitted triggered.');
    this.props.postErrorReport(
      this.state.errorReportText,
      this.state.errorReportGeneralLocationError,
      this.state.errorReportServices,
    );
  }

  render() {
    const { locationData, isPostingErrorReport, locationError } = this.props;

    if (locationError) {
      return <ErrorLabel errorMessage={locationError} />;
    }

    if (/* !locationData || */ isPostingErrorReport) {
      return (
        <LoadingLabel>
          <span>Adding error report...</span>
        </LoadingLabel>
      );
    }

    if (!this.state.isErrorReportFinished) {
      return (
        <ErrorReportServices
          match={this.props.match}
          generalLocationError={this.state.errorReportGeneralLocationError}
          services={this.state.errorReportServices}
          onServiceChange={this.onErrorReportServicesChanged}
          onGeneralLocationChange={this.onErrorReportGeneralLocationErrorChanged}
          onSubmit={this.onErrorReportFinished}
        />
      );
    }

    return (
      <ErrorReportText
        match={this.props.match}
        value={this.state.errorReportText}
        onChange={this.onErrorReportTextChanged}
        onSubmit={this.onErrorReportSubmitted}
      />
    );
  }
}

const mapStateToProps = (state, ownProps) => ({
  locationData: selectLocationData(state, ownProps),
  locationError: selectLocationError(state, ownProps),
  isPostingErrorReport: selectIsPostingErrorReport(state),
});

const mapDispatchToProps = (dispatch, ownProps) => ({
  getLocation: locationId => dispatch(getLocation(locationId)),
  postErrorReport: (content, generalLocationError, services) => dispatch(postErrorReport(
    ownProps.match.params.locationId,
    { content, generalLocationError, services },
  )),
});

export default connect(mapStateToProps, mapDispatchToProps)(NewErrorReportForm);
