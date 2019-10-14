import React from 'react';
import Header from '../../../components/header';
import Button from '../../../components/button';

function Intro({
  name,
  footer,
  buttonText,
  onClick,
}) {
  return (
    <div className="d-flex flex-column h-100">
      <div className="m-4 text-left font-weight-bold flex-grow-1">
        <Header size="large">
          WELCOME TO THE COMMENT PAGE FOR {name.toUpperCase()}!
        </Header>
        <Header size="large">
          By commenting here you are helping improve our services and benefitting the community
        </Header>
        <Header size="large">
          This site is for us to hear and learn from you
        </Header>
      </div>
      <div className="mx-4 mb-3">
        {footer}
      </div>
      <div className="w-100">
        <Button onClick={onClick} primary fluid className="mt-3">
          {buttonText}
        </Button>
      </div>
    </div>
  );
}

export default Intro;
