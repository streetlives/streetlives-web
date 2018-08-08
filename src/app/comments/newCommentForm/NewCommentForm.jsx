import React, { Component } from 'react';
import { connect } from 'react-redux';
import { postComment, getLocation } from '../../../actions';
import { selectLocationData, selectIsPostingComment } from '../../../reducers';
import LoadingLabel from '../../../components/form/LoadingLabel';
import CommentText from './CommentText';
import ContactInfo from './ContactInfo';

// TODO: Figure out whether/how to handle going back to edit the comment...

class NewCommentForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      commentText: '',
      isCommentFinished: false,
    };

    this.onCommentTextChanged = this.onCommentTextChanged.bind(this);
    this.onCommentFinished = this.onCommentFinished.bind(this);
    this.onCommentSubmitted = this.onCommentSubmitted.bind(this);
  }

  componentDidMount() {
    if (!this.props.locationData) {
      this.props.getLocation(this.props.match.params.locationId);
    }
  }

  componentDidUpdate(prevProps) {
    // TODO: Probably revert this after fixing the navigation-wipes-everything issue.
    if (prevProps.isPostingComment && !this.props.isPostingComment) {
      this.props.history.push(`/comments/${this.props.match.params.locationId}/thanks`);
    }
  }

  onCommentTextChanged(event) {
    this.setState({ commentText: event.target.value });
  }

  onCommentFinished() {
    this.setState({ isCommentFinished: true });
  }

  onCommentSubmitted(info) {
    this.props.postComment(
      this.state.commentText,
      info.name,
      info.contact,
    );
  }

  render() {
    const { locationData, isPostingComment } = this.props;

    if (!locationData || isPostingComment) {
      return <LoadingLabel />;
    }

    if (!this.state.isCommentFinished) {
      return (
        <CommentText
          name={locationData.Organization.name}
          value={this.state.commentText}
          onChange={this.onCommentTextChanged}
          onSubmit={this.onCommentFinished}
        />
      );
    }

    return (
      <ContactInfo
        name={locationData.Organization.name}
        onSubmit={this.onCommentSubmitted}
      />
    );
  }
}

const mapStateToProps = (state, ownProps) => ({
  locationData: selectLocationData(state, ownProps.match.params.locationId),
  isPostingComment: selectIsPostingComment(state),
});

const mapDispatchToProps = (dispatch, ownProps) => ({
  getLocation: locationId => dispatch(getLocation(locationId)),
  postComment: (content, name, contactInfo) => dispatch(postComment(
    ownProps.match.params.locationId,
    { content, name, contactInfo },
  )),
});

export default connect(mapStateToProps, mapDispatchToProps)(NewCommentForm);
