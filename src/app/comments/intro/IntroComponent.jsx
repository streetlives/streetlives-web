import React from 'react';
import cx from 'classnames';
import Header from '../../../components/header';
import Button from '../../../components/button';

function Intro({
  name,
  footer,
  buttonText,
  onClick,
  className,
  style,
}) {
  const classNames = cx('d-flex flex-column', className);
  return (
    <div className={classNames} style={style}>
      <div className="m-4 text-left font-weight-bold flex-grow-1">
        <Header size="large">
          WELCOME TO THE COMMENT PAGE FOR {name.toUpperCase()}!
        </Header>
        <Header size="large">
          By commenting here you are helping improve our services, and benefitting the community.
        </Header>
        <Header size="large">
          This site is for us to hear and learn from you.
        </Header>
      </div>
      <div className="m-4 pb-5">
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
