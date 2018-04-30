import React from 'react';
import { Link } from 'react-router-dom';

import Icon from '../../../components/icon';

import './ListItem.css';

function ListItem({ service }) {
  return (
    <Link to={service.id} className="ListItem d-block py-4 border-top border-bottom">
      <div className="container d-flex justify-content-between align-items-center">
        <div>
          <h5 className="font-weight-normal m-0">{service.name}</h5>
          <span className="text-secondary">{service.progress || 0}% completed</span>
        </div>
        <Icon name="chevron-right" size="lg" />
      </div>
    </Link>
  );
}

export default ListItem;
