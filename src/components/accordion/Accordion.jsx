import React from 'react';
import cx from 'classnames';
import Icon from '../icon';

import './Accordion.css';

function Item({
  onClick, title, icon, active,
}) {
  const classNames = cx('Item w-100', {
    'Item-active': active,
  });
  return (
    <button className={classNames} onClick={onClick}>
      <div className="container d-flex justify-content-between align-items-center">
        <div>
          <Icon name={icon} size="lg" className="mr-3" />
          {title}
        </div>
        {active ? <Icon name="chevron-up" /> : <Icon name="chevron-down" />}
      </div>
    </button>
  );
}

function Content({ children, active }) {
  const classNames = cx('container p-3', { 'd-none': !active });
  return <div className={classNames}>{children}</div>;
}

function Accordion({ children }) {
  return <div className="Accordion w-100">{children}</div>;
}

Accordion.Item = Item;
Accordion.Content = Content;

export default Accordion;
