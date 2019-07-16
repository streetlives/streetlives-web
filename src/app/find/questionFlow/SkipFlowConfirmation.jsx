import React from 'react';
import Modal from '../../../components/modal';
import Header from '../../../components/header';
import Button from '../../../components/button';
import Icon from '../../../components/icon';

const SkipFlowConfirmation = ({ onSkip, onAnswer }) => (
  <Modal compact className="text-left px-5 py-4">
    <Icon size="3x" name="exclamation-triangle" className="mt-4 mb-2" />
    <Header size="medium" className="mt-4">
      Are you sure you want to skip all questions?
    </Header>
    <div className="my-4">
      If you skip these few questions, you have a higher risk of spending time and money
      getting to providers that won’t be able to help you.
    </div>
    <Button onClick={onAnswer} primary fluid className="mt-4 position-relative">
      <Icon
        name="check"
        style={{
          position: 'absolute',
          left: 16,
          lineHeight: 'inherit',
        }}
      />
      Answer questions
    </Button>
    <Button onClick={onSkip} secondary fluid className="mt-4 position-relative">
      <Icon
        name="times"
        style={{
          position: 'absolute',
          left: 16,
          lineHeight: 'inherit',
        }}
      />
      Skip
    </Button>

  </Modal>
);

export default SkipFlowConfirmation;
