import React, { Component } from 'react';
import InputMask from 'react-input-mask';
import Button from '../../../../components/button';

class ZipCodeForm extends Component {
  constructor(props) {
    super(props);

    this.state = {
      showForm: this.props.zip === '',
      zipCode: this.props.zip,
    };

    this.onSubmit = this.onSubmit.bind(this);
    this.enableForm = this.enableForm.bind(this);
    this.onChangeZipCode = this.onChangeZipCode.bind(this);
  }

  onSubmit(e) {
    e.preventDefault();

    this.props.onUpdate(this.state.zipCode);

    this.setState({
      showForm: false,
    });
  }

  onChangeZipCode(e) {
    const zipCode = e.target.value;

    this.setState({
      zipCode,
    });
  }

  enableForm() {
    if (this.state.showForm) {
      return;
    }

    this.setState({
      showForm: true,
    });
  }

  render() {
    const { showForm } = this.state;

    return (
      <form className="Zipcode-Form" onSubmit={this.onSubmit}>
        <InputMask
          onChange={this.onChangeZipCode}
          value={this.state.zipCode}
          className="Input-fluid"
          mask="99999"
          maskChar="_"
          alwaysShowMask
          onFocus={this.enableForm}
        />

        { showForm &&
        <>
          <Button
            primary
            className="mt-3 mb-3"
            onClick={this.onSubmit}
            disabled={this.state.zipCode.length !== 5}
          >
            OK
          </Button>

          <Button
            secondary
            className="mt-3 mb-3"
            onClick={this.props.onDelete}
          >
            Delete
          </Button>
        </>
        }
      </form>
    );
  }
}

export default ZipCodeForm;
