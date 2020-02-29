import React from 'react';
import OptionButtons from '../../../../../components/optionButtons';

export default ({ value, onAnswer }) => (
  <OptionButtons>
    <OptionButtons.Option
      iconName="id-card"
      onClick={() => onAnswer(null)}
    >
      Have ID
    </OptionButtons.Option>
    <OptionButtons.Option
      iconName="times-circle"
      onClick={() => onAnswer(false)}
    >
      Won’t have ID
    </OptionButtons.Option>
  </OptionButtons>
);
