import React from "react";
import NavBar from "../NavBar";
import ProgressBar from "./ProgressBar";

function LocationInfo() {
  return (
    <div className="d-flex flex-column">
      <NavBar title="Location Info" />
      <ProgressBar progress={0} />
      <div>Location Info</div>
      <div className="container" />
    </div>
  );
}

export default LocationInfo;
