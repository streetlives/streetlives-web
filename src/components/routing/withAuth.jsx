import React from 'react';
import { AmplifyTheme, RequireNewPassword, VerifyContact, Authenticator } from 'aws-amplify-react';
import SignIn from '../../app/auth/SignIn';
import SignUp from '../../app/auth/SignUp';
import ConfirmSignUp from '../../app/auth/ConfirmSignUp';
import ForgotPassword from '../../app/auth/ForgotPassword';
import config from '../../config';

const withAuth = (Component) => {
  if (config.disableAuth) {
    return Component;
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
