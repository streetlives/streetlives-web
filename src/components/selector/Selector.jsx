import React from 'react';
import cx from 'classnames';
import './Selector.css';

import Option from './option/Option';

function Selector({
  fluid,
  direction = 'column',
  children,
}) {
  const classNames = cx('Selector', {
    'Selector-fluid': fluid,
    'Selector-column': direction === 'column',
    'Selector-row': direction === 'row',
  });

  return <div className={classNames}>{children}</div>;
}

Selector.Option = Option;

export default Selector;
