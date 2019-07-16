import React from 'react';
import OptionButtons from '../../../../../components/optionButtons';

export default ({ value, onAnswer }) => (
  <OptionButtons>
    <OptionButtons.Option
      iconName="user"
      active={value === 'adults'}
      onClick={() => onAnswer('adults')}
    >
      Only me
    </OptionButtons.Option>
    <OptionButtons.Option
      iconName="users"
      active={value === null}
      onClick={() => onAnswer(null)}
    >
      Me and my kid(s)
    </OptionButtons.Option>
    <OptionButtons.Option
      iconName="child"
      active={value === 'children'}
      onClick={() => onAnswer('children')}
    >
      Only my kid(s)
    </OptionButtons.Option>
  </OptionButtons>
);
