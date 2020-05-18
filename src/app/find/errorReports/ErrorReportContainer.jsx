/* eslint-disable max-len */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import { Route, Redirect, Switch } from 'react-router-dom';
import { postErrorReport, getLocation } from '../../../actions';
import { selectLocationError, selectLocationData } from '../../../selectors/location';
import LoadingLabel from '../../../components/form/LoadingLabel';
import NotFound from '../../notFound/NotFound';
import ErrorLabel from '../../../components/form/ErrorLabel';
import Modal from '../../../components/modal';
import Icon from '../../../components/icon';
import ErrorReportText from './ErrorReportText';
import ErrorReportInformationSelect from './ErrorReportInformationSelect';
import Thanks from './Thanks';

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
      errorReportInformation: {
        errorReportGeneralLocationError: false,
        errorReportServices: [],
      },
      errorReportText: '',
    };

    this.onErrorReportGeneralLocationErrorChanged = this.onErrorReportGeneralLocationErrorChanged.bind(this);
    this.onErrorReportTextChanged = this.onErrorReportTextChanged.bind(this);
    this.onErrorReportServicesChanged = this.onErrorReportServicesChanged.bind(this);
    this.onErrorReportSubmitted = this.onErrorReportSubmitted.bind(this);
  }

  componentDidMount() {
    if (!this.props.locationData) {
      this.props.getLocation();
    }
  }

  onErrorReportTextChanged(event) {
    this.setState({ errorReportText: event.target.value });
  }

  onErrorReportServicesChanged(value) {
    const newErrorReportInformation = { ...this.state.errorReportInformation };

    const newErrorReportServices = newErrorReportInformation.errorReportServices.includes(value)
      ? newErrorReportInformation.errorReportServices.filter(service => service !== value)
      : [...newErrorReportInformation.errorReportServices, value];

    newErrorReportInformation.errorReportServices = newErrorReportServices;

    this.setState({
      errorReportInformation: newErrorReportInformation,
    });
  }

  onErrorReportGeneralLocationErrorChanged(value) {
    const newErrorReportInformation = { ...this.state.errorReportInformation };

    newErrorReportInformation.errorReportGeneralLocationError = value;

    this.setState({
      errorReportInformation: newErrorReportInformation,
    });
  }

  onErrorReportSubmitted() {
    const data = {
      generalLocationError: this.state.errorReportInformation.errorReportGeneralLocationError,
      services: this.state.errorReportInformation.errorReportServices,
    };

    if (this.state.errorReportText !== '') {
      data.content = this.state.errorReportText;
    }

    this.props.postErrorReport(data);

    this.props.goToThanksScreen();
  }

  render() {
    const {
      locationData,
      locationError,
      goToViewLocation,
      goToErrorReportTextScreen,
    } = this.props;

    const {
      errorReportGeneralLocationError,
      errorReportServices,
    } = this.state.errorReportInformation;

    if (locationError) {
      return <ErrorLabel errorMessage={locationError} />;
    }

    if (!locationData) {
      return <LoadingView message="Loading location..." />;
    }

    return (
      <div>
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
          <Switch>
            <Redirect
              exact
              from={`${this.props.match.path}/`}
              to={`${this.props.match.path}/services`}
            />
            <Route
              exact
              path={`${this.props.match.path}/text`}
              render={() => (
                <ErrorReportText
                  match={this.props.match}
                  errorReportText={this.state.errorReportText}
                  onChange={this.onErrorReportTextChanged}
                  onSubmit={this.onErrorReportSubmitted}
                  goToViewLocation={goToViewLocation}
                />
              )}
            />
            <Route
              exact
              path={`${this.props.match.path}/thanks`}
              render={() => (
                <Thanks
                  goToViewLocation={goToViewLocation}
                />
              )}
            />
            <Route
              exact
              path={`${this.props.match.path}/services`}
              render={() => (
                <ErrorReportInformationSelect
                  locationData={locationData}
                  match={this.props.match}
                  generalLocationError={errorReportGeneralLocationError}
                  errorReportServices={errorReportServices}
                  onServiceChange={this.onErrorReportServicesChanged}
                  onGeneralLocationChange={this.onErrorReportGeneralLocationErrorChanged}
                  goToViewLocation={goToViewLocation}
                  goToErrorReportTextScreen={goToErrorReportTextScreen}
                />
              )}
            />
            <Route path="*" component={NotFound} />
          </Switch>
        </Modal>
      </div>
    );
  }
}

const mapStateToProps = (state, ownProps) => ({
  locationData: selectLocationData(state, ownProps),
  locationError: selectLocationError(state, ownProps),
});

const mapDispatchToProps = (dispatch, ownProps) => ({
  getLocation: () => dispatch(getLocation(ownProps.match.params.locationId)),
  goToThanksScreen: () => ownProps.history.push(`/find/location/${ownProps.match.params.locationId}/errorreports/thanks`),
  goToErrorReportTextScreen: () => ownProps.history.push(`/find/location/${ownProps.match.params.locationId}/errorreports/text`),
  goToViewLocation: () => ownProps.history.push(`/find/location/${ownProps.match.params.locationId}`),
  postErrorReport: data => dispatch(postErrorReport(
    ownProps.match.params.locationId,
    data,
  )),
});

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(ErrorReportContainer));
