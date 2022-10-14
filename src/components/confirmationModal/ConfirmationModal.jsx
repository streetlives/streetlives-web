import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Modal from '../modal';
import Header from '../header';
import Button from '../button';
import Input from '../input';

const highRiskConfirmationText = 'yes';

function ConfirmationModal({
  confirmText,
  cancelText,
  headerText,
  onConfirm,
  onCancel,
  isHighRisk,
}) {
  const [inputText, setInputText] = useState('');
  const canConfirm = () => !isHighRisk ||
    inputText.toLowerCase() === highRiskConfirmationText.toLowerCase();

  return (
    <Modal>
      <Header size="" className="m-4 flex-grow-1">
        { headerText }
        {isHighRisk && (
          <div className="pt-3">
            {`If you're sure, type "${highRiskConfirmationText}" below,
            then click "${confirmText}":`}
          </div>
        )}
      </Header>
      <div className="px-3">
        {isHighRisk && (
          <div className="pb-4" >
            <Input
              fluid
              placeholder={`Type ${highRiskConfirmationText} if you're sure`}
              autoComplete="off"
              onChange={e => setInputText(e.target.value)}
            />
          </div>
        )}

        <Button onClick={() => canConfirm() && onConfirm()} primary fluid disabled={!canConfirm()}>
          { confirmText }
        </Button>
        <Button onClick={onCancel} primary basic fluid className="my-2">
          { cancelText }
        </Button>
      </div>
    </Modal>
  );
}

ConfirmationModal.propTypes = {
  confirmText: PropTypes.string,
  cancelText: PropTypes.string,
  headerText: PropTypes.string,
  onConfirm: PropTypes.func,
  onCancel: PropTypes.func,
  isHighRisk: PropTypes.bool,
};

ConfirmationModal.defaultProps = {
  confirmText: 'YES',
  cancelText: 'NO',
  headerText: 'Are you sure?',
  isHighRisk: false,
};

export default ConfirmationModal;
