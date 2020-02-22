import React, { Component } from 'react';
import OptionButtons from '../../../../../components/optionButtons';
import TgncAlert from './TgncAlert';

class GenderQuestion extends Component {
  state = { hasChosenTgnc: false };

  render() {
    const { onAnswer } = this.props;
    const { hasChosenTgnc } = this.state;

    return (
      <div>
        {hasChosenTgnc && (
          <TgncAlert
            onContinue={() => onAnswer('tgnc', { skipToEnd: true })}
            onBack={() => this.setState({ hasChosenTgnc: false })}
          />
        )}

        <OptionButtons>
          <OptionButtons.Option
            iconName="mars"
            onClick={() => onAnswer('male')}
          >
            Male
          </OptionButtons.Option>
          <OptionButtons.Option
            iconName="venus"
            onClick={() => onAnswer('female')}
          >
            Female
          </OptionButtons.Option>
          <OptionButtons.Option
            iconName="transgender"
            onClick={() => this.setState({ hasChosenTgnc: true })}
          >
            TGNC
          </OptionButtons.Option>
        </OptionButtons>
      </div>
    );
  }
}

export default GenderQuestion;
