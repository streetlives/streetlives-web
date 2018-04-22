import React from 'react';
import PropTypes from 'prop-types';
import ConfirmationOptions from './ConfirmationOptions';
import Header from '../../../components/header';

function FormView(props) {
  return (
    <div>
      <div style={{ fontSize: '13px' }} className="font-weight-bold mt-2">
        {props.topText}
      </div>
      <Header>{props.value}</Header>
      <ConfirmationOptions onConfirm={props.onConfirm} onEdit={props.onEdit} />
    </div>
  );
}

FormView.propTypes = {
  topText: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  onConfirm: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
};

export default FormView;

