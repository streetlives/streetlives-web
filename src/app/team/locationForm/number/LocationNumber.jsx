import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Route, Switch } from 'react-router-dom';

import { getLocation } from '../../../../actions';
import { selectLocationData } from '../../../../selectors/location';

import LocationNumberEdit from './LocationNumberEdit';
import LocationNumberView from './LocationNumberView';

import './PhoneNumber.css';

export const selectValue = locationData => (
  locationData && locationData.Phones
);

class LocationNumber extends Component {
  componentDidMount() {
    const { resource, fetchResourceData } = this.props;

    if (!resource || Object.keys(resource).length === 0) {
      fetchResourceData();
    }
  }

  render() {
    const { match, onFieldVerified } = this.props;

    return (
      <Switch>
        <Route exact path={`${match.path}/new`} component={LocationNumberEdit} />
        <Route exact path={`${match.path}/:phoneId`} component={LocationNumberEdit} />
        <Route
          exact
          path={`${match.path}/`}
          render={props => <LocationNumberView {...props} onConfirm={onFieldVerified} />}
        />
      </Switch>
    );
  }
}

const mapStateToProps = (state, ownProps) => ({
  resource: selectLocationData(state, ownProps),
});

const mapDispatchToProps = (dispatch, ownProps) => ({
  fetchResourceData: () => {
    dispatch(getLocation(ownProps.match.params.locationId));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(LocationNumber);
