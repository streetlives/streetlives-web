import React from 'react';
import cx from 'classnames';
import moment from 'moment';
import { withRouter } from 'react-router-dom';

import Badge from '../../components/badge';

import './LocationField.css';

function LocationField({
  title, updatedAt, required = false, navigateToLocation, history,
}) {
  const classNames = {
    field: cx('LocationField border-top border-bottom', { 'bg-yellow': required }),
    updatedAt: cx({
      'text-danger': updatedAt && moment(updatedAt).isSameOrBefore(moment().subtract(1, 'years')),
      'text-warning': updatedAt && moment(updatedAt).isSameOrBefore(moment()),
    }),
  };

  const updatedAtText = updatedAt ? moment(updatedAt).fromNow() : 'never';

  return (
    <div className={classNames.field} onClick={() => history.push(navigateToLocation)}>
      <div className="container p-4 text-left">
        <div className="row">
          <div className="d-flex flex-column">
            <div className="mb-2">
              <Badge>
                Last update: <span className={classNames.updatedAt}>{updatedAtText}</span>
              </Badge>
            </div>
            <h5 className="font-weight-light mb-2">{title}</h5>
            {required && <span>Please fill in this info</span>}
          </div>
        </div>
      </div>
    </div>
  );
}

export default withRouter(LocationField);
