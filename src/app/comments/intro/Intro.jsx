import React, { Component } from 'react';
import { connect } from 'react-redux';
import { getLocation } from '../../../actions';
import { selectLocationData } from '../../../reducers';
import Header from '../../../components/header';
import Button from '../../../components/button';
import LoadingLabel from '../../../components/form/LoadingLabel';

// TODO: Try to find a better way to achieve this.
const styles = {
  position: 'absolute',
  top: '0',
  left: '0',
  width: '100%',
  height: '100%',
  overflow: 'auto',
};

class Intro extends Component {
  constructor(props) {
    super(props);
    this.goToViewComments = this.goToViewComments.bind(this);
  }

  componentWillMount() {
    // TODO: Figure out why it seems to be loading the data every time I navigate.
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
      <div className="d-flex flex-column" style={styles}>
        <div className="m-4 text-left font-weight-bold flex-grow-1">
          <Header size="large">
            WELCOME TO THE COMMENT PAGE FOR {locationData.Organization.name.toUpperCase()}!
          </Header>
          <Header size="large">
            By commenting here you are helping improve our services, and benefitting the community.
          </Header>
          <Header size="large">
            This site is for us to hear and learn from you.
          </Header>
        </div>
        <small className="m-4">
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
        <div className="w-100">
          <Button onClick={this.goToViewComments} primary fluid className="mt-3">
            LET’S GET STARTED
          </Button>
        </div>
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

export default connect(mapStateToProps, mapDispatchToProps)(Intro);
