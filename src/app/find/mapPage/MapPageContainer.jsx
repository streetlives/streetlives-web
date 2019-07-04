/* eslint-disable no-console */
import React, { Component } from 'react';
import { withRouter } from 'react-router';
import { getTaxonomy } from '../../../services/api';
import MapPage from './MapPage';
import { selectableCategoryNames } from './categories';

class MapPageContainer extends Component {
  state = {
    categories: null,
  };

  goHome = () => this.props.history.push('/find');

  goToCategoryResults = category =>
    this.props.history.push(`/find/${category.name}${this.props.history.location.search}`);

  goToCategory = category =>
    this.props.history.push(`/find/${category.name}/questions`);

  fetchCategories = () => {
    // TODO: Use an action and put categories in Redux state.
    getTaxonomy()
      .then((taxonomy) => {
        const categories = taxonomy
          .map(category => ({
            ...category,
            index: selectableCategoryNames.indexOf(category.name.trim().toLowerCase()),
          }))
          .filter(({ index }) => index !== -1)
          .sort((category1, category2) => category1.index - category2.index);

        this.setState({ categories });
      })
      .catch(e => console.error('Error fetching taxonomy', e));
  };

  render() {
    const { categoryName } = this.props.match.params;
    const { categories } = this.state;

    const category = categories && categories.find(c => c.name === categoryName);

    return (
      <MapPage
        category={category}
        categories={categories}
        fetchCategories={this.fetchCategories}
        goHome={this.goHome}
        goToCategory={this.goToCategory}
        startQuestionFlow={this.startQuestionFlow}
      />
    );
  }
}

export default withRouter(MapPageContainer);
