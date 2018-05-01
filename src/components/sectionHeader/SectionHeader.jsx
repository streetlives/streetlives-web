import React from 'react';

import Icon from '../icon';
import './SectionHeader.css';

function SectionHeader({ title, icon }) {
  return (
    <div className="SectionHeader w-100 d-flex">
      <div className="container">
        <Icon name={icon} size="lg" className="mr-3" />
        {title}
      </div>
    </div>
  );
}

export default SectionHeader;
