/* eslint-disable no-console */
import React, { Component } from 'react';
import debounce from 'lodash.debounce';
import {
  getLocations,
  getOrganizations,
  getOrganizationLocations,
} from '../../../services/api';
import { getAddressForLocation } from '../../../services/geocoding';
import Map from '../../../components/map';
import Dropdown from '../../../components/dropdown';
import ExistingLocationMarker from './ExistingLocationMarker';
import NewLocationMarker from './NewLocationMarker';

const debouncePeriod = 500;

export default class MapView extends Component {
  state = {
    center: null,
    searchString: '',
    suggestions: [],
    openLocationId: null,
    newLocation: null,
  };

  componentDidMount() {
    this.mapWrapper.addEventListener('touchstart', () => {
      this.searchInput.blur();
    }, true);

    this.inputGroup.addEventListener('touchstart', () => {
      this.searchInput.focus();
    }, true);
  }

  onMapClick = (clickEvent) => {
    getAddressForLocation(clickEvent.latLng)
      .then((address) => {
        const { formattedAddress, ...addressComponents } = address;

        this.setState({
          newLocation: {
            position: { coordinates: [clickEvent.latLng.lng(), clickEvent.latLng.lat()] },
            address: addressComponents,
            formattedAddress,
          },
          openLocationId: null,
        });
      })
      .catch((err) => {
        // eslint-disable-next-line no-console
        console.error('Failed to get address for new location', err);
      });
  };

  onToggleMarkerInfo = (toggledLocationId) => {
    this.setState({
      openLocationId: this.state.openLocationId === toggledLocationId ? null : toggledLocationId,
      newLocation: null,
    });
  };

  onNewLocationCancel = () => {
    this.setState({ newLocation: null });
  };

  onSearchChanged = (searchString) => {
    this.setState({ searchString }, () => {
      if (searchString) {
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
    getOrganizations(searchString)
      .then((organizations) => {
        const searchStringAtTimeOfResponse = this.state.searchString;
        const searchResponseStillValid =
          searchStringAtTimeOfResponse && searchStringAtTimeOfResponse.indexOf(searchString) !== -1;

        if (searchResponseStillValid) {
          this.setState({ suggestions: organizations });
        }
      })
      .catch(e => console.error('error', e));
  }, debouncePeriod);

  onSuggestionsClearRequested = () => {
    this.setState({
      suggestions: [],
    });
  };

  handleSuggestionClick = (organization) => {
    getOrganizationLocations(organization.id)
      .then((locations) => {
        if (!locations.length) return;
        const locationsWithOrganization = locations.map(loc => ({
          ...loc,
          Organization: organization,
        })); // TODO: add orgranization to locations
        const firstLoc = locationsWithOrganization[0];
        const coords = firstLoc.position.coordinates; // TODO: focus all
        this.searchInput.value = '';
        this.setState({
          suggestions: [],
          center: {
            lat: coords[1],
            lng: coords[0],
          },
        });
        this.onToggleMarkerInfo(firstLoc.id);
      })
      .catch(e => console.error('error', e));
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
      {this.state.newLocation && (
        <NewLocationMarker
          key="new"
          mapLocation={this.state.newLocation}
          onClose={this.onNewLocationCancel}
        />
      )}
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
                this.state.suggestions.map(organization => ({
                  id: organization.id,
                  label: organization.name,
                  onClick: () => this.handleSuggestionClick(organization),
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
                <i className="fa fa-search" />
              </span>
            </div>
            <input
              ref={(input) => { this.searchInput = input; }}
              onChange={event => this.onSearchChanged(event.target.value)}
              style={{ border: 'none', borderRadius: 0 }}
              type="text"
              className="form-control"
              placeholder="Type the organization name or drop a pin"
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
