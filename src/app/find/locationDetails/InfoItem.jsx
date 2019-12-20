import React from 'react';
import Icon from '../../../components/icon';

const InfoItem = ({ icon, children }) => (
  <div className="infoItem">
    <Icon name={icon} size="medium" className="float-left mt-1" />
    <div className="ml-4 pl-1">{children}</div>
  </div>
);

export default InfoItem;
