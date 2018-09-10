import React, { Component } from 'react';
import { connect } from 'react-redux';
import moment from 'moment';
import { getComments, replyToComment } from '../../../actions';
import { selectComments, selectIsPostingComment } from '../../../reducers';
import LoadingLabel from '../../../components/form/LoadingLabel';
import Button from '../../../components/button';
import TextArea from '../../../components/textarea';

class ReplyCommentForm extends Component {
  constructor(props) {
    super(props);
    this.state = { commentText: '' };

    this.onTextChanged = this.onTextChanged.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
  }

  componentDidMount() {
    if (!this.props.comments) {
      this.props.getComments(this.props.match.params.locationId);
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.isPostingComment && !this.props.isPostingComment) {
      this.props.history.push(`/comments/${this.props.match.params.locationId}/view`);
    }
  }

  onTextChanged(event) {
    this.setState({ commentText: event.target.value });
  }

  onSubmit(info) {
    this.props.submitReply(this.state.commentText);
  }

  render() {
    const { comments, isPostingComment, match } = this.props;
    const { commentId } = match.params;

    if (isPostingComment) {
      return <LoadingLabel><span>Posting reply</span></LoadingLabel>;
    }
    if (!comments) {
      return <LoadingLabel><span>Loading comment data</span></LoadingLabel>;
    }

    const originalComment = comments.filter(comment => comment.id === commentId)[0];
    if (!originalComment) {
      return <div>Comment not found.</div>;
    }

    return (
      <div>
        <div className="px-4 pb-5">
          <div className="pt-4 pb-5">
            <div className="text-left">
              {originalComment.content}
            </div>
            <small className="pull-right" style={{ color: '#AAAAAA' }}>
              {moment(originalComment.created_at).format('MMM D, YYYY h:mma')}
            </small>
          </div>
          <TextArea
            placeholder="How would you like to reply to this comment?"
            value={this.state.commentText}
            minRows={12}
            onChange={this.onTextChanged}
            fluid
          />
        </div>
        <div className="mx-5">
          <Button
            onClick={this.onSubmit}
            disabled={!this.state.commentText}
            primary
            fluid
            className="fixed-bottom mt-3"
          >
            POST
          </Button>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state, ownProps) => ({
  comments: selectComments(state, ownProps.match.params.locationId),
  isPostingComment: selectIsPostingComment(state),
});

const mapDispatchToProps = (dispatch, ownProps) => ({
  getComments: locationId => dispatch(getComments(locationId)),
  submitReply: content => dispatch(replyToComment(
    ownProps.match.params.locationId,
    ownProps.match.params.commentId,
    { content },
  )),
});

export default connect(mapStateToProps, mapDispatchToProps)(ReplyCommentForm);
