import React from 'react';
import Modal from '../../../../components/modal';
import Button from '../../../../components/button';
import Icon from '../../../../components/icon';
import Header from '../../../../components/header';

const FiltersModal = ({
  title,
  value,
  onSubmit,
  onClose,
  children,
}) => (
  <Modal className="pb-4">
    <div className="mx-3 mt-4 position-relative">
      <Header size="medium" className="mx-4 d-inline text-uppercase">
        {title}
      </Header>
      <Icon
        name="times"
        onClick={onClose}
        style={{
          position: 'absolute',
          right: 0,
          top: '0.2em',
        }}
      />
    </div>
    <div className="px-3 mb-5">
      {children}
    </div>
    <div className="p-3 fixed-bottom">
      <Button onClick={onSubmit} primary fluid className="position-relative">
        <Icon
          name="check"
          style={{
            position: 'absolute',
            left: 16,
            lineHeight: 'inherit',
          }}
        />
        Done
      </Button>
    </div>
  </Modal>
);

export default FiltersModal;
