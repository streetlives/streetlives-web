import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

import Icon from '../../components/icon';

import UpdatedBadge from './UpdatedBadge';

function FieldItem({ title, updatedAt, linkTo }) {
  return (
    <Link className="border-top border-bottom" to={linkTo}>
      <div className="container p-4 text-left">
        <div className="row d-flex justify-content-between align-items-center">
          <div className="d-flex flex-column">
            <h5 className="font-weight-light mb-1">{title}</h5>
            <div className="d-flex">
              <UpdatedBadge updatedAt={updatedAt} />
            </div>
          </div>
          <div>
            <Icon name="chevron-right" className="text-secondary" />
          </div>
        </div>
      </div>
    </Link>
  );
}

FieldItem.propTypes = {
  title: PropTypes.string.isRequired,
  linkTo: PropTypes.string.isRequired,
  updatedAt: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
};

FieldItem.defaultProps = {
  updatedAt: undefined,
};

export default FieldItem;
