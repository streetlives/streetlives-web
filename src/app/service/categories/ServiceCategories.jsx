import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import { getLocation } from '../../../selectors/location';
import { getCurrentCategories, getTaxonomyForLocation } from '../../../selectors/taxonomy';
import * as api from '../../../services/api';
import * as actions from '../../../actions';
import Header from '../../../components/header';
import Accordion from '../../../components/accordion';
import Selector from '../../../components/selector';
import Button from '../../../components/button';
import getCategoryIcon from '../util/getCategoryIcon';
import AddServiceForm from './AddServiceForm';

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
    active: -1,
    selected: {},
    isLoading: false,
    isAdding: false,
    selectedCategory: undefined,
  };

  componentWillMount() {
    if (this.props.taxonomy.length === 0) {
      this.props.getTaxonomy();
    }
    if (Object.keys(this.props.location).length === 0) {
      const { locationId } = this.props.match.params;
      this.props.getTaxonomy();
      this.props.getLocation(locationId);
    }
  }

  onToggleOpen = value =>
    this.setState(({ active }) => ({ active: active !== value ? value : -1 }));

  onSelect = (category) => {
    const { selected } = this.state;
    const selection = selected[category.id];
    this.setState({ selected: { ...selected, [category.id]: !selection } });
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

  onAddService = category => this.setState({ isAdding: true, selectedCategory: category });

  onAddSubmit = (category, name) => {
    const { locationId } = this.props.match.params;

    this.setState({ isAdding: false, selectedCategory: undefined }, () =>
      this.createService(locationId, category, name));
  };

  onAddCancel = () => {
    this.setState({ isAdding: false, selectedCategory: undefined });
  };

  createService = (locationId, category, name) => {
    api
      .createService(locationId, category, name)
      .then(() => this.props.getLocation(locationId))
      .catch(error => console.log('error', error)); // eslint-disable-line no-console
  };

  isActive = (itemId, parentId) =>
    this.isSelectedCategory(itemId) ||
    this.isCurrentCategory(itemId) ||
    this.isAddedService(itemId, parentId);

  isSelectedCategory = itemId => this.state.selected[itemId];

  isCurrentCategory = itemId => this.props.currentCategories[itemId];

  isAddedService = (itemId, parentId) =>
    this.props.currentCategories[parentId] &&
    this.props.currentCategories[parentId].find(el => el.id === itemId);

  render() {
    const {
      active, isLoading, isAdding, selectedCategory,
    } = this.state;
    const { taxonomy = [], location } = this.props;

    if (!taxonomy || !location || isLoading) {
      return <LoadingView locationId={this.props.match.params.locationId} />;
    }

    if (isAdding) {
      return (
        <div className="text-left">
          <NavBar
            backButtonTarget={`/location/${this.props.match.params.locationId}`}
            title="Services info"
          />
          <AddServiceForm
            category={selectedCategory}
            onSubmit={this.onAddSubmit}
            onCancel={this.onAddCancel}
          />
        </div>
      );
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
          {taxonomy.map((category, i) => (
            <div key={category.id}>
              <Accordion.Item
                active={active === category.id}
                onClick={() => this.onToggleOpen(category.id)}
                title={category.name}
                icon={getCategoryIcon(category.name)}
              />
              <Accordion.Content active={active === category.id}>
                <Selector fluid>
                  {category.children &&
                    category.children.map(item => (
                      <Selector.Option
                        key={item.id}
                        onClick={() => this.onSelect(item)}
                        active={this.isActive(item.id, category.id)}
                        disabled={
                          this.isCurrentCategory(item.id) ||
                          this.isAddedService(item.id, category.id)
                        }
                      >
                        {item.name}
                      </Selector.Option>
                    ))}
                  <Selector.Option onClick={() => this.onAddService(category)} align="center">
                    + Add another {category.name.toLowerCase()} service
                  </Selector.Option>
                </Selector>
              </Accordion.Content>
            </div>
          ))}
        </Accordion>
        <div className="position-fixed" style={{ right: 0, bottom: 0, left: 0 }}>
          <Button fluid primary onClick={this.onSubmit}>
            Next
          </Button>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state, ownProps) => ({
  location: getLocation(state, ownProps),
  taxonomy: getTaxonomyForLocation(state, ownProps),
  currentCategories: getCurrentCategories(state, ownProps),
});

const mapDispatchToProps = (dispatch, ownProps) => ({
  getLocation: bindActionCreators(actions.getLocation, dispatch),
  getTaxonomy: bindActionCreators(actions.getTaxonomy, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(ServiceCategories);
