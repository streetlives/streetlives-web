import React, { Component } from 'react';
import Amplify from 'aws-amplify';
import { withAuthenticator } from 'aws-amplify-react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';

import withTracker from './withTracker';
import awsExports from './aws-exports';

import Map from './map/Map';
import Form from './form/Form';

import './App.css';

Amplify.configure(awsExports);

const logout = () => {
  Amplify.Auth.signOut()
    .then((data) => {
      window.location.reload();
    })
    .catch(err => console.log(err)); // eslint-disable-line no-console
};

class App extends Component {
  componentWillMount() {
    Amplify.Auth.currentAuthenticatedUser().then((user) => {
      user.getUserAttributes((err, attributes) => {
        const o = {};
        attributes.forEach((x) => {
          o[x.Name] = x.Value;
        });
        this.setState({ user: o });
      });
    });
  }

  render() {
    return (
      <div className="App">
        {this.state &&
          this.state.user && (
            <p>
              Hello {this.state.user.name}!&nbsp;
              <button onClick={logout} style={{ cursor: 'pointer', color: 'blue' }}>
                (Logout)
              </button>
            </p>
          )}
        <BrowserRouter>
          <Switch>
            <Route exact path="/" component={withTracker(Map)} />
            <Route path="/form" component={withTracker(Form)} />
          </Switch>
        </BrowserRouter>
      </div>
    );
  }
}

export default withAuthenticator(App);
