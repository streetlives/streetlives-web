import React from 'react';
import OptionButtons from '../../../../../components/optionButtons';

export default ({ value, onAnswer }) => (
  <OptionButtons>
    <OptionButtons.Option
      iconName="id-card"
      active={value === null}
      onClick={() => onAnswer(null)}
    >
      Have ID
    </OptionButtons.Option>
    <OptionButtons.Option
      iconName="times-circle"
      active={value === false}
      onClick={() => onAnswer(false)}
    >
      Won’t have ID
    </OptionButtons.Option>
  </OptionButtons>
);
