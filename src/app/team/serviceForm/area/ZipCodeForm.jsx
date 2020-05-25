import React, { Component, createRef } from 'react';
import InputMask from 'react-input-mask';
import Button from '../../../../components/button';

class ZipCodeForm extends Component {
  constructor(props) {
    super(props);

    this.state = {
      showForm: this.props.zip === '',
    };

    this.inputRef = createRef();

    this.onSubmit = this.onSubmit.bind(this);
    this.enableForm = this.enableForm.bind(this);
  }

  componentDidMount() {
    if (this.state.showForm) {
      this.inputRef.focus();
    }
  }

  onSubmit(e) {
    e.preventDefault();

    const zipCode = this.inputRef.value;

    this.props.onUpdate(zipCode);

    this.setState({
      showForm: false,
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
          inputRef={(ref) => { this.inputRef = ref; }}
          defaultValue={this.props.zip}
          className="Input-fluid"
          mask="99999"
          maskChar="_"
          alwaysShowMask
          onFocus={this.enableForm}
          onBlur={this.onSubmit}
        />

        { showForm &&
        <>
          <Button
            primary
            className="mt-3 mb-3"
            onClick={this.onSubmit}
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
