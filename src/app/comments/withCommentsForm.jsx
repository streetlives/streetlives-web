import React, { Component } from 'react';
import { connect } from 'react-redux';
import { getLocation } from '../../actions';
import { selectLocationData } from '../../reducers';
import IntroModal from './intro/IntroModal';
import Info from '../../components/info';
import LoadingLabel from '../../components/form/LoadingLabel';

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
  const locationData = selectLocationData(state, ownProps.match.params.locationId);

  if (!locationData) {
    return {};
  }

  return {
    locationData,
    organizationName: locationData.Organization.name,
    organizationId: locationData.Organization.id,
  };
};

const mapDispatchToProps = {
  getLocation,
};

export default function withCommentsForm(WrappedComponent, { hideInfoLink } = {}) {
  class CommentsContainer extends Component {
    constructor(props) {
      super(props);
      this.state = { isShowingInfo: false };

      this.onShowInfo = this.onShowInfo.bind(this);
      this.onHideInfo = this.onHideInfo.bind(this);
    }

    componentDidMount() {
      if (!this.props.locationData) {
        this.props.getLocation(this.props.match.params.locationId);
      }
    }

    onShowInfo() {
      this.setState({ isShowingInfo: true });
    }

    onHideInfo() {
      this.setState({ isShowingInfo: false });
    }

    render() {
      const { locationData } = this.props;

      if (!locationData) {
        return <LoadingView />;
      }

      return (
        <div style={fullScreenStyles}>
          {this.state.isShowingInfo && (
            <IntroModal name={this.props.organizationName} onDismiss={this.onHideInfo} />
          )}
          {!this.state.isShowingInfo && !hideInfoLink && (
            <div className="fixed-bottom" style={{ bottom: 45, right: 10, left: 'auto' }}>
              <Info onClick={this.onShowInfo} />
            </div>
          )}
          <WrappedComponent {...this.props} />
        </div>
      );
    }
  }

  return connect(mapStateToProps, mapDispatchToProps)(CommentsContainer);
}
