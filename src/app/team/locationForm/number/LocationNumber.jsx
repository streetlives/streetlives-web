import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Route, Switch } from 'react-router-dom';

import { getLocation } from '../../../../actions';

import LocationNumberEdit from './LocationNumberEdit';
import LocationNumberView from './LocationNumberView';

import './PhoneNumber.css';

export const selectValue = locationData => (
  locationData && locationData.Phones
);

class LocationNumber extends Component {
  componentDidMount() {
    this.props.fetchResourceData();
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

const mapDispatchToProps = (dispatch, ownProps) => ({
  fetchResourceData: () => {
    dispatch(getLocation(ownProps.match.params.locationId));
  },
});

export default connect(null, mapDispatchToProps)(LocationNumber);
