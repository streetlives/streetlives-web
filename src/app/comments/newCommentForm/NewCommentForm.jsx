import React, { Component } from 'react';
import { connect } from 'react-redux';
import { postComment, getLocation } from '../../../actions';
import { selectLocationData } from '../../../reducers';
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

  componentWillMount() {
    if (!this.props.locationData) {
      this.props.getLocation(this.props.match.params.locationId);
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
    this.props.history.push(`/comments/${this.props.match.params.locationId}/thanks`);
  }

  render() {
    const { locationData } = this.props;

    if (!locationData) {
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
});

const mapDispatchToProps = (dispatch, ownProps) => ({
  getLocation: locationId => dispatch(getLocation(locationId)),
  postComment: (content, name, contactInfo) => dispatch(postComment(
    ownProps.match.params.locationId,
    { content, name, contactInfo },
  )),
});

export default connect(mapStateToProps, mapDispatchToProps)(NewCommentForm);
