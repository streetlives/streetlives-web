import React from 'react';
import moment from 'moment';
import cx from 'classnames';

import Badge from '../../../components/badge';
import { FIELD_TYPES, getFieldType } from './utils';

function UpdatedBadge({ updatedAt, value }) {
  const fieldType = getFieldType(updatedAt, value);
  const classNames = {
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

  let timeAgoText;
  if (isMissing) {
    timeAgoText = 'Missing info. Please add!';
  } else {
    timeAgoText = updatedAt ? `${moment(updatedAt).fromNow()}.` : '';
  }
  const updatedAtText = shouldVerify ? `${timeAgoText} Please verify.` : timeAgoText;

  return (
    <Badge>
      <div className={classNames.emptyDot} style={{ height: '10px', width: '10px' }} />
      <small className={classNames.updatedAt}>{updatedAtText}</small>
    </Badge>
  );
}

export default UpdatedBadge;
