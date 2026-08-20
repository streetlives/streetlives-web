import React, { useRef } from 'react';
import { confirmSignIn } from 'aws-amplify/auth';
import Input from '../../components/input';
import Button from '../../components/button';
import { Grid, Row, Col } from '../../components/layout/bootstrap';
import checkContact from './checkContact';

const StreetlivesRequireNewPassword = ({ changeState }) => {
  const inputs = useRef({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    inputs.current[name] = value;
  };

  const handleSubmit = () => {
    confirmSignIn({ challengeResponse: inputs.current.password })
      .then(({ isSignedIn }) => {
        if (isSignedIn) {
          checkContact(changeState);
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
          <h3>New Password Required</h3>
        </Col>
      </Row>
      <Row>
        <Col>
          <label className="w-100" htmlFor="password">New password</label>
          <Input
            fluid
            type="password"
            placeholder="Enter a new password"
            id="password"
            key="password"
            name="password"
            onChange={handleInputChange}
          />
        </Col>
      </Row>
      <Row>
        <Col>
          <Button primary onClick={handleSubmit}>
            <span>Submit</span>
          </Button>
        </Col>
      </Row>
      <Row>
        <Col>
          <button
            className="default"
            onClick={() => changeState('signIn')}
          >
            Back to Sign In
          </button>
        </Col>
      </Row>
    </Grid>
  );
};

export default StreetlivesRequireNewPassword;
