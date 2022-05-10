import React, { Component } from 'react';
import moment from 'moment';
import { connect } from 'react-redux';
import { deleteReply, removeComment } from '../../../actions';
import LinkButton from '../../../components/link';
import ConfirmationModal from '../../../components/confirmationModal';

const renderDate = date => (
  <small className="flex-grow-1 text-right pull-right" style={{ color: '#AAAAAA' }}>
    {moment(date).format('MMM D, YYYY h:mma')}
  </small>
);

class CommentRow extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isShowingReplyDeleteConfirmation: false,
      isShowingCommentRemoveConfirmation: false,
    };

    this.goToReply = this.goToReply.bind(this);
    this.showRemoveComment = this.showRemoveComment.bind(this);
    this.cancelRemoveComment = this.cancelRemoveComment.bind(this);
    this.confirmRemoveComment = this.confirmRemoveComment.bind(this);
    this.showDeleteReply = this.showDeleteReply.bind(this);
    this.cancelDeleteReply = this.cancelDeleteReply.bind(this);
    this.confirmDeleteReply = this.confirmDeleteReply.bind(this);
  }

  goToReply() {
    const { id: commentId } = this.props.comment;
    const { locationId } = this.props.match.params;
    this.props.history.push(`/comments/${locationId}/${commentId}/reply`);
  }

  showRemoveComment() {
    this.setState({ isShowingCommentRemoveConfirmation: true });
  }

  cancelRemoveComment() {
    this.setState({ isShowingCommentRemoveConfirmation: false });
  }

  confirmRemoveComment() {
    const { comment, match } = this.props;
    const { locationId } = match.params;

    this.setState({ isShowingCommentRemoveConfirmation: false }, () => {
      this.props.removeComment({ locationId, comment });
    });
  }

  showDeleteReply() {
    this.setState({ isShowingReplyDeleteConfirmation: true });
  }

  cancelDeleteReply() {
    this.setState({ isShowingReplyDeleteConfirmation: false });
  }

  confirmDeleteReply() {
    const { comment, match } = this.props;
    const { locationId } = match.params;
    const reply = comment.Replies[0];

    this.setState({ isShowingReplyDeleteConfirmation: false }, () => {
      this.props.deleteReply({
        locationId,
        originalCommentId: comment.id,
        reply,
      });
    });
  }

  render() {
    const {
      comment,
      isStaffUser,
      isAdmin,
      organizationName,
    } = this.props;
    const {
      content,
      created_at: createdAt,
      Replies: replies,
    } = comment;
    const reply = replies && replies[0];

    if (this.state.isShowingCommentRemoveConfirmation) {
      return (
        <ConfirmationModal
          headerText="Are you sure you want to remove this comment?"
          confirmText="YES"
          cancelText="NO, LET’S KEEP IT"
          onConfirm={this.confirmRemoveComment}
          onCancel={this.cancelRemoveComment}
        />
      );
    }

    if (this.state.isShowingReplyDeleteConfirmation) {
      return (
        <ConfirmationModal
          headerText="Are you sure you want to delete this reply?"
          confirmText="YES"
          cancelText="NO, LET’S KEEP IT"
          onConfirm={this.confirmDeleteReply}
          onCancel={this.cancelDeleteReply}
        />
      );
    }

    return (
      <li
        className="list-group-item w-100"
        style={{
          position: 'auto',
          borderColor: '#EDEDED',
          backgroundColor: '#FCFCFC',
          paddingLeft: '35px',
          paddingRight: '35px',
        }}
      >
        <div className="text-left mb-1" style={{ whiteSpace: 'pre-line' }}>
          {content}
        </div>
        <div className="d-flex">
          {isAdmin &&
            <LinkButton className="p-0" onClick={this.showRemoveComment}>
              Remove
            </LinkButton>
          }
          {isStaffUser && !reply &&
            <LinkButton className="p-0" onClick={this.goToReply}>
              Reply
            </LinkButton>
          }
          {renderDate(createdAt)}
        </div>
        {reply && (
          <div className="text-left mt-2 p-3 clearfix border">
            <div className="font-weight-bold mb-2">{organizationName} replied:</div>
            <div className="text-left mb-1">
              {reply.content}
            </div>
            {isStaffUser &&
              <LinkButton className="p-0" onClick={this.showDeleteReply}>
                Delete
              </LinkButton>
            }
            {renderDate(reply.created_at)}
          </div>
        )}
      </li>
    );
  }
}

const mapDispatchToProps = {
  deleteReply,
  removeComment,
};

export default connect(null, mapDispatchToProps)(CommentRow);
