import React, { Component } from 'react';
import moment from 'moment';
import { connect } from 'react-redux';
import { deleteReply } from '../../../actions';
import LinkButton from '../../../components/link';
import Header from '../../../components/header';
import DeleteReplyModal from './DeleteReplyModal';

const renderDate = date => (
  <small className="flex-grow-1 text-right pull-right" style={{ color: '#AAAAAA' }}>
    {moment(date).format('MMM D, YYYY h:mma')}
  </small>
);

class CommentRow extends Component {
  constructor(props) {
    super(props);
    this.state = { isShowingDeleteConfirmation: false };

    this.goToReply = this.goToReply.bind(this);
    this.showDeleteReply = this.showDeleteReply.bind(this);
    this.cancelDeleteReply = this.cancelDeleteReply.bind(this);
    this.confirmDeleteReply = this.confirmDeleteReply.bind(this);
  }

  goToReply() {
    const { id: commentId } = this.props.comment;
    const { locationId } = this.props.match.params;
    this.props.history.push(`/comments/${locationId}/${commentId}/reply`);
  }

  showDeleteReply() {
    this.setState({ isShowingDeleteConfirmation: true });
  }

  cancelDeleteReply() {
    this.setState({ isShowingDeleteConfirmation: false });
  }

  confirmDeleteReply() {
    const { comment, match } = this.props;
    const { locationId } = match.params;
    const reply = comment.Replies[0];

    this.setState({ isShowingDeleteConfirmation: false }, () => {
      this.props.deleteReply({
        locationId,
        originalCommentId: comment.id,
        reply,
      });
    });
  }

  render() {
    const { comment, isStaffUser, organizationName } = this.props;
    const {
      content,
      created_at: createdAt,
      Replies: replies,
    } = comment;
    const reply = replies[0];

    if (this.state.isShowingDeleteConfirmation) {
      return (
        <DeleteReplyModal
          onConfirm={this.confirmDeleteReply}
          onCancel={this.cancelDeleteReply}
        />
      );
    }

    return (
      <li
        className="list-group-item px-5 w-100"
        style={{
          position: 'auto',
          borderColor: '#EDEDED',
          backgroundColor: '#FCFCFC',
        }}
      >
        <div className="text-left mb-1">
          {content}
        </div>
        <div className="d-flex">
          {isStaffUser && !reply &&
            <LinkButton className="p-0" onClick={this.goToReply}>
              Reply
            </LinkButton>
          }
          {renderDate(createdAt)}
        </div>
        {reply && (
          <div className="text-left">
            <Header size="medium">{organizationName} replied:</Header>
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
};

export default connect(null, mapDispatchToProps)(CommentRow);
