import React, { Component } from "react";
import moment from "moment";
import NavBar from "../NavBar";
import ProgressBar from "./ProgressBar";
import Header from "../../components/header";
import Button from "../../components/button";
import LocationField from "./LocationField";
import routes from '../locationForm/routes';
import { withRouter } from 'react-router-dom'
import { getLocation } from '../../services/api';

function LocationHeader() {
  return (
    <div className="container px-4 py-4 text-left">
      <div className="row">
        <Header className="m-0">Check all these details on this location:</Header>
      </div>
    </div>
  );
}

class LocationInfo extends Component {

  constructor(props){
    super(props);
    this.state = {
      locationData : null
    };

    getLocation({
      id : props.match.params.locationId
    })
      .then(locationData => this.setState({ locationData }))
      .catch(e => console.error('error', e));

    this.dummyLastUpdatedValues = [
      null,
      moment().subtract(1, "years"),
      moment().subtract(30, "days"),
      moment().subtract(3, "months"),
      moment().subtract(3, "months"),
      null,
      moment().subtract(3, "months"),
      null
    ];
  }

  isRequired(x){
    return !(Array.isArray(x) ? x.length : x);
  }

  render(){ 

    if(!this.state.locationData) return <i className="fa fa-spinner fa-spin" aria-hidden="true"></i>;
    
    const organizationName = this.state.locationData.Organization.name;
    const addresses = this.state.locationData.PhysicalAddresses;
    const locationName = this.state.locationData.name;
    const locationDescription = this.state.locationData.description;
    const phoneNumbers = this.state.locationData.Phones;
    const website = this.state.locationData.Organization.url;

    const values = 
      [
        organizationName,
        addresses,
        locationName,
        locationDescription,
        phoneNumbers,
        website
      ]

    const step = values.length - values.filter( this.isRequired ).length;

    return <div className="d-flex flex-column">
        <NavBar title="Location Info" />
        <ProgressBar step={step} steps={routes.length} /> 
        <LocationHeader />
        { routes.map( (route,i) => <LocationField 
            key={route[0]} 
            updatedAt={this.dummyLastUpdatedValues[i]} 
            title={route[2]} 
            navigateToLocation={route[0]} 
            required={this.isRequired(values[i])}/>) }
        <Button fluid primary onClick={() => console.log('Clicked done')}>
          Done
        </Button>
      </div>;
  }
}

export default withRouter(LocationInfo);
