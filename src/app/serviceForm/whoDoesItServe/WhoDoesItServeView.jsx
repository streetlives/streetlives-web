import React from 'react';
import PropTypes from 'prop-types';
import ConfirmationOptions from '../../../components/form/ConfirmationOptions';
import { formatLabel } from './util'

function FormView(props) {
  const groupNames = Object.keys(props.value);
  return (
    <div className="w-100">
      <div style={{ fontSize: '13px', marginBottom: '1em' }} className="font-weight-bold mt-2">
        Groups and ages served
      </div>
      <ul>
        {
          groupNames.length ?
            groupNames.map( (groupName, i) => <li key={groupName}>{ formatLabel(groupName, props.value[groupName].minAge, props.value[groupName].maxAge) }</li>) :
            'None'
        }
      </ul>
      <ConfirmationOptions onConfirm={props.onConfirm} onEdit={props.onEdit} />
    </div>
  );
}

FormView.propTypes = {
  value: PropTypes.object,
  onConfirm: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
};

export default FormView;
