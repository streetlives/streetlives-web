import React from 'react';
import PropTypes from 'prop-types';
import Header from '../../../../components/header';
import Selector from '../../../../components/selector';
import ConfirmationOptions from '../../../../components/form/ConfirmationOptions'

function FormView({ value, onConfirm, onEdit }) {
  return (
    <div className="w-100">
      <Header className="mb-3">Does this service offer a TGNC affirmative experience?</Header>

      <Selector fluid>
        <Selector.Option active>
          { value === true ? 'Yes' : 'No' }
        </Selector.Option>
      </Selector>

      <ConfirmationOptions onConfirm={onConfirm} onEdit={onEdit} />
    </div>
  );
}

FormView.propTypes = {
  value: PropTypes.bool,
  onConfirm: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
};

export default FormView;
