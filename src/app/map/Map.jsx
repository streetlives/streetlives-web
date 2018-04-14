import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../../components/button';

function Map() {
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

export default Map;
