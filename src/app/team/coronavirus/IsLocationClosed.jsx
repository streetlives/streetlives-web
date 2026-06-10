import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { selectLocationData, selectLocationError } from '../../../selectors/location';
import * as actions from '../../../actions';
import Button from '../../../components/button';
import NavBar from '../../../components/navBar';
import ErrorLabel from '../../../components/form/ErrorLabel';
import LoadingLabel from '../../../components/form/LoadingLabel';
import { OCCASIONS } from '../../../Constants';

class IsLocationClosed extends Component {
  componentDidMount() {
    if (!this.props.locationData) {
      const { locationId } = this.props.match.params;
      this.props.getLocation(locationId);
    }
  }

  getLocationUrl = () => {
    const { pathname } = this.props.location;
    return pathname.slice(0, pathname.indexOf('/isClosed'));
  };

  getBackButtonTarget = () => {
    const { pathname } = this.props.location;
    return pathname.slice(0, pathname.indexOf('/location'));
  };

  selectOpen = () => {
    this.props.markOpen(this.props.locationData);
    this.props.history.push(this.props.nextUrl || this.getLocationUrl());
  };

  selectClosed = () => {
    // We no longer need to mark this location as closed instantly, but we want to show the closure info page where the user can add more details about the closure
    this.props.history.push(`${this.getLocationUrl()}/closureInfo`);
  };

  render() {
    const {
      locationData,
      locationError,
    } = this.props;

    if (locationError) {
      return <ErrorLabel errorMessage={locationError} />;
    }

    if (!locationData) {
      return <LoadingLabel />;
    }

    // eslint-disable-next-line no-nested-ternary
    const closedStatus = locationData.closed === true
      ? 'closed'
      : locationData.closed === false
        ? 'open'
        : 'unknown';

    const statusLabel = { closed: 'CURRENTLY CLOSED', open: 'CURRENTLY OPEN', unknown: 'STATUS UNKNOWN' }[closedStatus];
    const statusStyle = {
      closed: { backgroundColor: '#e0e0e0', color: '#555' },
      open: { backgroundColor: '#d4edda', color: '#155724' },
      unknown: { backgroundColor: '#fff3cd', color: '#856404' },
    }[closedStatus];

    return (
      <div className="text-left">
        <NavBar
          backButtonTarget={this.getBackButtonTarget()}
          title="Location info"
        />
        <div className="row p-4 mb-1">
          <div
            style={{
              display: 'inline-block',
              padding: '4px 12px',
              borderRadius: '12px',
              fontSize: '0.8rem',
              fontWeight: 'bold',
              ...statusStyle,
            }}
          >
            {statusLabel}
          </div>
        </div>
        <div className="row p-4 mb-3">
          Is this location still open?
        </div>
        <div
          style={{
            left: 0,
            right: 0,
            bottom: 12,
            position: 'fixed',
          }}
        >
          <div className="p-4">
            <Button onClick={this.selectOpen} primary fluid className="mt-2">
              YES, IT’S OPEN
            </Button>
            <Button onClick={this.selectClosed} primary basic fluid className="mt-2">
              {closedStatus === 'closed' ? 'UPDATE CLOSURE INFO' : "NO, IT'S CLOSED"}
            </Button>
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state, ownProps) => ({
  locationData: selectLocationData(state, ownProps),
  locationError: selectLocationError(state, ownProps),
});

const mapDispatchToProps = (dispatch, ownProps) => ({
  getLocation: bindActionCreators(actions.getLocation, dispatch),
  markOpen: (location) => {
    dispatch(actions.updateLocation(
      location.id,
      { eventRelatedInfo: { information: null, event: OCCASIONS.CLOSURE }, closed: false },
      'location',
      'eventRelatedInfo',
    ));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(IsLocationClosed));
