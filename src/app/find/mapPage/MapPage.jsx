/* eslint-disable no-console */
import React, { Component } from 'react';
import debounce from 'lodash.debounce';
import { getLocations, getTaxonomy } from '../../../services/api';
import { getCategoryIcon } from '../../../services/iconography';
import Map from '../../../components/map';
import Button from '../../../components/button';
import Icon from '../../../components/icon';
import LocationInfoMarker from './LocationInfoMarker';
import Search from './Search';
import { selectableCategoryNames, getFilterModalForCategory } from './categories';

const minSearchResults = 3;

const debouncePeriod = 500;

export default class MapPage extends Component {
  state = {
    categories: null,
    locations: null,
    zoomedLocations: null,
    center: null,
    radius: null,
    openLocationId: null,
    isSearchingLocations: false,
    isFilterModalOpen: false,
    filters: {
      searchString: null,
      category: null,
    },
  };

  componentDidMount() {
    this.fetchCategories();
  }

  onMapClick = () => {
    this.setState({ openLocationId: null });
  };

  onToggleMarkerInfo = (toggledLocationId) => {
    this.setState({
      openLocationId: this.state.openLocationId === toggledLocationId ? null : toggledLocationId,
    });
  };

  onBoundsChanged = debounce(({ center, radius }) => {
    this.setState({ center, radius }, () => {
      this.fetchLocations()
        .then(() => this.setState({ zoomedLocations: null }));
    });
  }, debouncePeriod);

  getCurrentFilterString = () =>
    this.state.filters.searchString ||
    (this.state.filters.category &&
      `places that provide ${this.state.filters.category.name.toLowerCase()}`);

  setFilters = (newFilters) => {
    this.setState({
      isFilterModalOpen: false,
      filters: {
        ...this.state.filters,
        ...newFilters,
      },
    }, this.searchLocations);
  };

  setSearchString = searchString => this.setFilters({ searchString });
  selectCategory = category => this.setFilters({ category });

  fetchLocations = (minResults) => {
    const {
      center,
      radius,
      filters,
      categories,
    } = this.state;
    const {
      searchString,
      category,
    } = filters;

    if (!center || !categories) {
      // Can't fetch until we know which area and categories are relevant.
      return Promise.resolve();
    }

    const includedCategories = category ?
      [category.id] :
      categories.map(({ id }) => id);

    return getLocations({
      latitude: center.lat(),
      longitude: center.lng(),
      radius: Math.floor(radius),
      taxonomyIds: includedCategories,
      searchString,
      minResults,
    })
      .then(locations => new Promise((resolve) => {
        // Ignore stale responses.
        if (
          center !== this.state.center ||
          radius !== this.state.radius ||
          searchString !== this.state.filters.searchString ||
          category !== this.state.filters.category
        ) {
          resolve();
          return;
        }

        this.setState({ locations }, () => resolve());
      }))
      .catch(e => console.error('error', e));
  };

  fetchCategories = () => {
    // TODO: Potentially use an action (i.e. put in Redux state).
    getTaxonomy()
      .then((taxonomy) => {
        const categories = taxonomy
          .map(category => ({
            ...category,
            index: selectableCategoryNames.indexOf(category.name.trim().toLowerCase()),
          }))
          .filter(({ index }) => index !== -1)
          .sort((category1, category2) => category1.index - category2.index);

        this.setState({ categories }, this.fetchLocations);
      })
      .catch(e => console.error('Error fetching taxonomy', e));
  };

  searchLocations = () => {
    this.setState({ isSearchingLocations: true }, () => {
      this.fetchLocations(minSearchResults)
        .then(() => this.setState({
          isSearchingLocations: false,
          zoomedLocations: this.state.locations.slice(0, minSearchResults),
        }));
    });
  };

  clearResults = () => {
    this.setState({ filters: {} }, this.searchLocations);
  };

  openFilterModal = () => {
    this.setState({ isFilterModalOpen: true });
  }

  closeFilterModal = () => {
    this.setState({ isFilterModalOpen: false });
  };

  renderFilteringInfoBar = () => (
    <div
      className="p-1"
      style={{
        backgroundColor: 'white',
        position: 'absolute',
        left: 0,
        top: 0,
        right: 0,
        zIndex: 2,
      }}
    >
      {this.state.isSearchingLocations ? (
        <div>Loading results...</div>
      ) : (
        <div>
          Showing results for
          <span className="font-weight-bold ml-1">
            {this.getCurrentFilterString()}
          </span>
        </div>
      )}
    </div>
  );

  renderFilteredBottomBar = () => (
    <div
      className="d-flex justify-content-around"
      style={{
        position: 'absolute',
        bottom: '1em',
        left: '1em',
        right: '1em',
        zIndex: 2,
      }}
    >
      <Button primary onClick={this.clearResults}>
          CLEAR RESULTS
      </Button>
      {this.state.filters.category && (
        <Button secondary onClick={this.openFilterModal}>
          FILTER RESULTS
        </Button>
      )}
    </div>
  );

  renderCategoriesSelector = () => this.state.categories && (
    <div
      className="p-2 rounded-top shadow-lg"
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        background: 'white',
        zIndex: 2,
      }}
    >
      <h5 className="font-weight-bold my-2">Explore these types of services</h5>
      <div className="d-flex justify-content-around">
        {this.state.categories.map(category => (
          <Button
            primary
            className="mx-0 p-0 d-flex flex-column align-items-center"
            key={category.id}
            onClick={() => this.selectCategory(category)}
          >
            <Icon name={getCategoryIcon(category.name)} size="3x" className="my-3" />
            <small style={{ fontSize: '0.6em' }} className="mt-auto my-1">{category.name}</small>
          </Button>
        ))}
      </div>
    </div>
  );

  renderFiltersModal = () => {
    const { category } = this.state.filters;

    if (!category) {
      return null;
    }

    const CategoryFiltersModal = getFilterModalForCategory(category);

    return (
      <CategoryFiltersModal
        category={category}
        defaultValues={this.state.filters}
        onSubmit={this.setFilters}
        onClose={this.closeFilterModal}
      />
    );
  };

  render() {
    const isFiltering = !!this.getCurrentFilterString();

    return (
      <div className="Map">
        {this.state.isFilterModalOpen && this.renderFiltersModal()}
        <Search
          suggestions={this.state.categories}
          onSubmitString={this.setSearchString}
          onSubmitSuggestion={this.selectCategory}
        >
          {({ renderSearchBar, renderSearchOverlay, renderSpeechElements }) => (
            <div
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                right: 0,
                bottom: 0,
                zIndex: 1,
              }}
            >
              {
                (isFiltering || this.state.isSearchingLocations) ?
                  this.renderFilteringInfoBar() :
                  renderSearchBar()
              }
              <Map
                onBoundsChanged={this.onBoundsChanged}
                onClick={this.onMapClick}
                zoomedLocations={this.state.zoomedLocations}
              >
                {renderSearchOverlay()}
                {this.state.locations &&
                  this.state.locations.map(location => (
                    <LocationInfoMarker
                      key={location.id}
                      mapLocation={location}
                      isOpen={location.id === this.state.openLocationId}
                      onToggleInfo={this.onToggleMarkerInfo}
                    />
                  ))
                }
              </Map>
              {!isFiltering && renderSpeechElements()}
              {isFiltering ? this.renderFilteredBottomBar() : this.renderCategoriesSelector()}
            </div>
          )}
        </Search>
      </div>
    );
  }
}
