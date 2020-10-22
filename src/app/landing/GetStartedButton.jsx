import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../../components/button';

const GetStartedButton = ({ url, ...rest }) => (
  <div className="GetStartedButton">
    <Link to={url}>
      <Button onClick={() => {}} {...rest}>
        Find free services
      </Button>
    </Link>
  </div>
);

export default GetStartedButton;
