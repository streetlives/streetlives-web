import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';

import { getPhoneNumber } from '../../../../selectors/location';
import { updatePhone, createPhone } from '../../../../actions';

import Header from '../../../../components/header';
import Input from '../../../../components/input';
import Button from '../../../../components/button';

const convertToPackagePhoneFormat = input => (input ? `${input.replace(/\./g, '')}` : '');
const convertToOurFormat = input => (input ? `${input.slice(0, 3)}.${input.slice(3, 6)}.${input.slice(6)}` : '');
const validPhoneNumberLength = input => input.length === 12;

class LocationNumberEdit extends Component {
  constructor(props) {
    super(props);
    this.state = {
      extension: '',
      type: '',
      phoneNumber: '',
      newPhoneNumber: '',
      invalidNumber: false,
    };
  }

  static getDerivedStateFromProps(props, state) {
    if (props.phone && props.phone.number !== state.phoneNumber) {
      return {
        extension: (props.phone && props.phone.extension) || '',
        type: (props.phone && props.phone.type) || '',
        phoneNumber: props.phone && props.phone.number,
      };
    }

    return null;
  }

  onCancel = () => {
    this.props.onDone();
  }

  onSubmit = (e) => {
    e.preventDefault();

    const newPhoneNumber = this.state.newPhoneNumber ? this.state.newPhoneNumber : this.state.phoneNumber;

    if (!validPhoneNumberLength(newPhoneNumber)) {
      this.setState({ invalidNumber: true });
      return;
    }

    const params = {
      number: newPhoneNumber,
      extension: parseInt(this.state.extension, 10) || null,
    };

    if (this.state.type) {
      params.type = this.state.type;
    }

    this.props.updateValue(
      params,
      this.props.match.params.phoneId,
    );

    this.props.onDone();
  }

  render() {
    return (
      <form
        className="container"
        onSubmit={this.onSubmit}
      >
        <Header>What&apos;s this location&apos;s phone number?</Header>
        <div className="phone-wrapper">
          <PhoneInput
            country="us"
            disableCountryCode
            disableDropdown
            onlyCountries={['us']}
            value={convertToPackagePhoneFormat(this.state.phoneNumber)}
            placeholder="(111) 111-1111"
            limitMaxLength
            onChange={(newNumber) => {
              this.setState({ newPhoneNumber: convertToOurFormat(newNumber) });
            }}
          />
          &nbsp;-&nbsp;
          <Input
            onFocus={this.props.onInputFocus}
            onBlur={this.props.onInputBlur}
            type="tel"
            size="4"
            value={this.state.extension}
            onChange={e => this.setState({ extension: e.target.value })}
          />
        </div>
        <Input
          placeholder="Type (e.g. Main Office, Hotline, Spanish, etc)"
          fluid
          value={this.state.type}
          onChange={e => this.setState({ type: e.target.value })}
        />
        <div>
          {this.state.invalidNumber ? <h5 className="invalid-number-warning">Please enter a valid phone number</h5> : ''}
        </div>
        <div>
          <input type="submit" className="Button Button-primary mt-3" value="OK" />&nbsp;
          <Button onClick={this.onCancel} basic primary className="mt-3">
            CANCEL
          </Button>
        </div>
      </form>
    );
  }
}

const mapStateToProps = (state, ownProps) => ({
  phone: getPhoneNumber(state, ownProps),
});

const mapDispatchToProps = (dispatch, ownProps) => ({
  updateValue: (params, phoneId) =>
    dispatch((phoneId ? updatePhone : createPhone)(
      ownProps.match.params.locationId,
      phoneId,
      params,
      'location',
      'phones',
    )),
});

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(LocationNumberEdit));
