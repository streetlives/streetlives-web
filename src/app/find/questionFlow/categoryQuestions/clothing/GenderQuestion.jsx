import React from 'react';
import OptionButtons from '../../../../../components/optionButtons';

export default ({ value, onAnswer }) => (
  <div>
    <OptionButtons>
      <OptionButtons.Option
        iconName="male"
        active={value === 'male'}
        onClick={() => onAnswer('male')}
      >
        Male
      </OptionButtons.Option>
      <OptionButtons.Option
        iconName="female"
        active={value === 'female'}
        onClick={() => onAnswer('female')}
      >
        Female
      </OptionButtons.Option>
    </OptionButtons>
    <div className="explanationText">
      We apologize to those looking for a non-binary gender service.
      At this time most providers are only offering clothing closets for either
      male or female gender identities.
    </div>
  </div>
);
