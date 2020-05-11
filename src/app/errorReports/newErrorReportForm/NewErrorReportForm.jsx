import React, { Component } from 'react';
import { connect } from 'react-redux';
import { postErrorReport, getLocation } from '../../../actions';
import { selectIsPostingErrorReport } from '../../../reducers';
import { selectLocationError, selectLocationData } from '../../../selectors/location';
import LoadingLabel from '../../../components/form/LoadingLabel';
import ErrorLabel from '../../../components/form/ErrorLabel';
import ErrorReportText from './ErrorReportText';
import ErrorReportInformationSelect from './ErrorReportInformationSelect';

class NewErrorReportForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      errorReportText: '',
      errorReportGeneralLocationError: false,
      errorReportServices: [],
      isErrorReportFinished: false,
    };

    // eslint-disable-next-line max-len
    this.onErrorReportGeneralLocationErrorChanged = this.onErrorReportGeneralLocationErrorChanged.bind(this);
    this.onErrorReportTextChanged = this.onErrorReportTextChanged.bind(this);
    this.onErrorReportServicesChanged = this.onErrorReportServicesChanged.bind(this);
    this.onErrorReportFinished = this.onErrorReportFinished.bind(this);
    this.onErrorReportSubmitted = this.onErrorReportSubmitted.bind(this);
  }

  componentDidMount() {
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

  onErrorReportFinished() {
    this.setState({ isErrorReportFinished: true });
  }

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
    const { isPostingErrorReport, locationError } = this.props;

    if (locationError) {
      return <ErrorLabel errorMessage={locationError} />;
    }

    // Comments component checks for (!locationData || isPostingErrorReport)
    // Not sure what the !locationData check was doing specifically
    if (isPostingErrorReport) {
      return (
        <LoadingLabel>
          <span>Adding error report...</span>
        </LoadingLabel>
      );
    }

    if (!this.state.isErrorReportFinished) {
      return (
        <ErrorReportInformationSelect
          match={this.props.match}
          generalLocationError={this.state.errorReportGeneralLocationError}
          errorReportServices={this.state.errorReportServices}
          onServiceChange={this.onErrorReportServicesChanged}
          onGeneralLocationChange={this.onErrorReportGeneralLocationErrorChanged}
          onSubmit={this.onErrorReportFinished}
        />
      );
    }

    return (
      <ErrorReportText
        match={this.props.match}
        errorReportText={this.state.errorReportText}
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
