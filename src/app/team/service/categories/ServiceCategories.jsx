import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import ErrorLabel from '../../../../components/form/ErrorLabel';
import { selectLocationData, selectLocationError } from '../../../../selectors/location';
import { getTaxonomy } from '../../../../selectors/taxonomy';
import { getServices } from '../../../../selectors/service';
import * as api from '../../../../services/api';
import * as actions from '../../../../actions';
import Header from '../../../../components/header';
import Accordion from '../../../../components/accordion';
import Button from '../../../../components/button';
import NavBar from '../../../../components/navBar';
import LoadingLabel from '../../../../components/form/LoadingLabel';
import ServiceCategory from './ServiceCategory';

const LoadingView = ({ locationId }) => (
  <div className="d-flex flex-column">
    <NavBar backButtonTarget={`/team/location/${locationId}`} title="Services info" />
    <p>
      <LoadingLabel />
    </p>
  </div>
);

class ServiceCategories extends Component {
  state = {
    selected: {},
    newOtherServices: {},
    isLoading: false,
  };

  componentDidMount() {
    if (!this.props.taxonomy) {
      this.props.getTaxonomy();
    }
    if (!this.props.locationData) {
      const { locationId } = this.props.match.params;
      this.props.getLocation(locationId);
    }
  }

  onSelectSubcategory = (subcategory) => {
    const { selected } = this.state;
    const currentSelection = selected[subcategory.id];
    this.setState({ selected: { ...selected, [subcategory.id]: !currentSelection } });
  };

  onAddOtherService = (name, categoryId) => this.setState(({ newOtherServices }) => ({
    newOtherServices: {
      ...newOtherServices,
      [categoryId]: {
        ...newOtherServices[categoryId],
        [name]: {
          name,
          categoryId,
          isSelected: true,
        },
      },
    },
  }));

  onSelectOtherService = (otherService) => {
    const { newOtherServices } = this.state;
    const { categoryId, name } = otherService;
    const currentSelection = newOtherServices[categoryId][name].isSelected;

    this.setState({
      newOtherServices: {
        ...newOtherServices,
        [otherService.categoryId]: {
          ...newOtherServices[categoryId],
          [name]: {
            ...otherService,
            isSelected: !currentSelection,
          },
        },
      },
    });
  };

  onGoToRecap = () => this.props.history.push(`${this.props.location.pathname}/recap`);

  onSubmit = () => {
    const { selected, newOtherServices } = this.state;
    const { locationId } = this.props.match.params;

    this.setState({ isLoading: true });

    const selectedSubcategories = this.props.taxonomy
      .reduce((flatSubcategories, category) => [
        ...flatSubcategories,
        ...(category.children || []),
      ], [])
      .filter(subcategory => selected[subcategory.id])
      .map(subcategory => ({ taxonomyId: subcategory.id, name: subcategory.name }));

    const selectedOtherServices = [];
    Object.keys(newOtherServices).forEach((categoryId) => {
      const categoryNewServices = newOtherServices[categoryId];

      Object.keys(categoryNewServices).forEach((serviceName) => {
        const newService = categoryNewServices[serviceName];

        if (newService.isSelected) {
          selectedOtherServices.push({ taxonomyId: categoryId, name: serviceName });
        }
      });
    });

    const allNewlySelectedServices = selectedSubcategories.concat(selectedOtherServices);

    api
      .createServices(locationId, allNewlySelectedServices)
      .then(() => this.onGoToRecap())
      .catch(error => console.log('error', error)); // eslint-disable-line no-console
  };

  render() {
    const { isLoading, selected } = this.state;
    const { locationData, servicesByCategory, locationError } = this.props;

    if (locationError) {
      return <ErrorLabel errorMessage={locationError} />;
    }

    if (!servicesByCategory || !locationData || isLoading) {
      return <LoadingView locationId={this.props.match.params.locationId} />;
    }

    return (
      <div className="text-left">
        <NavBar
          backButtonTarget={`/team/location/${this.props.match.params.locationId}`}
          title="Services info"
        />
        <div style={{ marginBottom: '1em' }} className="px-3 container">
          <Header>What programs and services are available at this location?</Header>
        </div>
        <Accordion>
          {Object.keys(servicesByCategory).map(categoryId => (
            <ServiceCategory
              key={categoryId}
              category={servicesByCategory[categoryId]}
              currentServices={servicesByCategory[categoryId] || []}
              newOtherServices={this.state.newOtherServices[categoryId] || []}
              selected={selected}
              onSelectSubcategory={this.onSelectSubcategory}
              onSelectOtherService={this.onSelectOtherService}
              onAddOtherService={this.onAddOtherService}
            />
          ))}
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

    const isServiceInCategory = serviceTaxonomy => serviceTaxonomy.id === category.id;
    const otherServicesInCategory =
      services.filter(service => service.Taxonomies.filter(isServiceInCategory).length > 0);

    servicesByCategory[category.id] = {
      ...category,
      subcategories,
      otherServices: otherServicesInCategory,
    };
  });

  return servicesByCategory;
};

const mapStateToProps = (state, ownProps) => ({
  locationData: selectLocationData(state, ownProps),
  locationError: selectLocationError(state, ownProps),
  taxonomy: getTaxonomy(state),
  servicesByCategory: getServicesByCategory(state, ownProps),
});

const mapDispatchToProps = (dispatch, ownProps) => ({
  getLocation: bindActionCreators(actions.getLocation, dispatch),
  getTaxonomy: bindActionCreators(actions.getTaxonomy, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(ServiceCategories);
