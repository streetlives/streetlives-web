import React, { Component } from 'react';
import { connect } from 'react-redux';
import moment from 'moment';
import { getComments } from '../../../actions';
import { selectComments } from '../../../reducers';
import Header from '../../../components/header';
import Button from '../../../components/button';
import LoadingLabel from '../../../components/form/LoadingLabel';
import withCommentsForm from '../withCommentsForm';

class ViewComments extends Component {
  constructor(props) {
    super(props);
    this.goToAddComment = this.goToAddComment.bind(this);
  }

  componentDidMount() {
    if (!this.props.comments) {
      this.props.getComments(this.props.match.params.locationId);
    }
  }

  goToAddComment() {
    this.props.history.push(`/comments/${this.props.match.params.locationId}/add`);
  }

  render() {
    const { comments, organizationName } = this.props;

    if (!comments) {
      return <LoadingLabel />;
    }

    // TODO: Probably extract the list and its items into a component (mabye use for languages?).
    // TODO: Don't actually use small and such, but rather style it all properly with CSS files.
    // TODO: Once using CSS, leverage the existing colors (namely "placeholderGray").
    // TODO: Try to find better way to put the button right under the list (no hard-coded padding).
    return (
      <div>
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
              <li
                key={comment.id}
                className="list-group-item px-5 w-100"
                style={{
                  position: 'auto',
                  borderColor: '#EDEDED',
                  backgroundColor: '#FCFCFC',
                }}
              >
                <div className="text-left">
                  {comment.content}
                </div>
                <small className="pull-right" style={{ color: '#C2C2C2' }}>
                  {moment(comment.created_at).format('MMM D, YYYY h:mma')}
                </small>
              </li>
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
