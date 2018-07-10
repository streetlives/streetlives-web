import React, { Component } from 'react';
import Header from '../../../components/header';
import Input from '../../../components/input';
import Button from '../../../components/button';

export default class LocationNumberEdit extends Component {
  constructor(props) {
    super(props);

    const [areaCode, firstThree, lastFour] =
      props.value && props.value.number ? props.value.number.split('.') : ['', '', ''];
    this.state = {
      areaCode,
      firstThree,
      lastFour,
      extension: (props.value && props.value.extension) || '',
    };

    this.keyToMaxDigits = {
      areaCode: 3,
      firstThree: 3,
      lastFour: 4,
    };

    this.onSubmit = this.onSubmit.bind(this);
    Object.keys(this.state).forEach((k) => {
      this[`onChange_${k}`] = this.onChange.bind(this, k);
    });
  }

  onChange(key, event) {
    let { value } = event.target;
    const maxLength = this.keyToMaxDigits[key];
    value = value.length > maxLength ? value.slice(0, maxLength) : value; // truncate
    this.setState({ [key]: value });
  }

  onSubmit(e) {
    e.preventDefault();
    const number = [this.state.areaCode, this.state.firstThree, this.state.lastFour].join('.');
    this.props.updateValue(
      {
        number,
        extension: this.state.extension || null,
      },
      this.props.id,
      this.props.metaDataSection,
      this.props.fieldName,
    );
    this.props.onSubmit(number);
  }

  render() {
    return (
      <form
        ref={(e) => {
          this.form = e;
        }}
        className="container"
        onSubmit={this.onSubmit}
      >
        <Header>What&apos;s this location&apos;s phone number?</Header>
        (<Input
          onFocus={this.props.onInputFocus}
          onBlur={this.props.onInputBlur}
          customValidationMessage="Area code must contain three digits"
          type="tel"
          value={this.state.areaCode}
          onChange={this.onChange_areaCode}
          pattern="\d{3}"
          size="3"
          required
        />)&nbsp;-&nbsp;
        <Input
          onFocus={this.props.onInputFocus}
          onBlur={this.props.onInputBlur}
          customValidationMessage="Enter first three digits for phone number"
          type="tel"
          value={this.state.firstThree}
          onChange={this.onChange_firstThree}
          size="3"
          pattern="\d{3}"
          required
        />&nbsp;-&nbsp;
        <Input
          onFocus={this.props.onInputFocus}
          onBlur={this.props.onInputBlur}
          customValidationMessage="Enter last four digits for phone number"
          type="tel"
          value={this.state.lastFour}
          onChange={this.onChange_lastFour}
          pattern="\d{4}"
          required
          size="4"
        />&nbsp;ext.&nbsp;
        <Input
          onFocus={this.props.onInputFocus}
          onBlur={this.props.onInputBlur}
          type="tel"
          size="4"
          value={this.state.extension}
          onChange={this.onChange_extension}
        />
        <div>
          <input type="submit" className="Button Button-primary mt-3" value="OK" />&nbsp;
          <Button onClick={this.props.onCancel} basic primary className="mt-3">
            CANCEL
          </Button>
        </div>
      </form>
    );
  }
}
