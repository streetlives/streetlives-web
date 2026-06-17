import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';

import { getPhoneNumber } from '../../../../selectors/location';
import { updatePhone, createPhone } from '../../../../actions';
import {
  PHONE_USE,
  PHONE_USE_OPTIONS,
  isValidPhoneNumberForUse,
  normalizePhoneDigits,
  normalizePhoneUse,
  phoneCanHaveExtension,
  phoneUseToTypeLabel,
} from '../../../../utils/phones';

import Header from '../../../../components/header';
import Input from '../../../../components/input';
import Button from '../../../../components/button';

const getPhoneLabel = (phone) => {
  const phoneUse = normalizePhoneUse(phone && phone.type);

  if (phoneUse === PHONE_USE.PHONE) {
    return phone && phone.type && phone.type !== phoneUseToTypeLabel(PHONE_USE.PHONE)
      ? phone.type
      : '';
  }

  return '';
};

class LocationNumberEdit extends Component {
  constructor(props) {
    super(props);
    this.state = {
      extension: '',
      type: '',
      phoneUse: PHONE_USE.PHONE,
      phoneNumber: '',
      newPhoneNumber: '',
      loadedPhoneId: null,
      loadedPhoneNumber: null,
      invalidNumber: false,
    };
  }

  static getDerivedStateFromProps(props, state) {
    if (
      props.phone &&
      (
        props.phone.id !== state.loadedPhoneId ||
        props.phone.number !== state.loadedPhoneNumber
      )
    ) {
      const phoneUse = normalizePhoneUse(props.phone.type);

      return {
        extension: phoneCanHaveExtension(phoneUse) ? props.phone.extension || '' : '',
        type: getPhoneLabel(props.phone),
        phoneUse,
        phoneNumber: normalizePhoneDigits(props.phone.number),
        newPhoneNumber: '',
        loadedPhoneId: props.phone.id,
        loadedPhoneNumber: props.phone.number,
      };
    }

    return null;
  }

  onCancel = () => {
    this.props.onDone();
  }

  onSubmit = (e) => {
    e.preventDefault();

    const phoneNumberInput = this.state.newPhoneNumber || this.state.phoneNumber;
    const newPhoneNumber = normalizePhoneDigits(phoneNumberInput);

    if (!isValidPhoneNumberForUse(newPhoneNumber, this.state.phoneUse)) {
      this.setState({ invalidNumber: true });
      return;
    }

    const canHaveExtension = phoneCanHaveExtension(this.state.phoneUse);
    const type = this.state.phoneUse === PHONE_USE.PHONE
      ? this.state.type || phoneUseToTypeLabel(PHONE_USE.PHONE)
      : phoneUseToTypeLabel(this.state.phoneUse);
    const params = {
      number: newPhoneNumber,
      extension: canHaveExtension ? parseInt(this.state.extension, 10) || null : null,
      type,
    };

    this.props.updateValue(
      params,
      this.props.match.params.phoneId,
    );

    this.props.onDone();
  }

  render() {
    const canHaveExtension = phoneCanHaveExtension(this.state.phoneUse);
    const phoneNumber = this.state.newPhoneNumber || this.state.phoneNumber;

    return (
      <form
        className="container"
        onSubmit={this.onSubmit}
      >
        <Header>What&apos;s this location&apos;s phone number?</Header>
        <select
          className="Input Input-fluid mb-3"
          value={this.state.phoneUse}
          onChange={(e) => {
            const phoneUse = e.target.value;
            this.setState({
              phoneUse,
              extension: phoneCanHaveExtension(phoneUse) ? this.state.extension : '',
              invalidNumber: false,
            });
          }}
        >
          {PHONE_USE_OPTIONS.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <div className="phone-wrapper">
          <Input
            onFocus={this.props.onInputFocus}
            onBlur={this.props.onInputBlur}
            type="tel"
            value={phoneNumber}
            placeholder="7185551212 or 988"
            fluid
            onChange={(e) => {
              this.setState({
                newPhoneNumber: normalizePhoneDigits(e.target.value),
                invalidNumber: false,
              });
            }}
          />
          {canHaveExtension && (
            <>
              &nbsp;-&nbsp;
              <Input
                onFocus={this.props.onInputFocus}
                onBlur={this.props.onInputBlur}
                type="tel"
                size="4"
                value={this.state.extension}
                placeholder="Ext"
                onChange={e => this.setState({ extension: e.target.value })}
              />
            </>
          )}
        </div>
        {this.state.phoneUse === PHONE_USE.PHONE && (
          <Input
            placeholder="Label (e.g. Main Office, Hotline, Spanish, etc)"
            fluid
            value={this.state.type}
            onChange={e => this.setState({ type: e.target.value })}
          />
        )}
        <div>
          {this.state.invalidNumber ? (
            <h5 className="invalid-number-warning">
              Please enter 3 to 10 digits. WhatsApp numbers need 10 digits.
            </h5>
          ) : ''}
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
