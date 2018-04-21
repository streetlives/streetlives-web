import React, { Component } from 'react';
import PropTypes from 'prop-types';

class Form extends Component {
  constructor(props) {
    super(props);
    this.state = { isEditing: this.isEditing(props) };
    this.onConfirm = this.onConfirm.bind(this);
    this.onEdit = this.onEdit.bind(this);
    this.onSubmit = this.onSubmit.bind(this);

    if (!props.locationData) {
      //lazy-load the location data
      props.getLocation(props.match.params.locationId);
    }
  }

  isEditing(props){
    return props.value === null ||  
      ( typeof props.value === 'object' ? 
          Object.keys(props.value).some( key => !props.value[key] ) :
          !props.value
      );
  }

  componentWillReceiveProps(props){
    this.setState({ 
      isEditing: this.isEditing(props)
    });
  }

  onConfirm() {
    this.setState({ isEditing: false }, this.props.onFieldVerified);
  }

  onEdit() {
    this.setState({ isEditing: true });
  }

  onSubmit() {
    this.setState({ isEditing: false }, this.props.onFieldVerified);
  }

  render() {
    if (this.state.isEditing) {
      return <this.props.editComponent
          value={this.props.value}
          onSubmit={this.onSubmit}
          updateValue={this.props.updateValue}
          />;
    }

    return <this.props.viewComponent
        value={this.props.value}
        onConfirm={this.onConfirm}
        onEdit={this.onEdit}
      />;
  }
}

Form.propTypes = {
  viewComponent: PropTypes.func.isRequired,
  editComponent: PropTypes.func.isRequired,
  value: PropTypes.oneOfType([PropTypes.string,PropTypes.object]),
  locationData: PropTypes.object,
  getLocation: PropTypes.func.isRequired,
  updateValue: PropTypes.func.isRequired,
  onFieldVerified: PropTypes.func
};

export default Form;
