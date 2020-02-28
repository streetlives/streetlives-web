import React from 'react';
import Button from '../../components/button';

const GetStartedButton = ({ onClick }) => (
  <div className="GetStartedButton">
    <Button primary fluid onClick={onClick}>
      Get started
    </Button>
  </div>
);

export default GetStartedButton;
