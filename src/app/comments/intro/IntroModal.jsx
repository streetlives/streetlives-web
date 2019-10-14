import React from 'react';
import Modal from '../../../components/modal';
import IntroComponent from './IntroComponent';

function IntroModal({ name, onDismiss }) {
  return (
    <Modal>
      <IntroComponent
        name={name}
        footer={(
          <small>
            Certain comments may be removed at {name}’s discretion
          </small>
        )}
        buttonText="GOT IT"
        onClick={onDismiss}
      />
    </Modal>
  );
}

export default IntroModal;
