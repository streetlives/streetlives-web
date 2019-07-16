import React from 'react';
import cx from 'classnames';

import Icon from '../../icon';
import './OptionButton.css';

function Option({
  active,
  iconName,
  iconSize = '2x',
  children,
  onClick,
}) {
  const classNames = cx('OptionButton d-flex justify-content-between align-items-center', {
    'OptionButton-active': active,
  });

  return (
    <button className={classNames} onClick={onClick}>
      {iconName && <Icon size={iconSize} className="OptionButtonIcon" name={iconName} />}
      <div className="OptionButtonChildren">{children}</div>
    </button>
  );
}

export default Option;
