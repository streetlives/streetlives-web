/* eslint-disable no-console */
import React, { Component } from 'react';
import { withRouter } from 'react-router';
import qs from 'qs';
import { getTaxonomy } from '../../../services/api';
import MapPage from './MapPage';
import { selectableCategoryNames } from '../categories';
import analytics from '../../../services/analytics';
import config from '../../../config';

class MapPageContainer extends Component {
  static getDerivedStateFromProps(nextProps, prevState) {
    const { search } = nextProps.location;
    const { prevSearch } = prevState;
    if (search !== prevSearch) {
      return {
        eligibilityParams: qs.parse(search, { ignoreQueryPrefix: true }),
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

  getCategoryUrl = category => `/find/${category.name}/questions`;

  getLocationUrl = (locationId) => {
    const { categoryName } = this.props.match.params;
    return categoryName ?
      `/find/${categoryName}/location/${locationId}` :
      `/find/location/${locationId}`;
  }

  goHome = () => this.props.history.push('/find');

  goToCategoryResults = category =>
    this.props.history.push(`/find/${category.name}${this.props.location.search}`);

  goToCategory = category =>
    this.props.history.push(`/find/${category.name}/questions`);

  goToLocationDetails = (locationId) => {
    const url = this.getLocationUrl(locationId);

    const { categoryName } = this.props.match.params;
    analytics.track('Location Clicked', { locationId, url, categoryName });

    this.props.history.push(url);
  }

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

  leaveFeedback = () => {
    window.location.href = `mailto:${config.feedbackEmail}`;
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
        getCategoryUrl={this.getCategoryUrl}
        startQuestionFlow={this.startQuestionFlow}
        goToLocationDetails={this.goToLocationDetails}
        getLocationUrl={this.getLocationUrl}
        leaveFeedback={this.leaveFeedback}
        tosUrl={config.termsOfUseUrl}
        privacyPolicyUrl={config.privacyUrl}
        homeUrl="/"
      />
    );
  }
}

export default withRouter(MapPageContainer);
