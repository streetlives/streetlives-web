import React from 'react';
import Modal from '../../../components/modal';
import Header from '../../../components/header';
import Button from '../../../components/button';
import Icon from '../../../components/icon';

const QuitFlowConfirmation = ({ onQuit, onClose }) => (
  <Modal compact className="text-left px-5 py-4">
    <Icon size="3x" name="exclamation-triangle" className="mt-4 mb-2" />
    <Header size="medium" className="mt-4">
      Are you sure you want to quit your search?
    </Header>
    <Button onClick={onClose} primary fluid className="mt-4 position-relative">
      <Icon
        name="check"
        style={{
          position: 'absolute',
          left: 16,
          lineHeight: 'inherit',
        }}
      />
      No, let’s continue
    </Button>
    <Button onClick={onQuit} secondary fluid className="mt-4 position-relative">
      <Icon
        name="times"
        style={{
          position: 'absolute',
          left: 16,
          lineHeight: 'inherit',
        }}
      />
      Yes, I want to quit
    </Button>
  </Modal>
);

export default QuitFlowConfirmation;
