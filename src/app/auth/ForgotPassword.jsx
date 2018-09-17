import React from 'react';
import { ForgotPassword } from 'aws-amplify-react';
import Input from '../../components/input';
import Button from '../../components/button';
import { Grid, Row, Col } from '../../components/layout/bootstrap';

export default class StreetlivesForgotPassword extends ForgotPassword {
  sendView() {
    return [
      <Row key={1}>
        <Col>
          <h3>
            {' '}
            Forgotten password?<br />No worries.
          </h3>
          <p>
            Enter the phone number you used to sign up to the Streetlives street team tool. We’ll
            send an SMS with a reactivation code to the phone number you used to sign up.
          </p>
        </Col>
      </Row>,
      <Row key={2}>
        <Col>
          <label className="w-100" htmlFor="phone">Phone Number</label>
          <Input
            fluid
            placeholder="Enter your phone number"
            id="phone"
            key="phone"
            name="phone"
            onChange={this.handleInputChange}
          />
        </Col>
      </Row>,
      <Row key={3}>
        <Col>
          <Button primary onClick={this.send}>
            <span>Send</span>
          </Button>
        </Col>
      </Row>,
    ];
  }

  submitView() {
    return [
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
            onChange={this.handleInputChange}
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
            onChange={this.handleInputChange}
          />
        </Col>
      </Row>,
      <Row key={4}>
        <Col>
          <Button primary onClick={this.submit}>
            <span>Submit</span>
          </Button>
        </Col>
      </Row>,
    ];
  }

  showComponent(theme) {
    const { hide } = this.props;
    if (hide && hide.includes(ForgotPassword)) {
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
        {this.state.delivery ? this.submitView() : this.sendView()}
        <Row>
          <Col>
            <button
              className="default"
              onClick={() => this.changeState('signIn')}
            >
                Back to Sign In
            </button>
          </Col>
        </Row>
      </Grid>
    );
  }
}
