import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import { getLocation } from '../../../selectors/location';
import { getTaxonomy } from '../../../selectors/taxonomy';
import { getServices } from '../../../selectors/service';
import * as api from '../../../services/api';
import * as actions from '../../../actions';
import Header from '../../../components/header';
import Accordion from '../../../components/accordion';
import Selector from '../../../components/selector';
import Button from '../../../components/button';
import getCategoryIcon from '../util/getCategoryIcon';

import NavBar from '../../NavBar';

const LoadingView = ({ locationId }) => (
  <div className="d-flex flex-column">
    <NavBar backButtonTarget={`/location/${locationId}`} title="Services info" />
    <p>
      <i className="fa fa-spinner fa-spin" aria-hidden="true" /> Loading location data ...{' '}
    </p>
  </div>
);

class ServiceCategories extends Component {
  state = {
    expandedCategories: {},
    selected: {},
    isLoading: false,
  };

  componentWillMount() {
    if (!this.props.taxonomy) {
      this.props.getTaxonomy();
    }
    if (Object.keys(this.props.location).length === 0) {
      const { locationId } = this.props.match.params;
      this.props.getLocation(locationId);
    }
  }

  onToggleOpen = categoryId => this.setState(({ expandedCategories }) => ({
    expandedCategories: {
      ...expandedCategories,
      [categoryId]: !expandedCategories[categoryId],
    },
  }));

  onSelect = (subcategory) => {
    const { selected } = this.state;
    const currentSelection = selected[subcategory.id];
    this.setState({ selected: { ...selected, [subcategory.id]: !currentSelection } });
  };

  onGoToRecap = () => {
    const { locationId } = this.props.match.params;
    this.props.history.push(`/location/${locationId}/services/recap`);
  };

  onSubmit = () => {
    const { selected } = this.state;
    const { locationId } = this.props.match.params;
    this.setState({ isLoading: true });
    const locationTaxonomies = this.props.taxonomy
      .reduce((flat, key) => [...flat, ...(key.children || [])], [])
      .filter(taxonomy => selected[taxonomy.id]);

    api
      .createServices(locationId, locationTaxonomies)
      .then(() => this.onGoToRecap())
      .catch(error => console.log('error', error)); // eslint-disable-line no-console
  };

  isSubcategoryActive = (subcategory) => {
    const { id: subcategoryId, parent_id: categoryId } = subcategory;
    const categoryData = this.props.servicesByCategory[categoryId];

    if (categoryData.subcategories[subcategoryId].hasExistingService) {
      return true;
    }

    return this.state.selected[subcategoryId];
  };

  isCategoryActive = (category) => {
    const currentServices = this.props.servicesByCategory[category.id];
    const { subcategories, otherServices } = currentServices;

    if (otherServices.length) {
      return true;
    }

    const activeSubcategories =
      Object.keys(subcategories).filter(id => this.isSubcategoryActive(subcategories[id]));
    if (activeSubcategories.length) {
      return true;
    }

    return false;
  };

  renderSubcategory = subcategory => (
    <Selector.Option
      key={subcategory.id}
      onClick={() => this.onSelect(subcategory)}
      active={this.isSubcategoryActive(subcategory)}
      disabled={subcategory.hasExistingService}
    >
      {subcategory.name}
    </Selector.Option>
  );

  renderCategory = (category) => {
    const { expandedCategories } = this.state;
    const isExpanded = expandedCategories[category.id];

    return (
      <div key={category.id}>
        <Accordion.Item
          active={this.isCategoryActive(category)}
          expanded={isExpanded}
          onClick={() => this.onToggleOpen(category.id)}
          title={category.name}
          icon={getCategoryIcon(category.name)}
        />
        <Accordion.Content active={isExpanded}>
          <Selector fluid>
            {Object.keys(category.subcategories).map(id =>
              this.renderSubcategory(category.subcategories[id]))}
            <Selector.Option align="center">
              + Add another {category.name.toLowerCase()} service
            </Selector.Option>
          </Selector>
        </Accordion.Content>
      </div>
    );
  };

  render() {
    const { isLoading } = this.state;
    const { location, servicesByCategory } = this.props;

    if (!servicesByCategory || !location || isLoading) {
      return <LoadingView locationId={this.props.match.params.locationId} />;
    }

    return (
      <div className="text-left">
        <NavBar
          backButtonTarget={`/location/${this.props.match.params.locationId}`}
          title="Services info"
        />
        <div style={{ marginBottom: '1em' }} className="px-3 container">
          <Header>What programs and services are available at this location?</Header>
        </div>
        <Accordion>
          {Object.keys(servicesByCategory).map(id => this.renderCategory(servicesByCategory[id]))}
        </Accordion>
        <Button fluid primary onClick={this.onSubmit}>
          Next
        </Button>
      </div>
    );
  }
}

const getServicesByCategory = (state, props) => {
  const taxonomy = getTaxonomy(state) || [];
  const services = getServices(state, props) || [];

  let allCategoriesWithServices = {};
  services.forEach((service) => {
    service.Taxonomies.forEach((category) => {
      allCategoriesWithServices = { ...allCategoriesWithServices, [category.id]: true };
    });
  });

  const servicesByCategory = {};
  taxonomy.forEach((category) => {
    const subcategories = {};
    (category.children || []).forEach((subcategory) => {
      subcategories[subcategory.id] = {
        ...subcategory,
        hasExistingService: allCategoriesWithServices[subcategory.id],
      };
    });

    const otherServices =
      services.filter(service => service.Taxonomies.indexOf(category.id) !== -1);

    servicesByCategory[category.id] = { ...category, subcategories, otherServices };
  });

  return servicesByCategory;
};

const mapStateToProps = (state, ownProps) => ({
  location: getLocation(state, ownProps),
  taxonomy: getTaxonomy(state),
  servicesByCategory: getServicesByCategory(state, ownProps),
});

const mapDispatchToProps = (dispatch, ownProps) => ({
  getLocation: bindActionCreators(actions.getLocation, dispatch),
  getTaxonomy: bindActionCreators(actions.getTaxonomy, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(ServiceCategories);
