import React from 'react';
import OptionButtons from '../../../../../components/optionButtons';

export default ({ value, onAnswer }) => (
  <OptionButtons>
    <OptionButtons.Option
      iconName="user"
      onClick={() => onAnswer('adults')}
    >
      Only me
    </OptionButtons.Option>
    <OptionButtons.Option
      iconName="users"
      onClick={() => onAnswer(null, { nextParam: 'photoId' })}
    >
      Me and my kid(s)
    </OptionButtons.Option>
    <OptionButtons.Option
      iconName="child"
      onClick={() => onAnswer('children', { nextParam: 'photoId' })}
    >
      Only my kid(s)
    </OptionButtons.Option>
  </OptionButtons>
);
