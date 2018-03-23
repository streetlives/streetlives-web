import React, { Component } from "react";
import { Link } from "react-router-dom";

class Form extends Component {
  render() {
    return (
      <div className="Map">
        <h1>Form View</h1>
        <Link to="/">Go to Map</Link>
        <Link to="/login">Login</Link>
      </div>
    );
  }
}

export default Form;
