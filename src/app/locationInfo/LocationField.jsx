import React, { Component } from 'react';
import cx from 'classnames';
import moment from 'moment';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';

import Badge from '../../components/badge';
import Icon from '../../components/icon';

import './LocationField.css';

class LocationField extends Component {
  constructor() {
    super();
    this.navigateToFieldForm = this.navigateToFieldForm.bind(this);
  }

  navigateToFieldForm() {
    this.props.history.push(`${this.props.navigateToLocation}/${this.props.locationId}`);
  }

  render() {
    const { title, updatedAt, required } = this.props;

    const classNames = {
      field: cx('LocationField border-top border-bottom'),
      emptyDot: cx('rounded-circle mr-2', {
        'bg-danger': !updatedAt || moment(updatedAt).isBefore(moment().subtract(1, 'years')),
        'bg-warning': updatedAt && moment(updatedAt).isBefore(moment().subtract(6, 'months')),
        'bg-success': updatedAt && moment(updatedAt).isBefore(moment()),
      }),
      updatedAt: cx('font-weight-light', {
        'text-uppercase text-danger font-weight-bold': !updatedAt,
      }),
    };

    const updatedAtText = updatedAt ? moment(updatedAt).fromNow() : 'Missing info. Please add!';

    return (
      <div className={classNames.field} onClick={this.navigateToFieldForm}>
        <div className="container p-4 text-left">
          <div className="row d-flex justify-content-between align-items-center">
            <div className="d-flex flex-column">
              <h5 className="font-weight-light mb-1">{title}</h5>
              <div className="d-flex">
                <Badge>
                  <div className={classNames.emptyDot} style={{ height: '10px', width: '10px' }} />
                  <small className={classNames.updatedAt}>
                    {updatedAtText}
                    {moment(updatedAt).isBefore(moment().subtract(6, 'months'))
                      ? '. Please verify.'
                      : ''}
                  </small>
                </Badge>
              </div>
            </div>
            <div>
              <Icon name="chevron-right" className="text-secondary" />
            </div>
          </div>
        </div>
      </div>
    );
  }
}

LocationField.propTypes = {
  title: PropTypes.string.isRequired,
  updatedAt: PropTypes.string.isRequired,
  navigateToLocation: PropTypes.string.isRequired,
};

export default withRouter(LocationField);
