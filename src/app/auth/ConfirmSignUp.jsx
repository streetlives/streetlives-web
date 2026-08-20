import React, { useRef } from 'react';
import { confirmSignUp, resendSignUpCode } from 'aws-amplify/auth';
import Input from '../../components/input';
import Button from '../../components/button';
import { Grid, Row, Col } from '../../components/layout/bootstrap';

const StreetlivesConfirmSignUp = ({ changeState }) => {
  const inputs = useRef({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    inputs.current[name] = value;
  };

  const handleConfirm = () => {
    confirmSignUp({
      username: inputs.current.username,
      confirmationCode: inputs.current.code,
    })
      .then(() => changeState('signIn'))
      .catch(err => console.error(err));
  };

  const handleResend = () => {
    resendSignUpCode({ username: inputs.current.username })
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
          <h3>Confirm Sign Up</h3>
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
          <label className="w-100" htmlFor="code">Code</label>
          <Input
            fluid
            placeholder="Enter your code"
            id="code"
            key="code"
            name="code"
            type="code"
            onChange={handleInputChange}
          />
        </Col>
      </Row>
      <Row>
        <Col>
          <Button primary onClick={handleConfirm}>
            <span>Confirm</span>
          </Button>
        </Col>
        <Col>
          <Button secondary onClick={handleResend}>
            <span>Resend Code</span>
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
    </Grid>
  );
};

export default StreetlivesConfirmSignUp;
