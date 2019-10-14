import React from 'react';
import Modal from '../../../../components/modal';
import Info from '../../../../components/info';
import Header from '../../../../components/header';
import Button from '../../../../components/button';
import Icon from '../../../../components/icon';

const InfoModal = ({ title, text, onClose }) => (
  <Modal compact className="text-left px-5 py-4">
    <Info size="large" className="mt-4 mb-2" />
    <Header size="medium" className="mt-4">
      {title}
    </Header>
    <div className="my-4" style={{ whiteSpace: 'pre-wrap' }}>
      {text}
    </div>
    <Button onClick={onClose} secondary fluid className="mt-4 position-relative">
      <Icon
        name="check"
        style={{
          position: 'absolute',
          left: 16,
          lineHeight: 'inherit',
        }}
      />
      Got it
    </Button>
  </Modal>
);

export default InfoModal;
