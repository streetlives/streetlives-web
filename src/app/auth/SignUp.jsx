import React, { useRef } from 'react';
import { signUp } from 'aws-amplify/auth';
import Input from '../../components/input';
import Button from '../../components/button';
import { Grid, Row, Col } from '../../components/layout/bootstrap';

const StreetlivesSignUp = ({ changeState }) => {
  const inputs = useRef({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    inputs.current[name] = value;
  };

  const handleSignUp = () => {
    const {
      username, password, email, phone_number: phoneNumber,
    } = inputs.current;

    signUp({
      username,
      password,
      options: {
        userAttributes: {
          email,
          phone_number: phoneNumber,
        },
      },
    })
      .then(({ nextStep }) => {
        if (nextStep && nextStep.signUpStep === 'CONFIRM_SIGN_UP') {
          changeState('confirmSignUp');
        } else {
          changeState('signIn');
        }
      })
      .catch(err => console.error(err));
  };

  return (
    <Grid>
      <Row>
        <Col customClasses="sign-in-header">
          <div>
            Streetlives <strong>NYC</strong>
          </div>
        </Col>
      </Row>
      <Row>
        <Col>
          <h3>Sign Up</h3>
        </Col>
      </Row>
      <Row>
        <Col>
          <label className="w-100" htmlFor="username">Username</label>
          <Input
            fluid
            placeholder="Enter your username"
            id="username"
            key="username"
            name="username"
            onChange={handleInputChange}
          />
        </Col>
      </Row>
      <Row>
        <Col>
          <label className="w-100" htmlFor="password">Password</label>
          <Input
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
          <label className="w-100" htmlFor="email">Email</label>
          <Input
            fluid
            placeholder="Enter your email"
            id="email"
            key="email"
            name="email"
            type="email"
            onChange={handleInputChange}
          />
        </Col>
      </Row>
      <Row>
        <Col>
          <label className="w-100" htmlFor="phone">Phone Number</label>
          <Input
            fluid
            placeholder="Enter your phone number"
            id="phone"
            key="phone_number"
            name="phone_number"
            type="phone_number"
            onChange={handleInputChange}
          />
        </Col>
      </Row>
      <Row>
        <Col>
          <Button primary onClick={handleSignUp}>
            <span>Sign Up</span>
          </Button>
        </Col>
      </Row>
      <Row>
        <Col>
          <button
            className="default"
            onClick={() => changeState('signIn')}
          >
                Want to go back to sign in? Click here
          </button>
        </Col>
      </Row>
      <Row>
        <Col>
          <button
            className="default"
            onClick={() => changeState('confirmSignUp')}
          >
            Already signed up? Click here to enter your confirm code
          </button>
        </Col>
      </Row>
    </Grid>
  );
};

export default StreetlivesSignUp;
