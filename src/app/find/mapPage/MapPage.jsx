/* eslint-disable no-console */
import React, { Component } from 'react';
import debounce from 'lodash.debounce';
import { getLocations, getTaxonomy } from '../../../services/api';
import { getCategoryIcon } from '../../../services/iconography';
import Map from '../../../components/map';
import Button from '../../../components/button';
import Icon from '../../../components/icon';
import FiltersModal from './filters/FiltersModal';
import LocationInfoMarker from './LocationInfoMarker';
import Search from './Search';
import { selectableCategoryNames } from './categories';

const minSearchResults = 3;

const debouncePeriod = 500;

const initialFiltersState = {
  searchString: null,
  advancedFilters: {},
};

export default class MapPage extends Component {
  state = {
    categories: null,
    initialLocationsLoaded: false,
    locations: null,
    zoomedLocations: null,
    center: null,
    radius: null,
    openLocationId: null,
    isSearchingLocations: false,
    isFilterModalOpen: false,
    filters: initialFiltersState,
  };

  componentDidMount() {
    this.fetchCategories();
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.categoryName !== this.props.categoryName) {
      this.searchLocations();
    }
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
      if (!this.state.initialLocationsLoaded) {
        // Center found for the first time - do a visible search, zoom out if needed, etc.
        this.searchLocations();
      } else {
        // User just moving the map - show locations if found, but don't zoom out or anything.
        this.fetchLocations().then(() => this.setState({ zoomedLocations: null }));
      }
    });
  }, debouncePeriod);

  getCategory = () => this.state.categories &&
    this.state.categories.find(category => category.name === this.props.categoryName);

  getAdvancedFilterValues = () =>
    Object.values(this.state.filters.advancedFilters).filter(option => option != null);

  getCurrentFilterString = () => {
    const { searchString } = this.state.filters;
    const category = this.getCategory();

    if (searchString) {
      return searchString;
    }

    if (!category) {
      return null;
    }

    const chainStrings = strs => (strs.length < 2 ?
      strs[0] :
      `${strs.slice(0, strs.length - 1).join(', ')} and ${strs[strs.length - 1]}`);

    return chainStrings([
      `places that provide ${category.name.toLowerCase()}`,
      ...this.getAdvancedFilterValues().map(({ description }) => description),
    ]);
  };

  setFilters = (newFilters) => {
    this.setState({
      isFilterModalOpen: false,
      filters: {
        ...this.state.filters,
        ...newFilters,
      },
    }, this.searchLocations);
  };

  setAdvancedFilters = newFilters => this.setFilters({
    advancedFilters: {
      ...this.state.filters.advancedFilters,
      ...newFilters,
    },
  });

  setSearchString = searchString => this.setFilters({ searchString });

  toggleOpenNow = () => this.setAdvancedFilters({
    openNow: this.state.filters.advancedFilters.openNow ?
      null :
      { value: true, description: 'that are open now' },
  });

  fetchLocations = (minResults) => {
    const { categoryName } = this.props;
    const {
      center,
      radius,
      filters,
      categories,
    } = this.state;
    const {
      searchString,
      advancedFilters,
    } = filters;

    if (!center || !categories) {
      // Can't fetch until we know which area and categories are relevant.
      return Promise.resolve();
    }

    const category = this.getCategory();

    let includedCategories;
    if (advancedFilters.subcategoryId) {
      includedCategories = [advancedFilters.subcategoryId.value];
    } else if (category) {
      includedCategories = [category.id];
    } else {
      includedCategories = categories.map(({ id }) => id);
    }

    return getLocations({
      latitude: center.lat(),
      longitude: center.lng(),
      radius: Math.floor(radius),
      minResults,
      searchString,
      serviceFilters: {
        ...Object.keys(advancedFilters)
          .filter(key => advancedFilters[key] != null)
          .reduce((activeFilters, key) => ({
            ...activeFilters,
            [key]: advancedFilters[key].value,
          }), {}),
        taxonomyIds: includedCategories,
      },
    })
      .then(locations => new Promise((resolve) => {
        // Ignore stale responses.
        if (
          center !== this.state.center ||
          radius !== this.state.radius ||
          filters !== this.state.filters ||
          categoryName !== this.props.categoryName
        ) {
          resolve();
          return;
        }

        this.setState({
          initialLocationsLoaded: true,
          locations,
        }, () => resolve());
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

        this.setState({ categories }, this.searchLocations);
      })
      .catch(e => console.error('Error fetching taxonomy', e));
  };

  searchLocations = () => {
    this.setState({ isSearchingLocations: true }, () => {
      this.fetchLocations(minSearchResults)
        .then(() => this.setState({
          isSearchingLocations: false,
          zoomedLocations: this.state.locations && this.state.locations.slice(0, minSearchResults),
        }));
    });
  };

  clearResults = () => {
    this.setFilters(initialFiltersState);
    this.props.goHome();
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

  renderFiltersButton = () => {
    const category = this.getCategory();

    const areModalFiltersApplied = this.getAdvancedFilterValues().length > 0;

    const type = areModalFiltersApplied ? 'secondary' : 'primary';
    const iconName = category ? 'sliders-h' : 'clock';
    const onClick = category ? this.openFilterModal : this.toggleOpenNow;

    let text;
    if (!category) {
      text = 'Open now';
    } else if (areModalFiltersApplied) {
      text = 'Filters applied';
    } else {
      text = 'Filter results';
    }

    return (
      <Button onClick={onClick} half className="mx-2" {...{ [type]: true }}>
        <Icon name={iconName} className="mr-2" />
        {text}
      </Button>
    );
  };

  renderFilteredBottomBar = () => (
    <div
      className="d-flex justify-content-around"
      style={{
        position: 'absolute',
        bottom: '1em',
        left: 0,
        right: 0,
        zIndex: 2,
      }}
    >
      <Button primary onClick={this.clearResults} half className="mx-2">
        <Icon name="times-circle" className="mr-2" />
        Go to home
      </Button>
      {this.renderFiltersButton()}
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
            onClick={() => this.props.goToCategory(category)}
          >
            <Icon name={getCategoryIcon(category.name)} size="3x" className="my-3" />
            <small style={{ fontSize: '0.6em' }} className="mt-auto my-1">{category.name}</small>
          </Button>
        ))}
      </div>
    </div>
  );

  render() {
    const isFiltering = !!this.getCurrentFilterString();
    const category = this.getCategory();

    return (
      <div className="Map">
        {this.state.isFilterModalOpen && category && (
          <FiltersModal
            category={category}
            defaultValues={this.state.filters.advancedFilters}
            onSubmit={this.setAdvancedFilters}
            onClose={this.closeFilterModal}
          />
        )}
        <Search
          suggestions={this.state.categories}
          onSubmitString={this.setSearchString}
          onSubmitSuggestion={this.props.goToCategory}
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
