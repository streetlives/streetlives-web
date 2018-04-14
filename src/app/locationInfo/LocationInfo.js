import React from "react";
import moment from "moment";
import NavBar from "../NavBar";
import ProgressBar from "./ProgressBar";
import Header from "../../components/header";
import Button from "../../components/button";
import LocationField from "./LocationField";

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
      <ProgressBar progress={0} />
      <LocationHeader />
      <LocationField title="Entrance picture" required />
      <LocationField title="Address" updatedAt={moment().subtract(1, "years")} />
      <LocationField title="Organization name" updatedAt={moment().subtract(30, "days")} />
      <LocationField title="Location name" updatedAt={moment().subtract(3, "months")} />
      <LocationField title="Location description" updatedAt={moment().subtract(3, "months")} />
      <LocationField title="Phone number" required />
      <LocationField title="Website" updatedAt={moment().subtract(3, "months")} />
      <LocationField title="Additional info" />
      <Button fluid primary>
        Done
      </Button>
    </div>
  );
}

export default LocationInfo;
