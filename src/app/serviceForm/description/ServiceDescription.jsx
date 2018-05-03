import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import * as actions from '../../../actions';
import * as api from '../../../services/api';
import getServiceById from '../utils/getServiceById';
import FormView from '../../locationForm/common/FormView';
import FormEdit from '../../locationForm/common/FormEdit';

class ServiceDescription extends Component {
  state = { value: '', isEditing: true };

  componentWillMount() {
    if (!this.props.service) {
      const { locationId } = this.props.match.params;
      this.props.getLocation(locationId);
    } else {
      this.setState({ isEditing: this.isEditing(this.props.service) });
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.service !== this.props.service) {
      this.setState({ isEditing: this.isEditing(nextProps.service) });
    }
  }

  onSubmit = (value) => {
    const { serviceId } = this.props.match.params;
    api
      .updateService(serviceId, { description: value })
      .then(() => this.setState({ isEditing: false }));
  };

  onCancel = () => this.props.history.goBack();

  onConfirm = () => console.log('Confirmed!'); // eslint-disable-line no-console

  onEdit = () => this.setState({ isEditing: true, value: this.props.service.description });

  isEditing = service => !service.description;

  render() {
    const { value } = this.state;
    const { service = {} } = this.props;

    if (this.state.isEditing) {
      return (
        <FormEdit
          value={value}
          headerText="How would you describe this service?"
          placeholderText="e.g. Free Breakfast & Lunch, 2 helpings"
          onSubmit={() => {}}
          onCancel={this.onCancel}
          updateValue={this.onSubmit}
        />
      );
    }
    return (
      <FormView
        topText="SERVICE DESCRIPTION"
        value={service.description || ''}
        onConfirm={this.onConfirm}
        onEdit={this.onEdit}
      />
    );
  }
}

const mapStateToProps = (state, ownProps) => {
  const { locationId, serviceId } = ownProps.match.params;
  const location = state.db[locationId];
  return { service: getServiceById(location, serviceId) };
};

const mapDispatchToProps = (dispatch, ownProps) => ({
  getLocation: bindActionCreators(actions.getLocation, dispatch),
});

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(ServiceDescription));
