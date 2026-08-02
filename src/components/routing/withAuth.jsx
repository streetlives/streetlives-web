import React from 'react';
import { AmplifyTheme, RequireNewPassword, VerifyContact, Authenticator } from 'aws-amplify-react';
import SignIn from '../../app/auth/SignIn';
import SignUp from '../../app/auth/SignUp';
import ConfirmSignUp from '../../app/auth/ConfirmSignUp';
import ForgotPassword from '../../app/auth/ForgotPassword';
import config from '../../config';
import LoadingLabel from '../form/LoadingLabel';
import {
  ensureLocalDevStreetliSession,
  shouldUseLocalDevStreetliAuth,
} from '../../services/devStreetliAuth';

const makeDevStreetliAuthGate = Component => class DevStreetliAuthGate extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      error: null,
      ready: false,
    };
  }

  componentDidMount() {
    ensureLocalDevStreetliSession()
      .then(() => {
        this.setState({
          error: null,
          ready: true,
        });
      })
      .catch((error) => {
        this.setState({
          error: error instanceof Error ? error.message : String(error),
          ready: false,
        });
      });
  }

  render() {
    const { error, ready } = this.state;

    if (error) {
      return (
        <p role="alert">
          Local Streetli dev auth failed:
          {' '}
          {error}
        </p>
      );
    }

    if (!ready) {
      return <LoadingLabel>Loading Streetli dev auth</LoadingLabel>;
    }

    return <Component {...this.props} />;
  }
};

const withAuth = (Component) => {
  if (config.disableAuth) {
    return Component;
  }

  if (shouldUseLocalDevStreetliAuth()) {
    return makeDevStreetliAuthGate(Component);
  }

  return (props) => {
    const ComponentRenderedOnlyOnAuth = ({ authState }) =>
      (authState === 'signedIn' ? <Component {...props} /> : null);

    return (
      <Authenticator hideDefault theme={AmplifyTheme}>
        <SignIn />
        <ForgotPassword />
        <RequireNewPassword />
        <SignUp />
        <ConfirmSignUp />
        <VerifyContact />
        <ComponentRenderedOnlyOnAuth />
      </Authenticator>
    );
  };
};

export default withAuth;
