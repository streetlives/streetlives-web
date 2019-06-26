import React from 'react';
import Header from '../../../../components/header';
import Selector from '../../../../components/selector';

const FilterSelector = ({
  title,
  options,
  onSelect,
  selectedValue,
}) => (
  <div>
    <Header size="medium" className="text-left px-2">
      {title}
    </Header>
    <Selector fluid direction="row">
      {options.map(option => (
        <Selector.Option
          key={option.label}
          onClick={() => onSelect(option.value)}
          active={selectedValue === option.value}
          disablePadding
          disableCheckmark
          align="center"
        >
          {option.label}
        </Selector.Option>
      ))}
    </Selector>
  </div>
);

export default FilterSelector;
