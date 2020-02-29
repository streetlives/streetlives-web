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

  render() {
    const {
      title,
      options,
      explanation,
      onSelect,
      selectedOption,
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
        <Selector fluid direction="row">
          {options.map(option => (
            <Selector.Option
              key={option.label}
              onClick={() => (option.value != null ? onSelect(option) : onSelect(null))}
              active={selectedOption == null ?
                option.value == null :
                selectedOption.value === option.value}
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
  }
}

export default FilterSelector;
