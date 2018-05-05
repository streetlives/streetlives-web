import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Header from '../../../components/header';
import Button from '../../../components/button';
import Input from '../../../components/input';

class FormEdit extends Component {
  constructor(props) {
    super(props);
    this.state = { value: props.value };
    this.onSubmit = this.onSubmit.bind(this);
    this.onChange = this.onChange.bind(this);
  }

  onChange(event) {
    this.setState({ value: event.target.value });
  }

  onSubmit() {
    this.props.updateValue(this.state.value, this.props.id);
    this.props.onSubmit();
  }

  render() {
    return (
      <div>
        <Header>{this.props.headerText}</Header>
        <Input
          fluid
          placeholder={this.props.placeholderText}
          defaultValue={this.props.value}
          onChange={this.onChange}
        />
        <Button onClick={this.onSubmit} primary className="mt-3">
          OK
        </Button>&nbsp;
        <Button onClick={this.props.onCancel} basic primary className="mt-3">
          CANCEL
        </Button>
      </div>
    );
  }
}

FormEdit.propTypes = {
  value: PropTypes.string,
  headerText : PropTypes.string.isRequired,
  placeholderText : PropTypes.string.isRequired,
  onSubmit: PropTypes.func.isRequired,
  updateValue: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired
};
FormEdit.defaultProps = {
  value: '',
};

export default FormEdit;

