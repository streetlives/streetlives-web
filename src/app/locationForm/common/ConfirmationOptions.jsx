import React from 'react';
import PropTypes from 'prop-types';
import Button from '../../../components/button';

function ConfirmationOptions(props) {
  return (
    <div>
      <div>
        <Button onClick={props.onConfirm} primary fluid className="mt-2">
          YES
        </Button>
      </div>
      <div>
        <Button onClick={props.onEdit} primary basic fluid className="mt-2">
          NO, LET&apos;S EDIT IT
        </Button>
      </div>
    </div>
  );
}

ConfirmationOptions.propTypes = {
  onConfirm: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
};

export default ConfirmationOptions;
