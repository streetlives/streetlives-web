import React, { Component } from 'react';
import cx from 'classnames';
import moment from 'moment';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';

import Badge from '../../components/badge';
import Icon from '../../components/icon';
import { FIELD_TYPES, getFieldType } from './utils';

class LocationField extends Component {
  constructor() {
    super();
    this.navigateToFieldForm = this.navigateToFieldForm.bind(this);
  }

  navigateToFieldForm() {
    const { locationId, navigateToLocation } = this.props;
    this.props.history.push(`/location/${locationId}/${navigateToLocation}`);
  }

  render() {
    const { title, updatedAt } = this.props;

    const fieldType = getFieldType(updatedAt);
    const classNames = {
      field: cx('LocationField border-top border-bottom'),
      emptyDot: cx('rounded-circle mr-2', {
        'bg-success': fieldType === FIELD_TYPES.SUCCESS,
        'bg-warning': fieldType === FIELD_TYPES.WARNING,
        'bg-danger': fieldType === FIELD_TYPES.DANGER || fieldType === FIELD_TYPES.MISSING,
      }),
      updatedAt: cx('font-weight-light', {
        'text-uppercase text-danger font-weight-bold': fieldType === FIELD_TYPES.MISSING,
      }),
    };

    const shouldVerify = fieldType === FIELD_TYPES.DANGER || fieldType === FIELD_TYPES.WARNING;
    const isMissing = fieldType === FIELD_TYPES.MISSING;

    const timeAgoText = !isMissing ? moment(updatedAt).fromNow() : 'Missing info. Please add!';
    const updatedAtText = shouldVerify ? `${timeAgoText}. Please verify.` : timeAgoText;

    return (
      <div className={classNames.field} onClick={this.navigateToFieldForm}>
        <div className="container p-4 text-left">
          <div className="row d-flex justify-content-between align-items-center">
            <div className="d-flex flex-column">
              <h5 className="font-weight-light mb-1">{title}</h5>
              <div className="d-flex">
                <Badge>
                  <div className={classNames.emptyDot} style={{ height: '10px', width: '10px' }} />
                  <small className={classNames.updatedAt}>{updatedAtText}</small>
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
