import React, { Component } from 'react';
import { connect } from 'react-redux';
import { getLocation } from '../../actions';
import Header from '../../components/header';
import Button from '../../components/button';
import LoadingLabel from '../../components/form/LoadingLabel';

class MainView extends Component {
  constructor(props) {
    super(props);
    this.goToNewCommentForm = this.goToNewCommentForm.bind(this);
    this.goToViewComments = this.goToViewComments.bind(this);
  }

  componentWillMount() {
    if (!this.props.locationData) {
      this.props.getLocation(this.props.match.params.locationId);
    }
  }

  goToNewCommentForm() {
    this.props.history.push(`/comments/${this.props.match.params.locationId}/add`);
  }

  goToViewComments() {
    this.props.history.push(`/comments/${this.props.match.params.locationId}/view`);
  }

  render() {
    const { locationData } = this.props;

    if (!locationData) {
      return <LoadingLabel />;
    }

    const { address } = locationData;
    const addressString = `${address.street}, ${address.city}, ${address.postalCode}`;

    // TODO: Add info button (to all the comment screens).
    return (
      <div className="mx-5 text-left">
        <Header size="large">{locationData.Organization.name}</Header>
        <Header size="small" className="mt-3 mb-5">{addressString}</Header>
        <Button onClick={this.goToViewComments} primary basic fluid className="mt-2">
          SEE PEOPLE’S COMMENTS
        </Button>
        <Button onClick={this.goToNewCommentForm} primary fluid className="mt-2">
          LEAVE A COMMENT
        </Button>
      </div>
    );
  }
}

const mapDispatchToProps = { getLocation };

const mapStateToProps = (state, ownProps) => ({
  locationData: state.locations[ownProps.match.params.locationId],
});

export default connect(mapStateToProps, mapDispatchToProps)(MainView);
