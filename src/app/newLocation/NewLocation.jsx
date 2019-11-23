import React, { Component } from 'react';
import { connect } from 'react-redux';
import { FormEdit } from 'components/form';
import LoadingLabel from 'components/form/LoadingLabel';
import { selectNewLocationData } from 'reducers/newLocation';
import { doneCreatingNewLocation } from 'actions';
import * as api from 'services/api';
import NavBar from '../NavBar';

const LoadingView = () => (
  <div className="d-flex flex-column">
    <NavBar title="Add location" />
    <LoadingLabel>Creating new location...</LoadingLabel>
  </div>
);

class NewLocation extends Component {
  constructor(props) {
    super(props);

    this.state = { isLoading: false };
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
    this.setState({ isLoading: true }, () => {
      api.createOrganization(organizationName)
        .then(createdOrganization => api.createLocation({
          organizationId: createdOrganization.id,
          position: this.props.position,
          address: this.props.address,
        }))
        .then((createdLocation) => {
          this.setState({ isLoading: false });
          this.props.dispatch(doneCreatingNewLocation(createdLocation));
          this.props.history.push(`/location/${createdLocation.id}`);
        })
        .catch((e) => {
          // eslint-disable-next-line no-console
          console.error('Error creating new location', e);
          // eslint-disable-next-line no-alert
          alert('An error occurred creating the new location.\n'
            + 'Please make sure you\'re connected to the internet.');
          this.setState({ isLoading: false });
        });
    });
  }

  render() {
    if (this.state.isLoading) {
      return <LoadingView />;
    }

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
