import React from 'react';
import './OptionButtons.css';

import OptionButton from './optionButton/OptionButton';

function OptionButtons({ children }) {
  return <div className="OptionButtons">{children}</div>;
}

OptionButtons.Option = OptionButton;

export default OptionButtons;
