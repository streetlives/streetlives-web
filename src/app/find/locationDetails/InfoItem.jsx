import React from 'react';
import cx from 'classnames';
import Icon from '../../../components/icon';

const InfoItem = ({ icon, children, coronavirus }) => {
  const classNames = cx('ml-4 pl-1', {
    coronavirusInfo: coronavirus,
  });

  return (
    <div className="infoItem">
      <Icon name={icon} className="float-left mt-1" />
      <div className={classNames}>{children}</div>
    </div>
  );
};

export default InfoItem;
