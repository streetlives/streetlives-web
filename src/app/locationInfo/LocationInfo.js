import React from "react";
import moment from "moment";
import NavBar from "../NavBar";
import ProgressBar from "./ProgressBar";
import Header from "../../components/header";
import Button from "../../components/button";
import LocationField from "./LocationField";
import routes from '../locationForm/routes';

function LocationHeader() {
  return (
    <div className="container px-4 py-4 text-left">
      <div className="row">
        <Header className="m-0">Check all these details on this location:</Header>
      </div>
    </div>
  );
}

function LocationInfo() {
  return (
    <div className="d-flex flex-column">
      <NavBar title="Location Info" />
      <ProgressBar step={2} steps={routes.length} /> 
      <LocationHeader />
      <LocationField title="Entrance picture" required navigateToLocation="/questions/entrance-picture" />
      <LocationField title="Address" updatedAt={moment().subtract(1, "years")} navigateToLocation="/questions/location-address" />
      <LocationField title="Organization name" updatedAt={moment().subtract(30, "days")} navigateToLocation="/questions/organization-name" />
      <LocationField title="Location name" updatedAt={moment().subtract(3, "months")} navigateToLocation="/questions/location-name" />
      <LocationField title="Location description" updatedAt={moment().subtract(3, "months")} navigateToLocation="/questions/location-description" />
      <LocationField title="Phone number" required navigateToLocation="/questions/phone-number" />
      <LocationField title="Website" updatedAt={moment().subtract(3, "months")} navigateToLocation="/questions/website" />
      <LocationField title="Additional info" navigateToLocation="/questions/additional-info" />
      <Button fluid primary onClick={() => console.log('Clicked done')}>
        Done
      </Button>
    </div>
  );
}

export default LocationInfo;
