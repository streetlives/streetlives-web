import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Header from '../../../components/header';
import Button from '../../../components/button';
import Input from '../../../components/input';

class LocationNameEdit extends Component {
  constructor(props) {
    super(props);
    this.state = { name: props.name };
    this.onSubmit = this.onSubmit.bind(this);
    this.onChange = this.onChange.bind(this);
  }

  onChange(event) {
    this.setState({ name: event.target.value });
  }

  onSubmit() {
    this.props.updateName(this.state.name);
    this.props.onSubmit();
  }

  render() {
    return (
      <div>
        <Header>What&apos;s this location&apos;s name?</Header>
        <Input
          fluid
          placeholder="Enter the name of the location"
          defaultValue={this.props.name}
          onChange={this.onChange}
        />
        <Button onClick={this.onSubmit} primary className="mt-3">
          OK
        </Button>
      </div>
    );
  }
}

LocationNameEdit.propTypes = {
  name: PropTypes.string,
  onSubmit: PropTypes.func.isRequired,
  updateName: PropTypes.func.isRequired,
};
LocationNameEdit.defaultProps = {
  name: '',
};

export default LocationNameEdit;
