import React from 'react';
import Header from '../../../components/header';
import Button from '../../../components/button';
import Icon from '../../../components/icon';
import { getCategoryIcon } from '../../../services/iconography';

const Prompt = ({ categoryName, onConfirm, onSkip }) => (
  <div>
    <Icon size="3x" name={getCategoryIcon(categoryName)} />
    <Header size="medium" className="mt-4">
      Do you want to answer a few questions and
      find places for {categoryName.toLowerCase()} just right for you?
    </Header>
    <div className="p-3 mx-2 fixed-bottom">
      <Button onClick={onConfirm} primary fluid className="position-relative">
        <Icon
          name="check"
          style={{
            position: 'absolute',
            left: 16,
            lineHeight: 'inherit',
          }}
        />
        Answer
      </Button>
      <Button onClick={onSkip} secondary fluid className="mt-2 position-relative">
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
    </div>
  </div>
);

export default Prompt;
