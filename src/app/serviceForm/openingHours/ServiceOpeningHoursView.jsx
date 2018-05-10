import React from 'react';
import PropTypes from 'prop-types';
import ServiceOpeningHoursEdit from './ServiceOpeningHoursEdit';
import ConfirmationOptions from '../../../components/form/ConfirmationOptions';

function FormView(props) {
  return (
    <div className="w-100">
      <div style={{ fontSize: '13px', marginBottom: '1em' }} className="font-weight-bold mt-2">
        {props.topText}
      </div>
      <ServiceOpeningHoursEdit viewMode={true} {...props} />
      <ConfirmationOptions onConfirm={props.onConfirm} onEdit={props.onEdit} />
    </div>
  );
}

FormView.propTypes = {
  topText: PropTypes.string.isRequired,
  value: PropTypes.array.isRequired,
  onConfirm: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
};

export default FormView;
