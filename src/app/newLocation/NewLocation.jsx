import React, { Component } from 'react';
import { connect } from 'react-redux';
import NavBar from '../NavBar';
import { FormEdit } from '../../components/form';
import { selectNewLocationData } from '../../reducers/newLocation';
import { doneCreatingNewLocation } from '../../actions';
import * as api from '../../services/api';

class NewLocation extends Component {
  constructor(props) {
    super(props);

    this.onCancel = this.onCancel.bind(this);
    this.createLocation = this.createLocation.bind(this);
  }

  componentDidMount() {
    if (!this.props.position || !this.props.address) {
      this.onCancel();
    }
  }

  onCancel() {
    this.props.dispatch(doneCreatingNewLocation());
    this.props.history.goBack();
  }

  createLocation(organizationName) {
    // TODO: Could use a loading indicator here.
    api.createOrganization(organizationName)
      .then(createdOrganization => api.createLocation({
        organizationId: createdOrganization.id,
        position: this.props.position,
        address: this.props.address,
      })
        .then((createdLocation) => {
          this.props.dispatch(doneCreatingNewLocation(createdLocation));
          this.props.history.push(`/location/${createdLocation.id}`);
        })
        .catch((e) => {
          // eslint-disable-next-line no-console
          console.error('Error creating new location', e);
        }));
  }

  render() {
    return (
      <div className="text-left">
        <NavBar title="Add location" />
        <div
          style={{ marginBottom: '5em' }}
          className="container"
        >
          <div className="row px-4">
            <FormEdit
              metaDataSection="organization"
              fieldName="name"
              onFieldVerified={this.onNext}
              onCancel={this.onCancel}
              updateValue={this.createLocation}
              headerText="What's this organizations's name?"
              placeholderText="Enter the name of the organization"
            />
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  const { position, address } = selectNewLocationData(state);
  return { position, address };
};

export default connect(mapStateToProps)(NewLocation);
