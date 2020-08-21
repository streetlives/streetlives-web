import React, { Component } from 'react';
import cx from 'classnames';
import './Input.css';

class Input extends Component {
  constructor(props) {
    super(props);
    this.handleInput = this.handleInput.bind(this);
  }

  handleInput() {
    // https://stackoverflow.com/a/7358489
    // validate with js
    if (!this.props.pattern || !this.props.customValidationMessage) return;
    if (this.element.value.match(new RegExp(this.props.pattern))) {
      this.element.setCustomValidity('');
    } else {
      this.element.setCustomValidity(this.props.customValidationMessage);
    }
  }

  render() {
    const {
      type = 'text',
      checked,
      disabled,
      fluid,
      placeholder,
      name,
      onChange,
      defaultValue,
      value,
      size,
      pattern,
      required,
      tabIndex,
      autoCorrect,
      autoCapitalize,
      autoComplete,
      onFocus,
      onBlur,
      onKeyPress,
      innerRef,
      id
    } = this.props;

    const classNames = cx('Input', {
      'Input-fluid': fluid,
    });

    return (
      <input
        onInput={this.handleInput}
        ref={(e) => {
          this.element = e;
          if (innerRef) {
            innerRef(e);
          }
        }}
        checked={checked}
        disabled={disabled}
        value={value}
        className={classNames}
        type={type}
        placeholder={placeholder}
        name={name}
        onChange={onChange}
        defaultValue={defaultValue}
        size={size}
        pattern={pattern}
        required={required}
        tabIndex={tabIndex}
        autoCorrect={autoCorrect}
        autoCapitalize={autoCapitalize}
        autoComplete={autoComplete}
        onFocus={onFocus}
        onBlur={onBlur}
        onKeyPress={onKeyPress}
        id={id}
      />
    );
  }
}

export default Input;
