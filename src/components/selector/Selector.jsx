import React from 'react';
import cx from 'classnames';
import './Selector.css';

import Option from './option/Option';

function Selector() {
  const { fluid, children } = this.props;
  const classNames = cx('Selector', {
    'Selector-fluid': fluid,
  });

  return <div className={classNames}>{children}</div>;
}

Selector.Option = Option;

export default Selector;
