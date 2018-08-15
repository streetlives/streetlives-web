import React from 'react';
import PropTypes from 'prop-types';
import ServiceOpeningHoursEdit from './ServiceOpeningHoursEdit';
import ConfirmationOptions from '../../../components/form/ConfirmationOptions';
import { formatLabel } from './util'

function FormView(props) {
  return (
    <div className="w-100">
      <div style={{ fontSize: '13px', marginBottom: '1em' }} className="font-weight-bold mt-2">
        Groups and ages served
      </div>
      <ul>
        {
          Object.keys(props.value).map( (key, i) => <li key={key}>{ formatLabel(key, props.value[key].minAge, props.value[key].maxAge) }</li>)
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
