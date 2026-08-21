import React, { useRef, useState } from 'react';
import { resetPassword, confirmResetPassword } from 'aws-amplify/auth';
import Input from '../../components/input';
import Button from '../../components/button';
import { Grid, Row, Col } from '../../components/layout/bootstrap';

const StreetlivesForgotPassword = ({ changeState }) => {
  const inputs = useRef({});
  const [delivery, setDelivery] = useState(false);
  const [error, setError] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    inputs.current[name] = value;
  };

  const handleSend = () => {
    setError(null);
    resetPassword({ username: inputs.current.username })
      .then(() => setDelivery(true))
      .catch((err) => {
        console.error(err);
        setError(err.message);
      });
  };

  const handleSubmit = () => {
    setError(null);
    confirmResetPassword({
      username: inputs.current.username,
      confirmationCode: inputs.current.code,
      newPassword: inputs.current.password,
    })
      .then(() => changeState('signIn'))
      .catch((err) => {
        console.error(err);
        setError(err.message);
      });
  };

  const sendView = () => [
    <Row key={1}>
      <Col>
        <h3>
          {' '}
          Forgotten password?<br />No worries.
        </h3>
        <p>
          Enter your username for the Streetlives street team tool. We’ll
          send an SMS with a reactivation code to the phone number you used to sign up.
        </p>
      </Col>
    </Row>,
    <Row key={2}>
      <Col>
        <label className="w-100" htmlFor="username">Username</label>
        <Input
          fluid
          placeholder="Enter your username"
          id="username"
          key="username"
          name="username"
          autoComplete="off"
          onChange={handleInputChange}
        />
      </Col>
    </Row>,
    <Row key={3}>
      <Col>
        <Button primary onClick={handleSend}>
          <span>Send</span>
        </Button>
      </Col>
    </Row>,
  ];

  const submitView = () => [
    <Row key={1}>
      <Col>
        <p>Enter the the SMS reactivation code and a new password.</p>
      </Col>
    </Row>,
    <Row key={2}>
      <Col>
        <label className="w-100" htmlFor="code">Code</label>
        <Input
          fluid
          placeholder="Code"
          id="code"
          key="code"
          name="code"
          autoComplete="off"
          onChange={handleInputChange}
        />
      </Col>
    </Row>,
    <Row key={3}>
      <Col>
        <label className="w-100" htmlFor="password">New password</label>
        <Input
          fluid
          type="password"
          placeholder="New password"
          id="password"
          key="password"
          name="password"
          autoComplete="off"
          onChange={handleInputChange}
        />
      </Col>
    </Row>,
    <Row key={4}>
      <Col>
        <Button primary onClick={handleSubmit}>
          <span>Submit</span>
        </Button>
      </Col>
    </Row>,
  ];

  return (
    <Grid>
      <Row>
        <Col customClasses="sign-in-header">
          <div>
            Streetlives <strong>NYC</strong>
          </div>
        </Col>
      </Row>
      {delivery ? submitView() : sendView()}
      {error && (
        <Row>
          <Col>
            <p style={{ color: 'red' }}>{error}</p>
          </Col>
        </Row>
      )}
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

export default StreetlivesForgotPassword;
