import React, { Component } from 'react';
import PropTypes from 'prop-types';
import LoadingLabel from './LoadingLabel';
import ErrorLabel from './ErrorLabel';

function isEditing(value) {
  return (
    value === null ||
    (typeof value === 'object'
      ? Object.keys(value).every(key => !value[key])
      : value === null)
  );
}

class Form extends Component {
  constructor(props) {
    super(props);

    this.isEditing = props.isEditing || isEditing;
    this.state = { isEditing: this.isEditing(props.value) };
  }

  componentDidMount() {
    const { resourceData } = this.props;
    if (!resourceData || Object.keys(resourceData).length === 0) {
      const { locationId } = this.props.match.params;
      this.props.fetchResourceData(locationId);
    }
  }

  componentWillReceiveProps(props) {
    this.setState({ isEditing: this.isEditing(props.value) });
  }

  onConfirm = () => {
    this.props.updateValue(
      this.props.value,
      this.props.id,
      this.props.metaDataSection,
      this.props.fieldName,
    );
    this.setState({ isEditing: false }, this.props.onFieldVerified);
  };

  onEdit = () => {
    this.setState({ isEditing: true });
  };

  onSubmit = (value) => {
    this.setState({ isEditing: false }, () => (!value && this.props.onFieldVerified()));
  };

  onCancel = (e) => {
    e.preventDefault();
    this.setState({ isEditing: false });
  };

  render() {
    const {
      EditComponent, ViewComponent, resourceData, resourceLoadError,
    } = this.props;

    if (resourceLoadError) return <ErrorLabel errorMessage={resourceLoadError} />;

    if (!resourceData || Object.keys(resourceData).length === 0) return <LoadingLabel />;

    if (this.state.isEditing) {
      return (
        <EditComponent
          onInputFocus={this.props.onInputFocus}
          onInputBlur={this.props.onInputBlur}
          value={this.props.value}
          onSubmit={this.onSubmit}
          onCancel={this.onCancel}
          updateValue={this.props.updateValue}
          metaDataSection={this.props.metaDataSection}
          fieldName={this.props.fieldName}
          id={this.props.id}
        />
      );
    }

    return (
      <ViewComponent
        value={this.props.value}
        onConfirm={this.onConfirm}
        onEdit={this.onEdit}
        updateValue={this.props.updateValue}
        metaDataSection={this.props.metaDataSection}
        fieldName={this.props.fieldName}
        id={this.props.id}
      />
    );
  }
}

Form.propTypes = {
  ViewComponent: PropTypes.func.isRequired,
  EditComponent: PropTypes.func.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.object, PropTypes.array, PropTypes.bool]),
  resourceData: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  resourceLoadError: PropTypes.string,
  fetchResourceData: PropTypes.func.isRequired,
  updateValue: PropTypes.func.isRequired,
  onFieldVerified: PropTypes.func,
  id: PropTypes.string,
  onInputFocus: PropTypes.func,
  onInputBlur: PropTypes.func,
  metaDataSection: PropTypes.string,
  fieldName: PropTypes.string,
};

export default Form;
