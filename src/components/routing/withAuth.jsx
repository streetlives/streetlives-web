import React, { useEffect, useState } from 'react';
import { getCurrentUser } from 'aws-amplify/auth';
import { Hub } from 'aws-amplify/utils';
import SignIn from '../../app/auth/SignIn';
import SignUp from '../../app/auth/SignUp';
import ConfirmSignUp from '../../app/auth/ConfirmSignUp';
import ForgotPassword from '../../app/auth/ForgotPassword';
import RequireNewPassword from '../../app/auth/RequireNewPassword';
import VerifyContact from '../../app/auth/VerifyContact';
import config from '../../config';

const withAuth = (Component) => {
  if (config.disableAuth) {
    return Component;
  }

  return (props) => {
    const [authState, setAuthState] = useState(null);

    useEffect(() => {
      getCurrentUser()
        .then(() => setAuthState('signedIn'))
        .catch(() => setAuthState('signIn'));

      const unsubscribe = Hub.listen('auth', ({ payload: { event } }) => {
        if (event === 'signedOut') {
          setAuthState('signIn');
        }
      });

      return unsubscribe;
    }, []);

    if (authState === 'signedIn') {
      return <Component {...props} />;
    }

    switch (authState) {
      case 'signUp':
        return <SignUp changeState={setAuthState} />;
      case 'confirmSignUp':
        return <ConfirmSignUp changeState={setAuthState} />;
      case 'forgotPassword':
        return <ForgotPassword changeState={setAuthState} />;
      case 'requireNewPassword':
        return <RequireNewPassword changeState={setAuthState} />;
      case 'verifyContact':
        return <VerifyContact changeState={setAuthState} />;
      case 'signIn':
        return <SignIn changeState={setAuthState} />;
      default:
        return null;
    }
  };
};

export default withAuth;
