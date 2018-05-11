import React, { Component } from 'react';
import Header from '../../../components/header';
import Button from '../../../components/button';
import Input from '../../../components/input';

class AddServiceForm extends Component {
  state = { value: '' };

  onChange = e => this.setState({ value: e.target.value });

  onSubmit = () => {
    const { category } = this.props;
    const { value } = this.state;
    this.props.onSubmit(category, value);
  };

  render() {
    const { value } = this.state;
    const { onCancel } = this.props;
    return (
      <div className="px3 container">
        <Header>What service does this location provide?</Header>
        <Input fluid value={value} placeholder="e.g. Job placement" onChange={this.onChange} />
        <Button primary className="mt-4 mr-2" disabled={value.length === 0} onClick={this.onSubmit}>
          OK
        </Button>
        <Button primary basic className="mt-4" onClick={onCancel}>
          CANCEL
        </Button>
      </div>
    );
  }
}

export default AddServiceForm;
