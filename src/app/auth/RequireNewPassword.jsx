import React, { useRef } from 'react';
import { confirmSignIn } from 'aws-amplify/auth';
import Input from '../../components/input';
import Button from '../../components/button';
import { Grid, Row, Col } from '../../components/layout/bootstrap';
import checkContact from './checkContact';

const attributeFields = {
  email: { label: 'Email', placeholder: 'Enter your email', type: 'email' },
  phone_number: {
    label: 'Phone Number', placeholder: 'Enter your phone number', type: 'phone_number',
  },
};

const StreetlivesRequireNewPassword = ({ changeState, missingAttributes = [] }) => {
  const inputs = useRef({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    inputs.current[name] = value;
  };

  const handleSubmit = () => {
    const options = missingAttributes.length
      ? {
        userAttributes: missingAttributes.reduce((attributes, attribute) => ({
          ...attributes,
          [attribute]: inputs.current[attribute],
        }), {}),
      }
      : undefined;

    confirmSignIn({ challengeResponse: inputs.current.password, options })
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
      {missingAttributes.map((attribute) => {
        const field = attributeFields[attribute] || {
          label: attribute,
          placeholder: `Enter your ${attribute}`,
          type: 'text',
        };

        return (
          <Row key={attribute}>
            <Col>
              <label className="w-100" htmlFor={attribute}>{field.label}</label>
              <Input
                fluid
                placeholder={field.placeholder}
                id={attribute}
                key={attribute}
                name={attribute}
                type={field.type}
                onChange={handleInputChange}
              />
            </Col>
          </Row>
        );
      })}
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
