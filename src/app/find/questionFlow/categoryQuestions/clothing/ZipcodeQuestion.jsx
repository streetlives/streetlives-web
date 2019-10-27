import React, { Component } from 'react';
import ZipcodeInput from '../../../../../components/zipcodeInput';
import Button from '../../../../../components/button';
import OptionButtons from '../../../../../components/optionButtons';

class ZipcodeQuestion extends Component {
  state = {
    zipcodeDigits: this.props.value || '',
    isZipcodeValid: !!this.props.value,
  };

  setZipcode = ({ value, isValid }) => this.setState({
    zipcodeDigits: value,
    isZipcodeValid: isValid,
  });


  submit = () => this.props.onAnswer(this.state.zipcodeDigits);

  render() {
    const { isZipcodeValid, zipcodeDigits } = this.state;
    const { value, onAnswer } = this.props;

    return (
      <div>
        <div className="mb-2 d-flex align-items-stretch">
          <ZipcodeInput
            value={zipcodeDigits}
            onChange={this.setZipcode}
            className="flex-grow-1 mr-2"
          />
          <Button
            primary
            disabled={!isZipcodeValid}
            onClick={this.submit}
          >
            Done
          </Button>
        </div>
        <OptionButtons>
          <OptionButtons.Option
            iconName="times"
            onClick={() => onAnswer(null)}
            active={value === null}
          >
            Can’t provide ZIP at the moment
          </OptionButtons.Option>
        </OptionButtons>
      </div>
    );
  }
}

export default ZipcodeQuestion;
