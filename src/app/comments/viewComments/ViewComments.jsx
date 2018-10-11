import React, { Component } from 'react';
import { connect } from 'react-redux';
import { getComments } from '../../../actions';
import { selectComments } from '../../../reducers';
import { getUserOrganizations, isUserAdmin } from '../../../services/auth';
import Header from '../../../components/header';
import Button from '../../../components/button';
import LoadingLabel from '../../../components/form/LoadingLabel';
import withCommentsForm from '../withCommentsForm';
import CommentRow from './CommentRow';

class ViewComments extends Component {
  constructor(props) {
    super(props);
    this.state = { userOrganizations: null, isAdmin: false };
    this.goToAddComment = this.goToAddComment.bind(this);
  }

  componentDidMount() {
    Promise.all([
      getUserOrganizations(),
      isUserAdmin(),
    ])
      .then(([organizations, isAdmin]) => {
        this.setState({
          userOrganizations: organizations,
          isAdmin,
        });
      });

    if (!this.props.comments) {
      this.props.getComments(this.props.match.params.locationId);
    }
  }

  goToAddComment() {
    this.props.history.push(`/comments/${this.props.match.params.locationId}/add`);
  }

  render() {
    const { comments, organizationName, organizationId } = this.props;
    const { userOrganizations, isAdmin } = this.state;

    const isStaffUser = userOrganizations && userOrganizations.indexOf(organizationId) !== -1;

    if (!comments) {
      return <LoadingLabel />;
    }

    // TODO: Probably extract the list and its items into a component (mabye use for languages?).
    // TODO: Don't actually use small and such, but rather style it all properly with CSS files.
    // TODO: Once using CSS, leverage the existing colors (namely "placeholderGray").
    // TODO: Try to find better way to put the button right under the list (no hard-coded padding).
    return (
      <div className="w-100">
        <div style={{ paddingBottom: '40px' }}>
          <div className="mx-5 text-left">
            <Header size="large" className="mb-3">
              Here’s what people are saying about {organizationName}
            </Header>
          </div>
          {!comments.length && (
            <p className="m-5 font-weight-bold">
              No comments have been posted about this location yet.
            </p>
          )}
          <ul className="list-group w-100">
            {comments.map(comment => (
              <CommentRow
                {...this.props}
                key={comment.id}
                comment={comment}
                isStaffUser={isStaffUser}
                isAdmin={isAdmin}
              />
            ))}
          </ul>
        </div>
        <div className="w-100 fixed-bottom">
          <Button onClick={this.goToAddComment} primary fluid>
            ADD YOUR COMMENT
          </Button>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state, ownProps) => ({
  comments: selectComments(state, ownProps.match.params.locationId),
});

const mapDispatchToProps = {
  getComments,
};

export default connect(mapStateToProps, mapDispatchToProps)(withCommentsForm(ViewComments));
