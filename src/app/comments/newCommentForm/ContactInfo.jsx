import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Header from '../../../components/header';
import Button from '../../../components/button';
import Input from '../../../components/input';
import LinkButton from '../../../components/link';

const FOCUS = {
  NONE: 'NONE',
  CONTACT: 'CONTACT',
  NAME: 'NAME',
};

class ContactInfo extends Component {
  constructor(props) {
    super(props);
    this.state = {
      focus: FOCUS.NONE,
      contact: '',
      name: '',
    };

    this.onContactFocused = this.onContactFocused.bind(this);
    this.onNameFocused = this.onNameFocused.bind(this);

    this.onContactChanged = this.onContactChanged.bind(this);
    this.onNameChanged = this.onNameChanged.bind(this);

    this.setContactRef = this.setContactRef.bind(this);
    this.setNameRef = this.setNameRef.bind(this);

    this.cancelContact = this.cancelContact.bind(this);
    this.cancelName = this.cancelName.bind(this);
    this.proceedToName = this.proceedToName.bind(this);
    this.submit = this.submit.bind(this);
    this.skip = this.skip.bind(this);
  }

  onContactFocused() {
    this.setState({ focus: FOCUS.CONTACT });
  }

  onNameFocused() {
    this.setState({ focus: FOCUS.NAME });
  }

  onContactChanged(event) {
    this.setState({ contact: event.target.value });
  }

  onNameChanged(event) {
    this.setState({ name: event.target.value });
  }

  setContactRef(ref) {
    this.contactInput = ref;
  }

  setNameRef(ref) {
    this.nameInput = ref;
  }

  cancelContact() {
    this.setState({ contact: '', focus: FOCUS.NONE });
  }

  cancelName() {
    this.setState({ name: '' });
    this.contactInput.focus();
  }

  proceedToName() {
    this.nameInput.focus();
  }

  submit() {
    const { contact, name } = this.state;

    const info = {};
    if (contact) {
      info.contact = contact;
    }
    if (name) {
      info.name = name;
    }

    this.props.onSubmit(info);
  }

  skip() {
    this.props.onSubmit({});
  }

  render() {
    let bottomButtons;
    switch (this.state.focus) {
      case FOCUS.CONTACT:
        bottomButtons = (
          <div className="d-flex">
            <span className="flex-grow-1">
              <Button primary basic fluid onClick={this.cancelContact}>CANCEL</Button>
            </span>
            <span className="flex-grow-1">
              <Button primary fluid onClick={this.proceedToName}>NEXT</Button>
            </span>
          </div>
        );
        break;

      case FOCUS.NAME:
        bottomButtons = (
          <div className="d-flex">
            <span className="flex-grow-1">
              <Button primary basic fluid onClick={this.cancelName}>CANCEL</Button>
            </span>
            <span className="flex-grow-1">
              <Button primary fluid onClick={this.submit}>DONE</Button>
            </span>
          </div>
        );
        break;

      default:
        bottomButtons = (
          <LinkButton onClick={this.skip}>
            Skip this step
          </LinkButton>
        );
        break;
    }

    return (
      <div>
        <div className="ml-5 mb-5 pb-5 text-left">
          <div className="mr-5">
            <Header size="large">One last optional step</Header>
            <Header size="small" className="mb-5">
              Tell us who you are if you’d like to be involved more in this project.
            </Header>
          </div>
          <Header size="medium">Email / Phone number</Header>
          <div>
            <Input
              fluid
              onFocus={this.onContactFocused}
              onChange={this.onContactChanged}
              placeholder="Enter your email or phone number"
              value={this.state.contact}
              innerRef={this.setContactRef}
            />
          </div>
          <Header size="medium">Name</Header>
          <div>
            <Input
              fluid
              onFocus={this.onNameFocused}
              onChange={this.onNameChanged}
              placeholder="Enter your full name"
              value={this.state.name}
              innerRef={this.setNameRef}
            />
          </div>
        </div>
        <div className="w-100 position-fixed" style={{ bottom: 0 }}>
          {bottomButtons}
        </div>
      </div>
    );
  }
}

ContactInfo.propTypes = {
  onSubmit: PropTypes.func.isRequired,
};

export default ContactInfo;
