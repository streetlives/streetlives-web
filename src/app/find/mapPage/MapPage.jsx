/* eslint-disable no-console */
import React, { Component } from 'react';
import debounce from 'lodash.debounce';
import { getLocations } from '../../../services/api';
import Map from '../../../components/map';
import Button from '../../../components/button';
import Icon from '../../../components/icon';
// TODO: Refactor markers so each map page can customize its own
// (with Google Maps details still encapsulated).
import ExistingLocationMarker from '../../../components/map/ExistingLocationMarker';

const debouncePeriod = 500;

export default class MapPage extends Component {
  state = {
    center: null,
    radius: null,
    isEnteringSearchString: false,
    searchString: '',
    modifiedSearchString: '',
    suggestedCategoryForString: null,
    filteredCategory: null,
    openLocationId: null,
  };

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
      this.fetchLocations();
    });
  }, debouncePeriod);

  getCurrentFilterString = () => this.state.searchString || this.state.filteredCategory;

  fetchLocations = () => {
    // TODO: Don't specify the radius, so it can be expanded if no results are nearby.
    // TODO: Add a limit (either here or on the backend).
    const { center, radius, searchString } = this.state;

    getLocations({
      latitude: center.lat(),
      longitude: center.lng(),
      radius: Math.floor(radius),
      searchString,
    })
      .then(locations => this.setState({ locations }))
      .catch(e => console.error('error', e));
  };

  updateSearchString = (event) => {
    this.setState({ modifiedSearchString: event.target.value });
  };

  enterSearchMode = () => {
    if (!this.state.isEnteringSearchString) {
      this.setState({
        isEnteringSearchString: true,
        modifiedSearchString: '',
      });
    }
  };

  cancelSearchMode = () => {
    this.setState({
      isEnteringSearchString: false,
      modifiedSearchString: '',
    });
  };

  clearResults = () => {
    this.setState({
      searchString: null,
      filteredCategory: null,
    }, () => {
      this.fetchLocations();
    });
  };

  searchLocations = () => {
    // TODO: Don't remove the overlay until the results are in. Loading indicator I guess.
    this.setState({
      isEnteringSearchString: false,
      searchString: this.state.modifiedSearchString,
      modifiedSearchString: '',
    }, () => {
      this.fetchLocations();
    });
  };

  // TODO: Should be a (presentational) component, possibly shared between MapView and MapPage.
  // TODO: Add the icon to the tab order or whatnot.
  renderSearchBar = () => (
    <div
      style={{
        backgroundColor: '#323232',
        position: 'absolute',
        left: 0,
        top: 0,
        right: 0,
        zIndex: 2,
      }}
    >
      <form className="input-group" style={{ padding: '.5em' }} onSubmit={this.searchLocations} >
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
          style={{ border: 'none', borderRadius: 0 }}
          type="text"
          className="form-control"
          placeholder="Find what you need"
          value={this.state.modifiedSearchString}
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

  renderFilteringInfoBar = () => (
    <div
      className="py-1"
      style={{
        backgroundColor: 'white',
        position: 'absolute',
        left: 0,
        top: 0,
        right: 0,
        zIndex: 2,
      }}
    >
      Showing results for
      <span className="font-weight-bold ml-1">
        {this.getCurrentFilterString()}
      </span>
    </div>
  );

  renderBottomBar = () => (
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
      <Button secondary>
          FILTER RESULTS
      </Button>
    </div>
  );

  renderSearchOverlay = () => (
    <div
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        right: 0,
        height: this.state.isEnteringSearchString ? '100%' : 0,
        transition: 'height 0.2s',
        backgroundColor: '#F8F8FC',
      }}
    />
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
          {isFiltering ? this.renderFilteringInfoBar() : this.renderSearchBar()}
          <Map
            onBoundsChanged={this.onBoundsChanged}
            onClick={this.onMapClick}
          >
            {this.renderSearchOverlay()}
            {this.state.locations &&
              this.state.locations.map(location => (
                <ExistingLocationMarker
                  key={location.id}
                  mapLocation={location}
                  isOpen={location.id === this.state.openLocationId}
                  onToggleInfo={this.onToggleMarkerInfo}
                />
              ))
            }
          </Map>
          {isFiltering && this.renderBottomBar()}
        </div>
      </div>
    );
  }
}
