/* eslint-disable no-console */
import React, { Component } from 'react';
import debounce from 'lodash.debounce';
import {
  getLocations,
  getOrganizations,
  getOrganizationLocations,
} from '../../services/api';
import Map from '../../components/map';

const defaultCenter = { lat: 40.7831, lng: -73.9712 };
const defaultZoom = 14;
const minZoom = 11;
const geolocationTimeout = 5000;
const onBoundsChangedDebouncePeriod = 500;

export default class MapView extends Component {
  state = {
    center: defaultCenter,
    suggestions: [],
  };

  componentDidMount() {
    if (!navigator || !navigator.geolocation) {
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (userPosition) => {
        const { coords } = userPosition;
        this.setState({
          center: {
            lat: coords.latitude,
            lng: coords.longitude,
          },
        });
      },
      e => console.error('Failed to get current position', e),
      { timeout: geolocationTimeout },
    );

    this.mapWrapper.addEventListener('touchstart', () => {
      this.searchInput.blur();
    }, true);

    this.inputGroup.addEventListener('touchstart', () => {
      this.searchInput.focus();
    }, true);
  }

  onSearchChanged = (searchString) => {
    if (searchString) {
      this.onSuggestionsFetchRequested({ searchString });
    } else {
      this.onSuggestionsClearRequested();
    }
  };

  onBoundsChanged = debounce(({ center, radius }) => {
    this.fetchLocations(center, radius);
  }, onBoundsChangedDebouncePeriod);

  onSuggestionsFetchRequested = ({ searchString, reason }) => {
    getOrganizations(searchString)
      .then((organizations) => {
        this.setState({ suggestions: organizations });
      })
      .catch(e => console.error('error', e));
  };

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
        this.map.onToggleMarkerInfo(firstLoc.id);
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

  render() {
    return (
      <div className="Map">
        <ul
          className="suggestions"
          style={{
            position: 'absolute',
            top: '2.75em',
            background: 'white',
            listStyle: 'none',
            paddingLeft: 0,
            zIndex: 1,
            left: '.5em',
            right: '.5em',
            textAlign: 'left',
            transition: 'max-height 1s',
            maxHeight: this.state.suggestions.length ? `${window.innerHeight - 50}px` : '0px',
            overflow: 'scroll',
          }}
        >
          {
            this.state.suggestions && this.state.suggestions.map((organization, i) => (
              <li
                onClick={() => this.handleSuggestionClick(organization)}
                key={organization.id}
                style={{
                  borderLeft: '1px solid black',
                  borderRight: '1px solid black',
                  borderTop: i === 0 ? '1px solid black' : undefined,
                  borderBottom: '1px solid black',
                }}
              >
                {organization.name}
              </li>
            ))
          }
        </ul>
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
            ref={(m) => { this.map = m; }}
            locations={this.state && this.state.locations}
            options={{
              minZoom,
              disableDefaultUI: true,
              gestureHandling: 'greedy',
              clickableIcons: false,
              styles: [
                  {
                      featureType: 'poi',
                      elementType: 'labels',
                      stylers: [
                            { visibility: 'off' },
                      ],
                  },
              ],
            }}
            defaultZoom={defaultZoom}
            defaultCenter={defaultCenter}
            onBoundsChanged={this.onBoundsChanged}
            center={this.state.center}
          />
        </div>
      </div>
    );
  }
}
