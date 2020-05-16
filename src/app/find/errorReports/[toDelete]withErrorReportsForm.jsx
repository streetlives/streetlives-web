import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import { getLocation } from '../../../actions';
import {
  selectLocationData,
  selectLocationError,
} from '../../../selectors/location';
import Modal from '../../../components/modal';
import Icon from '../../../components/icon';
import ErrorLabel from '../../../components/form/ErrorLabel';
import LoadingLabel from '../../../components/form/LoadingLabel';

const fullScreenStyles = {
  position: 'absolute',
  top: '0',
  left: '0',
  width: '100%',
  height: '100%',
  overflow: 'auto',
};

const LoadingView = () => (
  <div className="m-4">
    <LoadingLabel>
      Loading screen, be with you in a moment
    </LoadingLabel>
  </div>
);

const mapStateToProps = (state, ownProps) => {
  const locationData = selectLocationData(state, ownProps);
  const locationError = selectLocationError(state, ownProps);

  if (!locationData) {
    return { locationError };
  }

  return {
    locationData,
    locationError,
    organizationName: locationData.Organization.name,
    organizationId: locationData.Organization.id,
  };
};

const mapDispatchToProps = (dispatch, ownProps) => ({
  getLocation: () => dispatch(getLocation(ownProps.match.params.locationId)),
  goToViewLocation: () => ownProps.history.push(`/find/location/${ownProps.match.params.locationId}`),
});

export default function withErrorReportForm(WrappedComponent) {
  class ErrorReportContainer extends Component {
    componentDidMount() {
      if (!this.props.locationData) {
        this.props.getLocation(this.props.match.params.locationId);
      }
    }

    render() {
      const { locationData, locationError, goToViewLocation } = this.props;

      if (locationError) {
        return <ErrorLabel errorMessage={locationError} />;
      }

      if (!locationData) {
        return <LoadingView />;
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
            <WrappedComponent {...this.props} />
          </Modal>
        </div>
      );
    }
  }

  return withRouter(connect(mapStateToProps, mapDispatchToProps)(ErrorReportContainer));
}
