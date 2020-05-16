/* eslint-disable no-console */
import React, { Component } from 'react';
import debounce from 'lodash.debounce';
import isMatch from 'lodash.ismatch';
import { getLocations } from '../../../services/api';
import Map from '../../../components/map';
import Button from '../../../components/button';
import Icon from '../../../components/icon';
import LocationMarker from '../../../components/map/LocationMarker';
import FiltersModal from './filters/FiltersModal';
import Search from './Search';
import ResultsBar from './ResultsBar';
import './mapPage.css';

const minSearchResults = 3;

const debouncePeriod = 500;

const initialFiltersState = {
  searchString: null,
  advancedFilters: {},
};

export default class MapPage extends Component {
  state = {
    initialLocationsLoaded: false,
    locations: [],
    zoomedLocations: null,
    center: null,
    radius: null,
    openLocationId: null,
    isSearchingLocations: false,
    isFilterModalOpen: false,
    filters: initialFiltersState,
  };

  componentDidMount() {
    this.props.fetchCategories();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.category !== this.props.category ||
      prevProps.categories !== this.props.categories ||
      prevProps.eligibilityParams !== this.props.eligibilityParams) {
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

  getAdvancedFilterValues = () =>
    Object.values(this.state.filters.advancedFilters).filter(option => option != null);

  getCurrentFilterString = () => {
    const { searchString } = this.state.filters;
    const { category } = this.props;

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

  setAdvancedFilters = (newFilters) => {
    if (!isMatch(this.state.filters.advancedFilters, newFilters)) {
      this.setFilters({
        advancedFilters: {
          ...this.state.filters.advancedFilters,
          ...newFilters,
        },
      });
    } else {
      this.setState({ isFilterModalOpen: false });
    }
  };

  setSearchString = searchString => this.setFilters({ searchString });

  toggleOpenNow = () => this.setAdvancedFilters({
    openNow: this.state.filters.advancedFilters.openNow ?
      null :
      { value: true, description: 'that are open now' },
  });

  fetchLocations = (minResults) => {
    const { categories, category, eligibilityParams } = this.props;
    const {
      center,
      radius,
      filters,
    } = this.state;
    const {
      searchString,
      advancedFilters,
    } = filters;

    if (!center || !categories) {
      // Can't fetch until we know which area and categories are relevant.
      return Promise.resolve();
    }

    let includedCategories;
    if (advancedFilters.subcategoryId) {
      includedCategories = [advancedFilters.subcategoryId.value];
    } else if (category) {
      includedCategories = [category.id];
    } else {
      includedCategories = categories.map(({ id }) => id);
    }

    const filtersObject = Object.keys(advancedFilters)
      .filter(key => advancedFilters[key] != null)
      .reduce((activeFilters, key) => ({
        ...activeFilters,
        [key]: advancedFilters[key].value,
      }), {});

    return getLocations({
      latitude: center.lat(),
      longitude: center.lng(),
      radius: Math.floor(radius),
      minResults,
      searchString,
      serviceFilters: {
        ...eligibilityParams,
        ...filtersObject,
        taxonomyIds: includedCategories,
      },
    })
      .then(locations => new Promise((resolve) => {
        // Ignore stale responses.
        if (
          center !== this.state.center ||
          radius !== this.state.radius ||
          filters !== this.state.filters ||
          category !== this.props.category
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

  renderFiltersButton = () => {
    const { category } = this.props;

    const areModalFiltersApplied = this.getAdvancedFilterValues().length > 0;

    const type = areModalFiltersApplied ? 'primary' : 'secondary';
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
      <Button onClick={onClick} className="mapHalfButton" {...{ [type]: true }}>
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
      <Button secondary onClick={this.clearResults} className="mapHalfButton">
        <Icon name="times-circle" className="mr-2" />
        Go to home
      </Button>
      {this.renderFiltersButton()}
    </div>
  );

  renderCategoriesSelector = () => this.props.categories && (
    <div className="categoriesContainer">
      <h5 className="categoriesTitle">Explore these types of services</h5>
      <div className="buttonsContainer">
        {this.props.categories.map(category => (
          <Button
            primary
            className="categoryButton"
            key={category.id}
            onClick={() => this.props.goToCategory(category)}
          >
            <img src={`/icons/${category.name}.svg`} alt={category.name} />
            <small className="serviceCategory">{category.name}</small>
          </Button>
        ))}
      </div>
    </div>
  );

  render() {
    const isFiltering = !!this.getCurrentFilterString();
    const { category, goToLocationDetails } = this.props;

    return (
      <div className="Map">
        {this.state.isFilterModalOpen && category && (
          <FiltersModal
            category={category}
            defaultValues={this.state.filters.advancedFilters}
            onSubmit={this.setAdvancedFilters}
          />
        )}
        <Search
          suggestions={this.props.categories}
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

              }}
            >
              {
                (isFiltering || this.state.isSearchingLocations) ? (
                  <ResultsBar
                    isSearching={this.state.isSearchingLocations}
                    filterString={this.getCurrentFilterString()}
                    hasResults={!!this.state.locations.length}
                    filters={this.state.filters}
                    clearResults={this.clearResults} 
                  />
                ) : renderSearchBar()
              }
              <Map
                onBoundsChanged={this.onBoundsChanged}
                onClick={this.onMapClick}
                zoomedLocations={this.state.zoomedLocations}
              >
                {({ centerMap }) => (
                  <div>
                    <div
                      style={{
                        position: 'absolute',
                        bottom: isFiltering ? '14vh' : '32vh',
                        right: '2vh',
                      }}
                    >
                      <Icon
                        onClick={centerMap}
                        custom
                        name="crosshairs"
                        circle
                        size="2x"
                      />
                    </div>
                    {renderSearchOverlay()}
                    {this.state.locations &&
                      this.state.locations.map(location => (
                        <LocationMarker
                          key={location.id}
                          id={location.id}
                          mapLocation={location}
                          onClick={() => goToLocationDetails(location.id)}
                        />
                      ))
                    }
                  </div>
                )}
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
