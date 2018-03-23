import React, { Component } from "react";
import { Link } from "react-router-dom";

class Login extends Component {
  render() {
    return (
      <div className="Map">
        <h1>Login View</h1>
        <Link to="/">Go to Map</Link>
        <Link to="/form">Add location</Link>
      </div>
    );
  }
}

export default Login;
