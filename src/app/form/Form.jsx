import React from 'react';
import { Link } from 'react-router-dom';

function Form() {
  return (
    <div className="Map">
      <h1>Form View</h1>
      <Link to="/">Go to Map</Link>
      <Link to="/login">Login</Link>
    </div>
  );
}

export default Form;
