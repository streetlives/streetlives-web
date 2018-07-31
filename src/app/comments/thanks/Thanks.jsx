import React, { Component } from 'react';
import { connect } from 'react-redux';
import Button from '../../../components/button';
import Heart from '../../../components/heart';

const styles = {
  position: 'absolute',
  top: '0',
  left: '0',
  width: '100%',
  height: '100%',
  overflow: 'auto',
};

class Thanks extends Component {
  constructor(props) {
    super(props);
    this.goToAddAnotherComment = this.goToAddAnotherComment.bind(this);
    this.goToViewComments = this.goToViewComments.bind(this);
  }

  goToAddAnotherComment() {
    this.props.history.push(`/comments/${this.props.match.params.locationId}/add`);
  }

  goToViewComments() {
    this.props.history.push(`/comments/${this.props.match.params.locationId}/view`);
  }

  render() {
    const { name } = this.props;

    return (
      <div style={styles}>
        <div className="container p-5 d-flex flex-column justify-content-between h-100">
          <div className="content text-left">
            <p className="Header">Thank you so much!</p>
            <p>
              <Heart width="100" height="100" />
            </p>
            <p>
              Your comment will be help people in the community and the staff {name && `at ${name}`}
            </p>
          </div>
          <div className="actions">
            <div className="mt-4">
              <Button className="mt-4" primary fluid onClick={this.goToViewComments}>
                SEE PEOPLE’S COMMENTS
              </Button>
            </div>
            <div className="mt-2">
              <Button primary basic fluid onClick={this.goToAddAnotherComment}>
                ADD ANOTHER COMMENT
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state, ownProps) => {
  const locationData = state.locations[ownProps.match.params.locationId];
  return {
    name: locationData && locationData.Organization && locationData.Organization.name,
  };
};

export default connect(mapStateToProps)(Thanks);
