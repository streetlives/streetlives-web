import React, { Component } from "react";
import { Link } from "react-router-dom";
import Button from "../../components/Button";

class Map extends Component {
  render() {
    return (
      <div className="Map">
        <h1>Map View</h1>
        <Button>Click Link</Button>
        <div>
          <Link to="/login">Login</Link>
          <Link to="/form">Add location</Link>
        </div>
      </div>
    );
  }
}

export default Map;
