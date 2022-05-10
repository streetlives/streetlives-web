/* eslint-disable no-console */
import React, { Component } from 'react';
import debounce from 'lodash.debounce';
import { getLocations } from '../../../services/api';
import Map from '../../../components/map';
import Dropdown from '../../../components/dropdown';
import Icon from '../../../components/icon';
import ExistingLocationMarker from '../mapView/ExistingLocationMarker';

const debouncePeriod = 500;
const minSearchLength = 3;

export default class MapView extends Component {
  state = {
    center: null,
    searchString: '',
    suggestions: [],
    openLocationId: null,
  };

  componentDidMount() {
    this.mapWrapper.addEventListener('touchstart', () => {
      this.searchInput.blur();
    }, true);

    this.inputGroup.addEventListener('touchstart', () => {
      this.searchInput.focus();
    }, true);
  }

  onToggleMarkerInfo = (toggledLocationId) => {
    this.setState({
      openLocationId: this.state.openLocationId === toggledLocationId ? null : toggledLocationId,
    });
  };

  onSearchChanged = (searchString) => {
    this.setState({ searchString }, () => {
      if (searchString && searchString.trim().length >= minSearchLength) {
        this.onSuggestionsFetchRequested({ searchString });
      } else {
        this.onSuggestionsClearRequested();
      }
    });
  };

  onBoundsChanged = debounce(({ center, radius }) => {
    this.fetchLocations(center, radius);
  }, debouncePeriod);

  onSuggestionsFetchRequested = debounce(({ searchString, reason }) => {
    getLocations({ organizationName: searchString })
      .then((locations) => {
        const searchStringAtTimeOfResponse = this.state.searchString;
        const searchResponseStillValid =
          searchStringAtTimeOfResponse && searchStringAtTimeOfResponse.indexOf(searchString) !== -1;

        if (searchResponseStillValid) {
          this.setState({ suggestions: locations });
        }
      })
      .catch(e => console.error('error', e));
  }, debouncePeriod);

  onSuggestionsClearRequested = () => {
    this.setState({
      suggestions: [],
    });
  };

  handleSuggestionClick = (location) => {
    const coords = location.position.coordinates;
    this.searchInput.value = '';
    this.setState({
      suggestions: [],
      center: {
        lat: coords[1],
        lng: coords[0],
      },
    });
    this.onToggleMarkerInfo(location.id);
  }

  fetchLocations = (center, radius) => {
    getLocations({
      latitude: center.lat(),
      longitude: center.lng(),
      radius: Math.floor(radius),
    })
      .then(locations => this.setState({ locations })) // TODO: we can save these in the redux store
      .catch(e => console.error('error', e));
  };

  editLocation = (locationId) => {
    let currentUrl = this.props.match.url;
    if (currentUrl.endsWith('/')) {
      currentUrl = currentUrl.slice(0, currentUrl.length - 1);
    }
    this.props.history.push(`${currentUrl}/location/${locationId}/recap`);
  }

  renderLocationMarkers = () => (
    <div>
      {this.state.locations &&
        this.state.locations.map(location => (
          <ExistingLocationMarker
            key={location.id}
            mapLocation={location}
            isOpen={location.id === this.state.openLocationId}
            onToggleInfo={this.onToggleMarkerInfo}
            onEnterLocation={this.editLocation}
          />
      ))}
    </div>
  );

  render() {
    return (
      <div className="Map">
        <div
          className="suggestions"
          style={{
            position: 'absolute',
            top: '2.75em',
            paddingLeft: 0,
            zIndex: 1,
            left: '.5em',
            right: '.5em',
            textAlign: 'left',
            transition: 'height 0.5s',
            height: this.state.suggestions.length ? `${window.innerHeight - 50}px` : '0px',
            overflow: 'hidden',
            pointerEvents: 'none',
          }}
        >
          <div style={{ pointerEvents: 'auto' }}>
            {
              this.state.suggestions && <Dropdown options={
                this.state.suggestions.map(loc => ({
                  id: loc.id,
                  label: `${loc.Organization.name}${loc.name ? ` - ${loc.name}` : ''}`,
                  onClick: () => this.handleSuggestionClick(loc),
                }))}
              />
            }
          </div>
        </div>
        <div
          style={{
            backgroundColor: '#323232',
            position: 'absolute',
            left: 0,
            top: '0em',
            right: 0,
          }}
        >
          <div
            ref={(e) => { this.inputGroup = e; }}
            className="input-group"
            style={{ padding: '.5em' }}
          >
            <div className="input-group-prepend">
              <span
                style={{ backgroundColor: 'white', border: 'none', borderRadius: 0 }}
                className="input-group-text"
              >
                <Icon name="search" />
              </span>
            </div>
            <input
              ref={(input) => { this.searchInput = input; }}
              onChange={event => this.onSearchChanged(event.target.value)}
              style={{ border: 'none', borderRadius: 0 }}
              type="text"
              className="form-control"
              placeholder="Type the address, or drop a pin"
              required
            />
          </div>
        </div>
        <div
          ref={(e) => { this.mapWrapper = e; }}
          style={{
            position: 'absolute', left: 0, top: '3.2em', right: 0, bottom: 0,
          }}
        >
          <Map
            onBoundsChanged={this.onBoundsChanged}
            onClick={this.onMapClick}
            center={this.state.center}
          >
            {this.renderLocationMarkers()}
          </Map>
        </div>
      </div>
    );
  }
}
