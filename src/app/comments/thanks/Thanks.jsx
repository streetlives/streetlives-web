import React, { Component } from 'react';
import Button from '../../../components/button';
import Heart from '../../../components/heart';
import withCommentsForm from '../withCommentsForm';

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
    const { organizationName } = this.props;

    return (
      <div className="container pb-5 pt-2 px-4 d-flex flex-column justify-content-between h-100">
        <div className="content text-left">
          <p className="Header">Thank you so much!</p>
          <p>
            <Heart width="100" height="100" />
          </p>
          <p>
            Your comment has helped {organizationName} and the whole commmunity
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
    );
  }
}

export default withCommentsForm(Thanks, { hideInfoLink: true });
