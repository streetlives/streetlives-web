import React, { Component } from "react";
import { Link } from "react-router-dom";

class Map extends Component {
  render() {
    return (
      <div className="Map">
        <h1>Map View</h1>
        <Link to="/login">Login</Link>
        <Link to="/form">Add location</Link>
      </div>
    );
  }
}

export default Map;
