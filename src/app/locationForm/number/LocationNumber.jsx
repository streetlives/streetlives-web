import React, { Component } from 'react';
import { connect } from 'react-redux';
import { selectLocationData } from '../../../reducers';
import { updatePhone } from '../../../actions';
import { getLocation } from '../../../actions';
import Form from '../common/Form';
import FormView from '../common/FormView';
import { compose, withProps } from 'recompose';
import Header from '../../../components/header';
import Button from '../../../components/button';
import Input from '../../../components/input';

class LocationNumberEdit extends Component {
  constructor(props) {
    super(props);

    const [areaCode, firstThree, lastFour] = props.value.number ? props.value.number.split('.') : ['','',''];
    this.state = {
      areaCode, 
      firstThree, 
      lastFour,
      extension : props.value.extension || ''
    };

    this.keyToMaxDigits = {
      areaCode: 3,
      firstThree: 3,
      lastFour: 4
    };

    this.onSubmit = this.onSubmit.bind(this);
    Object.keys(this.state).forEach(k => {
      this[`onChange_${k}`] = this.onChange.bind(this, k);
    });
  }

  onChange(key, event) {
    let value = event.target.value;
    const maxLength = this.keyToMaxDigits[key];
    value = value.length > maxLength ? value.slice(0, maxLength) : value;   //truncate
    this.setState({ [key]: value });
  }

  onSubmit() {
    this.props.updateValue(this.props.value.id, {
      number : [this.state.areaCode, this.state.firstThree, this.state.lastFour].join('.'),
      extension : this.state.extension
    });
    this.props.onSubmit();
  }

  render() {
    return (
      <form ref={ e => this.form = e } className="container" onSubmit={this.onSubmit}>
        <Header>What's this location's phone number?</Header>
        (<Input
          customValidationMessage="Area code must contain three digits"
          type="tel"
          defaultValue={this.state.areaCode}
          onChange={this.onChange_areaCode}
          pattern="\d{3}"
          size="3"
          required
          />)&nbsp;-&nbsp;
        <Input
          customValidationMessage="Enter first three digits for phone number"
          type="tel"
          defaultValue={this.state.firstThree}
          onChange={this.onChange_firstThree}
          size="3"
          pattern="\d{3}"
          required
          />&nbsp;-&nbsp;
        <Input
          customValidationMessage="Enter last four digits for phone number"
          type="tel"
          defaultValue={this.state.lastFour}
          onChange={this.onChange_lastFour}
          pattern="\d{4}"
          required
          size="4"
          />&nbsp;ext.&nbsp;
        <Input
          type="tel"
          size="4"
          defaultValue={this.state.extension}
          onChange={this.onChange_extension}
          />
        <input type="submit" className="Button Button-primary mt-3" value="OK"/>
      </form>
    );
  }
}

const LocationNumberView = compose(
  withProps({
    topText : 'LOCATION PHONE NUMBER',
  })
)(props => {
  const value = props.value && props.value.number && `${props.value.number.replace(/\./g,'-')}${props.value.extension ? ` ext.${props.value.extension}` : ''}`;
  const o = {...props, value};
  return <FormView {...o} />;
})

const LocationNumber = compose(
  withProps({
    viewComponent: LocationNumberView,
    editComponent: LocationNumberEdit
  })
)(props => <Form {...props} />)

const mapStateToProps = (state, ownProps) => {
  const locationId = ownProps.match.params.locationId;
  const locationData = selectLocationData(state, locationId);
  const phone = locationData && locationData.Phones && locationData.Phones[0];

  return {
    value : phone,
    locationData 
  };
};

const mapDispatchToProps = (dispatch, ownProps) => ({
  updateValue: (phoneId, newLocationNumberAndExtension) => dispatch(updatePhone(ownProps.match.params.locationId, phoneId, newLocationNumberAndExtension)),
  getLocation: (locationId) => {
    dispatch(getLocation(locationId));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(LocationNumber);
