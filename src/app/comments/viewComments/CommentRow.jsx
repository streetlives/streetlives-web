import React, { Component } from 'react';
import moment from 'moment';
import LinkButton from '../../../components/link';
import Header from '../../../components/header';

const renderDate = date => (
  <small className="flex-grow-1 text-right pull-right" style={{ color: '#AAAAAA' }}>
    {moment(date).format('MMM D, YYYY h:mma')}
  </small>
);

class CommentRow extends Component {
  constructor(props) {
    super(props);
    this.goToReply = this.goToReply.bind(this);
  }

  goToReply() {
    const { id: commentId } = this.props.comment;
    const { locationId } = this.props.match.params;
    this.props.history.push(`/comments/${locationId}/${commentId}/reply`);
  }

  render() {
    const { comment, isStaffUser, organizationName } = this.props;
    const {
      content,
      created_at: createdAt,
      Replies: replies,
    } = comment;
    const reply = replies[0];

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
            {renderDate(reply.created_at)}
          </div>
        )}
      </li>
    );
  }
}

export default CommentRow;
