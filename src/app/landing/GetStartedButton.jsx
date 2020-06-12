import React from 'react';
import Button from '../../components/button';

const GetStartedButton = ({ onClick, ...rest }) => (
  <div className="GetStartedButton">
    <Button onClick={onClick} {...rest}>
      Find free services
    </Button>
  </div>
);

export default GetStartedButton;
