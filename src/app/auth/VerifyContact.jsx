import React, { useEffect, useRef, useState } from 'react';
import {
  fetchUserAttributes, sendUserAttributeVerificationCode, confirmUserAttribute,
} from 'aws-amplify/auth';
import Input from '../../components/input';
import Button from '../../components/button';
import { Grid, Row, Col } from '../../components/layout/bootstrap';

const contactLabels = {
  email: 'Email',
  phone_number: 'Phone Number',
};

const StreetlivesVerifyContact = ({ changeState }) => {
  const inputs = useRef({});
  const [unverifiedKeys, setUnverifiedKeys] = useState(null);
  const [contact, setContact] = useState(null);

  useEffect(() => {
    fetchUserAttributes()
      .then((attributes) => {
        const keys = Object.keys(contactLabels)
          .filter(key => attributes[key] && attributes[`${key}_verified`] !== 'true');

        if (!keys.length) {
          changeState('signedIn');
        } else {
          setUnverifiedKeys(keys);
        }
      })
      .catch(() => changeState('signedIn'));
  }, [changeState]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    inputs.current[name] = value;
  };

  const handleVerify = (key) => {
    sendUserAttributeVerificationCode({ userAttributeKey: key })
      .then(() => setContact(key))
      .catch(err => console.error(err));
  };

  const handleSubmit = () => {
    confirmUserAttribute({ userAttributeKey: contact, confirmationCode: inputs.current.code })
      .then(() => changeState('signedIn'))
      .catch(err => console.error(err));
  };

  if (!unverifiedKeys) {
    return null;
  }

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
          <h3>Verify Contact</h3>
        </Col>
      </Row>
      {!contact ? (
        <Row>
          <Col>
            <p>Choose a contact method to verify:</p>
            {unverifiedKeys.map(key => (
              <Button key={key} primary onClick={() => handleVerify(key)}>
                <span>{contactLabels[key]}</span>
              </Button>
            ))}
          </Col>
        </Row>
      ) : (
        <React.Fragment>
          <Row>
            <Col>
              <label className="w-100" htmlFor="code">Code</label>
              <Input
                fluid
                placeholder="Enter your code"
                id="code"
                key="code"
                name="code"
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
        </React.Fragment>
      )}
      <Row>
        <Col>
          <button
            className="default"
            onClick={() => changeState('signedIn')}
          >
            Skip
          </button>
        </Col>
      </Row>
    </Grid>
  );
};

export default StreetlivesVerifyContact;
