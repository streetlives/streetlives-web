import React from 'react';
import PropTypes from 'prop-types';

import Selector from '../../../../components/selector';
import ConfirmationOptions from '../../../../components/form/ConfirmationOptions';

function ProofsRequiredView({ value, onConfirm, onEdit }) {
  return (
    <div className="w-100">
      <div style={{ fontSize: '13px', marginBottom: '1em' }} className="font-weight-bold mt-2">
        What proofs are required to use this service?
      </div>

      <Selector fluid>
        {
          value.map(document => (
            <Selector.Option
              key={`selector-${document}`}
              active
              hide={false}
            >
              {document}
            </Selector.Option>
          ))
        }
      </Selector>
      <ConfirmationOptions onConfirm={onConfirm} onEdit={onEdit} />
    </div>
  );
}

ProofsRequiredView.propTypes = {
  value: PropTypes.arrayOf(PropTypes.shape),
  onConfirm: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
};

export default ProofsRequiredView;
