import React, { Component } from 'react';
import Header from '../../../../components/header';
import Selector from '../../../../components/selector';
import Info from '../../../../components/info';
import InfoModal from './InfoModal';
import './filters.css';

class FilterSelector extends Component {
  state = {
    isShowingExplanation: false,
  };

  toggleExplanation = () =>
    this.setState({ isShowingExplanation: !this.state.isShowingExplanation });

  renderOption = (option) => {
    const {
      multiselect,
      onSelect,
      selectedOption,
    } = this.props;

    let isActive;
    if (selectedOption == null) {
      isActive = option.value == null;
    } else if (multiselect) {
      isActive = selectedOption.some(selected => selected.value === option.value);
    } else {
      isActive = selectedOption.value === option.value;
    }

    const onClick = () => {
      if (option.value == null) {
        return onSelect(null);
      }

      if (!multiselect) {
        return onSelect(option);
      }

      if (isActive) {
        return onSelect(selectedOption.length === 1
          ? null
          : selectedOption.filter(selected => selected.value !== option.value));
      }

      return onSelect([...(selectedOption || []), option]);
    };

    return (
      <Selector.Option
        key={option.label}
        onClick={onClick}
        active={isActive}
        disablePadding={!multiselect}
        disableCheckmark={!multiselect}
        round={multiselect}
        align="center"
      >
        {option.label}
      </Selector.Option>
    );
  }

  render() {
    const {
      title,
      options,
      explanation,
      multiselect,
    } = this.props;

    return (
      <div>
        {this.state.isShowingExplanation && (
          <InfoModal title={title} text={explanation} onClose={this.toggleExplanation} />
        )}
        <div className="pl-2 d-flex justify-content-between align-items-end">
          <Header size="medium" className="filtersHeader">
            {title}
          </Header>
          {(explanation != null) && (
            <Info
              solid
              size="small"
              className="mb-1"
              onClick={this.toggleExplanation}
            />
          )}
        </div>
        <Selector fluid={!multiselect} direction="row">
          {options.map(this.renderOption)}
        </Selector>
      </div>
    );
  }
}

export default FilterSelector;
