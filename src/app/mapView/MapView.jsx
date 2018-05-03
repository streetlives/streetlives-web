import React, { Component } from 'react';
import { 
  getLocations, 
  getOrganizations, 
  getOrganizationLocations  
} from '../../services/api';
import Map from '../../components/map';
/* eslint-env es6 */

const defaultCenter = { lat: 40.7831, lng: -73.9712 };
const defaultZoom = 14;
const minZoom = 11;
const geolocationTimeout = 5000;
export default class MapView extends Component {
  state = {
    center: defaultCenter,
    suggestions: []
  };

  componentDidMount() {
    if (!navigator || !navigator.geolocation) {
      return;
    }

    navigator.geolocation.getCurrentPosition(
      userPosition => {
        const { coords } = userPosition;
        this.setState({
          center : {
            lat: coords.latitude,
            lng: coords.longitude,
          }
        });
      },
      e => console.error('Failed to get current position', e),
      { timeout: geolocationTimeout },
    );
  }

  onSearchChanged = event => {
    const searchString = event.target.value;
    if(searchString){ 
      this.onSuggestionsFetchRequested({searchString});
    } else {
      this.onSuggestionsClearRequested();
    }
  };

  onBoundsChanged = ({center, radius}) => {
    if(center.lat() === this.state.center.lat && 
        center.lng() === this.state.center.lng) return;
    this.fetchLocations(center, radius);
  }

  onSuggestionsFetchRequested = ({ searchString, reason }) => {
    getOrganizations(searchString)
      .then(organizations => { 
          this.setState({ suggestions : organizations })
      })
      .catch(e => console.error('error', e));
  };

  handleSuggestionClick = (organization) => {
    getOrganizationLocations(organization.id)  
      .then(locations => { 
        if(!locations.length) return;
        locations = locations.map( loc => ({...loc, Organization : organization}))   //add orgranization to locations
        const firstLoc = locations[0];
        const coords = firstLoc.position.coordinates;     //TODO: focus all
        this.setState({ 
          locations, 
          suggestions: [], 
          center: {
            lat: coords[1],
            lng: coords[0]  
          }
        });
        this.map.onToggleMarkerInfo(firstLoc.id);
      })
      .catch(e => console.error('error', e));
  }

  onSuggestionsClearRequested = () => {
    this.setState({
      suggestions: []
    });
  };

  fetchLocations = (center, radius) => {
    getLocations({
      latitude: center.lat(),
      longitude: center.lng(),
      radius: Math.floor(radius)
    })
      .then(locations => this.setState({ locations }))    //TODO: we can save these in the redux store
      .catch(e => console.error('error', e));
  };

  render() {
    return (
      <div className="Map">
        <ul className="suggestions"
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
            maxHeight: this.state.suggestions.length ? `${window.innerHeight-50}px` : '0px',
            overflow: 'scroll'
          }}>
          {
            this.state.suggestions && this.state.suggestions.map( (organization, i) => (
              <li 
                onClick={() => this.handleSuggestionClick(organization)}
                key={organization.id} 
                style={{
                  borderTop: i === 0 ? '1px solid black' : undefined,
                  borderBottom:'1px solid black'
                }}>
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
          <div className="input-group" style={{ padding: '.5em' }}>
            <div className="input-group-prepend">
              <span
                style={{ backgroundColor: 'white', border: 'none', borderRadius: 0 }}
                className="input-group-text"
              >
                <i className="fa fa-search" />
              </span>
            </div>
            <input
              onChange={this.onSearchChanged}
              style={{ border: 'none', borderRadius: 0 }}
              type="text"
              className="form-control"
              placeholder="Type the address, or drop a pin"
              required
            />
          </div>
        </div>
        <div style={{ position: 'absolute', left: 0, top: '3.2em', right: 0, bottom: 0 }}>
          <Map
            ref={ m => this.map = m}
            locations={this.state && this.state.locations}
            options={{ 
              minZoom, 
              disableDefaultUI: true, 
              gestureHandling: 'greedy',
              clickableIcons: false,
              styles:[
                  {
                      featureType: "poi",
                      elementType: "labels",
                      stylers: [
                            { visibility: "off" }
                      ]
                  }
              ]
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
