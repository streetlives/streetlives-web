/* eslint-disable no-console */
import React, { Component } from 'react';
import debounce from 'lodash.debounce';
import { getLocations, getTaxonomy } from '../../../services/api';
import { getCategoryIcon } from '../../../services/iconography';
import Map from '../../../components/map';
import Button from '../../../components/button';
import Icon from '../../../components/icon';
import Speech, { ListeningIndicator } from '../../../components/speech';
import LocationInfoMarker from './LocationInfoMarker';

const selectableCategoryNames = ['food', 'clothing', 'personal care'];
const minSearchResults = 3;

const debouncePeriod = 500;

export default class MapPage extends Component {
  state = {
    locations: null,
    zoomedLocations: null,
    center: null,
    radius: null,
    isEnteringSearchString: false,
    searchString: '',
    modifiedSearchString: '',
    categories: null,
    suggestedCategoryForString: null,
    filteredCategory: null,
    openLocationId: null,
    isChangingFilters: false,
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
    this.state.searchString ||
    (this.state.filteredCategory &&
      `places that provide ${this.state.filteredCategory.name.toLowerCase()}`);

  fetchLocations = (minResults) => {
    const {
      center,
      radius,
      searchString,
      categories,
      filteredCategory,
    } = this.state;

    if (!center || !categories) {
      // Can't fetch until we know which area and categories are relevant.
      return Promise.resolve();
    }

    const includedCategories = filteredCategory ?
      [filteredCategory.id] :
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
          searchString !== this.state.searchString ||
          filteredCategory !== this.state.filteredCategory
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
    this.setState({ isChangingFilters: true }, () => {
      this.fetchLocations(minSearchResults)
        .then(() => this.setState({
          isChangingFilters: false,
          zoomedLocations: this.state.locations.slice(0, minSearchResults),
        }));
    });
  };

  updateSearchString = (event) => {
    const newString = event.target.value;

    const lowerString = newString.toLowerCase();
    const suggestedCategory = newString ?
      this.state.categories.find(category => category.name.toLowerCase().includes(lowerString)) :
      null;

    this.setState({
      modifiedSearchString: newString,
      suggestedCategoryForString: suggestedCategory,
    });
  };

  filterCategory = (category) => {
    this.setState({ filteredCategory: category }, this.searchLocations);
  };

  enterSearchMode = () => {
    if (!this.state.isEnteringSearchString) {
      this.setState({
        isEnteringSearchString: true,
        modifiedSearchString: '',
        suggestedCategoryForString: null,
      });
    }
  };

  cancelSearchMode = () => {
    this.setState({
      isEnteringSearchString: false,
      modifiedSearchString: '',
      suggestedCategoryForString: null,
    });
  };

  clearResults = () => {
    this.setState({
      searchString: null,
      filteredCategory: null,
    }, this.searchLocations);
  };

  submitSearchString = () => {
    this.setState({
      isEnteringSearchString: false,
      searchString: this.state.modifiedSearchString,
      modifiedSearchString: '',
      suggestedCategoryForString: null,
    }, this.searchLocations);
  };

  updateSearchStringFromSpeech = (searchString) => {
    this.setState({ modifiedSearchString: searchString });
  }

  submitSearchFromSpeech = (text) => {
    this.setState({
      modifiedSearchString: '',
      searchString: text,
    }, this.searchLocations);
  };

  filterSuggestedCategory = () => {
    const category = this.state.suggestedCategoryForString;

    this.setState({
      isEnteringSearchString: false,
      searchString: '',
      modifiedSearchString: '',
      suggestedCategoryForString: null,
    }, () => this.filterCategory(category));
  };

  openFilters = () => {
    // eslint-disable-next-line no-alert
    alert('Further filters coming soon.');
  }

  // TODO: Should be a (presentational) component, possibly shared between MapView and MapPage.
  // TODO: Add the icon to the tab order or whatnot.
  renderSearchBar = () => (
    <div
      className="p-2"
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        right: 0,
        zIndex: 4,
      }}
    >
      <form className="input-group border" onSubmit={this.submitSearchString} >
        {this.state.isEnteringSearchString && (
          <span
            style={{ backgroundColor: 'blue', border: 'none', borderRadius: 0 }}
            className="input-group-prepend input-group-text"
          >
            <Icon name="chevron-left" onClick={this.cancelSearchMode} style={{ color: 'white' }} />
          </span>
        )}
        <input
          onChange={this.updateSearchString}
          onFocus={this.enterSearchMode}
          style={{ border: 'none', borderRadius: 0, boxShadow: 'none' }}
          type="text"
          className="form-control"
          placeholder="Find what you need"
          value={this.state.currentTranscript || this.state.modifiedSearchString}
          required
        />
        {this.state.isEnteringSearchString && (
          <button
            type="submit"
            style={{ backgroundColor: 'blue', border: 'none', borderRadius: 0 }}
            className="input-group-text"
          >
            <Icon name="search" style={{ color: 'white' }} />
          </button>
        )}
      </form>
    </div>
  );

  renderSearchOverlay = () => (
    <div
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        right: 0,
        zIndex: 3,
        height: this.state.isEnteringSearchString ? '100%' : 0,
        transition: 'height 0.2s',
        backgroundColor: '#F8F8FC',
      }}
    >
      {this.state.suggestedCategoryForString && (
        <div
          className="font-weight-bold m-2 py-2 px-3 rounded shadow d-flex align-items-center"
          style={{
            position: 'relative',
            top: 50,
            backgroundColor: 'blue',
            color: 'white',
          }}
          onClick={this.filterSuggestedCategory}
          onKeyDown={e => e.keyCode === 13 && this.filterSuggestedCategory()}
          role="button"
          tabIndex={0}
        >
          <Icon
            name={getCategoryIcon(this.state.suggestedCategoryForString.name)}
            size="lg"
            className="mr-3"
          />
          Show all places that provide {this.state.suggestedCategoryForString.name.toLowerCase()}
        </div>
      )}
    </div>
  );

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
      {this.state.isChangingFilters ? (
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

  renderSpeechElements = () => (
    <Speech
      onInterimText={this.updateSearchStringFromSpeech}
      onGotText={this.submitSearchFromSpeech}
    >
      {({
        isSpeechSupported,
        isListening,
        startSpeechToText,
      }) => isSpeechSupported && (
        isListening ? (
          <div
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              right: 0,
              bottom: 0,
              zIndex: 3,
              backgroundColor: '#F8F8FC',
            }}
          >
            <div style={{ position: 'relative', top: '50%' }}>
              <ListeningIndicator />
            </div>
          </div>
        ) : (
          <div style={{ position: 'absolute', bottom: 150, right: 25 }}>
            <Icon
              onClick={startSpeechToText}
              name="microphone"
              className="border rounded-circle py-2 px-3 mb-2"
              size="2x"
              style={{ backgroundColor: '#F8E71C' }}
            />
          </div>
        )
      )}
    </Speech>
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
      <Button secondary onClick={this.openFilters}>
          FILTER RESULTS
      </Button>
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
            onClick={() => this.filterCategory(category)}
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
    return (
      <div className="Map">
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
            (isFiltering || this.state.isChangingFilters) ?
              this.renderFilteringInfoBar() :
              this.renderSearchBar()
          }
          <Map
            onBoundsChanged={this.onBoundsChanged}
            onClick={this.onMapClick}
            zoomedLocations={this.state.zoomedLocations}
          >
            {this.renderSearchOverlay()}
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
          {!isFiltering && this.renderSpeechElements()}
          {isFiltering ? this.renderFilteredBottomBar() : this.renderCategoriesSelector()}
        </div>
      </div>
    );
  }
}
