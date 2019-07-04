import React, { Component } from 'react';
import { withRouter } from 'react-router';
import MapPage from './MapPage';

class MapPageContainer extends Component {
  goHome = () => this.props.history.push('/find');

  goToCategoryResults = category =>
    this.props.history.push(`/find/${category.name}${this.props.history.location.search}`);

  goToCategory = category =>
    this.props.history.push(`/find/${category.name}/questions`);

  render() {
    return (
      <MapPage
        categoryName={this.props.match.params.categoryName}
        getCurrentCategoryName={this.getCurrentCategoryName}
        goHome={this.goHome}
        goToCategory={this.goToCategory}
        startQuestionFlow={this.startQuestionFlow}
      />
    );
  }
}

export default withRouter(MapPageContainer);
