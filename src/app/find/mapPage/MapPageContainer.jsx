/* eslint-disable no-console */
import React, { Component } from 'react';
import { withRouter } from 'react-router';
import { getTaxonomy } from '../../../services/api';
import MapPage from './MapPage';
import { selectableCategoryNames } from '../categories';

const parseQueryString = (search) => {
  if (!search) {
    return {};
  }
  return search
    .slice(1)
    .split('&')
    .reduce((params, paramString) => {
      const [param, value] = paramString.split('=');
      return {
        ...params,
        [param]: decodeURIComponent(value),
      };
    }, {});
};

class MapPageContainer extends Component {
  static getDerivedStateFromProps(nextProps, prevState) {
    const { search } = nextProps.location;
    const { prevSearch } = prevState;
    if (search !== prevSearch) {
      return {
        eligibilityParams: parseQueryString(search),
        prevSearch: search,
      };
    }

    return null;
  }

  state = {
    categories: null,
    eligibilityParams: {},
    prevSearch: null,
  };

  goHome = () => this.props.history.push('/find');

  goToCategoryResults = category =>
    this.props.history.push(`/find/${category.name}${this.props.location.search}`);

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
    const { categories, eligibilityParams } = this.state;
    const category = categories && categories.find(c => c.name === categoryName);

    return (
      <MapPage
        category={category}
        categories={categories}
        eligibilityParams={eligibilityParams}
        fetchCategories={this.fetchCategories}
        goHome={this.goHome}
        goToCategory={this.goToCategory}
        startQuestionFlow={this.startQuestionFlow}
      />
    );
  }
}

export default withRouter(MapPageContainer);
