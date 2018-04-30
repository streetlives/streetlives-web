import React from 'react';

import Icon from '../../../components/icon';

function ListItem({ title, progress, onClick }) {
  return (
    <div className="ListItem py-4 border-top border-bottom" style={{ cursor: 'pointer' }}>
      <div className="container d-flex justify-content-between align-items-center">
        <div>
          <h5 className="font-weight-normal m-0">{title}</h5>
          <span className="text-secondary">{progress}% completed</span>
        </div>
        <Icon name="chevron-right" size="lg" />
      </div>
    </div>
  );
}

export default ListItem;
