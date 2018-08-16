import React from 'react';
import PropTypes from 'prop-types';
import ConfirmationOptions from '../../../components/form/ConfirmationOptions';
import { formatLabel } from './util'

function FormView({value, onConfirm, onEdit}) {
  return (
    <div className="w-100">
      <div style={{ fontSize: '13px', marginBottom: '1em' }} className="font-weight-bold mt-2">
        Groups and ages served
      </div>
      <ul>
        {
          value.length ?
            value.map( (group, i) => <li key={group.name}>{ formatLabel(group.name, group.minAge, group.maxAge) }</li>) :
            'None'
        }
      </ul>
      <ConfirmationOptions onConfirm={onConfirm} onEdit={onEdit} />
    </div>
  );
}

FormView.propTypes = {
  value: PropTypes.array,
  onConfirm: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
};

export default FormView;
