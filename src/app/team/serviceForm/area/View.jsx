import React from 'react';
import PropTypes from 'prop-types';

import { getAreaTypeLabel } from './utils';
import ConfirmationOptions from '../../../../components/form/ConfirmationOptions';

function FormView({ value: { postal_codes: postalCodes } = {}, onConfirm, onEdit }) {
  return (
    <div className="w-100">
      <div style={{ fontSize: '13px', marginBottom: '1em' }} className="font-weight-bold mt-2">
        Which area does it serve?
      </div>

      <p>{ postalCodes && getAreaTypeLabel(postalCodes) }</p>

      { postalCodes && postalCodes.length > 0 &&
      <ul>
        { postalCodes.map(name => (
          <li key={name}>{name}</li>
        )) }
      </ul>
      }
      <ConfirmationOptions onConfirm={onConfirm} onEdit={onEdit} />
    </div>
  );
}

FormView.propTypes = {
  value: PropTypes.shape({
    description: PropTypes.string.isRequired,
    postal_codes: PropTypes.arrayOf(PropTypes.string).isRequired,
  }).isRequired,
  onConfirm: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
};

export default FormView;
