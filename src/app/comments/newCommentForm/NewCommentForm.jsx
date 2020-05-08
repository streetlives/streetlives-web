import React, { Component } from 'react';
import { connect } from 'react-redux';
import { postComment, getLocation } from '../../../actions';
import { selectIsPostingComment } from '../../../reducers';
import { selectLocationError, selectLocationData } from '../../../selectors/location';
import LoadingLabel from '../../../components/form/LoadingLabel';
import ErrorLabel from '../../../components/form/ErrorLabel';
import CommentText from './CommentText';
import ContactInfo from './ContactInfo';

class NewCommentForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      commentText: '',
      isErrorReportFinalScreen: false,
    };

    this.onCommentTextChanged = this.onCommentTextChanged.bind(this);
    this.onErrorReportFinalScreen = this.onErrorReportFinalScreen.bind(this);
    this.onCommentSubmitted = this.onCommentSubmitted.bind(this);
  }

  componentDidMount() {
    if (!this.props.locationData) {
      this.props.getLocation(this.props.match.params.locationId);
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.isPostingComment && !this.props.isPostingComment) {
      this.props.history.push(`/comments/${this.props.match.params.locationId}/thanks`);
    }
  }

  onCommentTextChanged(text) {
    this.setState({ commentText: text });
  }

  onErrorReportFinalScreen() {
    this.setState({ isErrorReportFinalScreen: true });
  }

  onCommentSubmitted(info) {
    this.props.postComment(
      this.state.commentText,
      info.name,
      info.contact,
    );
  }

  render() {
    const { locationData, isPostingComment, locationError } = this.props;

    if (locationError) {
      return <ErrorLabel errorMessage={locationError} />;
    }

    if (!locationData || isPostingComment) {
      return (
        <LoadingLabel>
          <span>Adding comment...</span>
        </LoadingLabel>
      );
    }

    if (!this.state.isErrorReportFinalScreen) {
      return (
        <CommentText
          match={this.props.match}
          value={this.state.commentText}
          onChange={this.onCommentTextChanged}
          onSubmit={this.onErrorReportFinalScreen}
        />
      );
    }

    return (
      <ContactInfo
        match={this.props.match}
        onSubmit={this.onCommentSubmitted}
      />
    );
  }
}

const mapStateToProps = (state, ownProps) => ({
  locationData: selectLocationData(state, ownProps),
  locationError: selectLocationError(state, ownProps),
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
