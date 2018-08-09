import React, { Component } from 'react';
import { connect } from 'react-redux';
import { getLocation } from '../../../actions';
import { selectLocationData } from '../../../reducers';
import IntroComponent from './IntroComponent';
import LoadingLabel from '../../../components/form/LoadingLabel';

// TODO: Try to find a better way to achieve this.
const fullScreenStyles = {
  position: 'absolute',
  top: '0',
  left: '0',
  width: '100%',
  height: '100%',
  overflow: 'auto',
};

class IntroPage extends Component {
  constructor(props) {
    super(props);
    this.goToViewComments = this.goToViewComments.bind(this);
  }

  componentDidMount() {
    if (!this.props.locationData) {
      this.props.getLocation(this.props.match.params.locationId);
    }
  }

  goToViewComments() {
    this.props.history.push(`/comments/${this.props.match.params.locationId}/view`);
  }

  render() {
    const { locationData } = this.props;

    if (!locationData) {
      return <LoadingLabel />;
    }

    return (
      <div className="d-flex flex-column" style={fullScreenStyles}>
        <IntroComponent
          name={locationData.Organization.name}
          className="flex-grow-1"
          footer={(
            <small>
              Comments are anonymous. By using this site you agree to our
              <a
                className="ml-1"
                href="https://policies.google.com/technologies/partner-sites"
                target="_blank"
                rel="noopener noreferrer"
              >
                guidelines
              </a>
            </small>
          )}
          buttonText="LET’S GET STARTED"
          onClick={this.goToViewComments}
        />
      </div>
    );
  }
}

const mapStateToProps = (state, ownProps) => ({
  locationData: selectLocationData(state, ownProps.match.params.locationId),
});

const mapDispatchToProps = {
  getLocation,
};

export default connect(mapStateToProps, mapDispatchToProps)(IntroPage);
