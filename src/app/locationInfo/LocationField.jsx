import React, { Component } from 'react';
import cx from 'classnames';
import moment from 'moment';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';

import Badge from '../../components/badge';

import './LocationField.css';

class LocationField extends Component {
  constructor() {
    super();
    this.navigateToFieldForm = this.navigateToFieldForm.bind(this);
  }

  navigateToFieldForm() {
    this.props.history.push({
      pathname: this.props.navigateToLocation,
      state: { locationId: this.props.locationId },
    });
  }

  render() {
    const { title, updatedAt, required } = this.props;

    const classNames = {
      field: cx('LocationField border-top border-bottom', { 'bg-yellow': required }),
      updatedAt: cx({
        'text-danger': updatedAt && moment(updatedAt).isSameOrBefore(moment().subtract(1, 'years')),
        'text-warning': updatedAt && moment(updatedAt).isSameOrBefore(moment()),
      }),
    };

    const updatedAtText = updatedAt ? moment(updatedAt).fromNow() : 'never';

    return (
      <div className={classNames.field} onClick={this.navigateToFieldForm}>
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
}

LocationField.propTypes = {
  title: PropTypes.string.isRequired,
  updatedAt: PropTypes.string.isRequired,
  required: PropTypes.bool,
  navigateToLocation: PropTypes.string.isRequired,
};

LocationField.defaultProps = {
  required: false,
};

export default withRouter(LocationField);
