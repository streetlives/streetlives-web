import React, { useRef } from 'react';
import { signIn } from 'aws-amplify/auth';
import Input from '../../components/input';
import './SignIn.css';
import { Row, Col } from '../../components/layout/bootstrap';
import checkContact from './checkContact';

const StreetlivesSignIn = ({ changeState }) => {
  const inputs = useRef({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    inputs.current[name] = value;
  };

  const doSignIn = (e) => {
    e.preventDefault();

    signIn({ username: inputs.current.username, password: inputs.current.password })
      .then(({ isSignedIn, nextStep }) => {
        if (isSignedIn) {
          checkContact(changeState);
        } else if (nextStep.signInStep === 'CONFIRM_SIGN_UP') {
          changeState('confirmSignUp');
        } else if (nextStep.signInStep === 'CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED') {
          changeState('requireNewPassword');
        } else if (nextStep.signInStep === 'RESET_PASSWORD') {
          changeState('forgotPassword');
        }
      })
      .catch(err => console.error(err));
  };

  return (
    <form className="container-fluid" onSubmit={doSignIn}>
      <Row>
        <Col customClasses="sign-in-header">
          <div>
            Streetlives <strong>NYC</strong>
          </div>
          <br />
          <div>Thank you for choosing to be a Streetlives Street team member</div>
        </Col>
      </Row>
      <Row>
        <Col>
          <h3>Login</h3>
        </Col>
      </Row>
      <Row>
        <Col>
          <label className="w-100" htmlFor="username">Username or Phone Number</label>
          <Input
            autoFocus
            tabIndex={0}
            fluid
            placeholder="Enter your username or phone number"
            id="username"
            key="username"
            name="username"
            autoCorrect="off"
            autoCapitalize="none"
            onChange={handleInputChange}
          />
        </Col>
      </Row>
      <Row>
        <Col>
          <label className="w-100" htmlFor="password">Password</label>
          <Input
            tabIndex={0}
            fluid
            placeholder="Enter your password"
            id="password"
            key="password"
            name="password"
            type="password"
            onChange={handleInputChange}
          />
        </Col>
      </Row>
      <Row>
        <Col>
          <input type="submit" className="Button Button-primary mt-3" value="Login" />
        </Col>
      </Row>
      <Row>
        <Col>
          <button
            className="default"
            onClick={() => changeState('forgotPassword')}
          >
            Forgot password? Click here
          </button>
        </Col>
      </Row>
    </form>
  );
};

export default StreetlivesSignIn;
