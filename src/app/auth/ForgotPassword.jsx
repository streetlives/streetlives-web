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
            Forgotten password?<br />No worries.
          </h3>
          <p>
            Enter the phone number you used to sign up to the Streetlives street team tool.
            We&apos;ll send an SMS with a reactivation code to the phone number you used to sign up.
          </p>
        </Col>
      </Row>,
      <Row key={2}>
        <Col>
          <label className="w-100" htmlFor="username">
            Phone Number
            <Input
              fluid
              placeholder="Enter your phone number"
              id="username"
              name="username"
              onChange={this.handleInputChange}
            />
          </label>
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
          <label className="w-100" htmlFor="code">
            Code
            <Input placeholder="Code" name="code" onChange={this.handleInputChange} fluid />
          </label>
        </Col>
      </Row>,
      <Row key={3}>
        <Col>
          <label className="w-100" htmlFor="password">
            New password
            <Input
              fluid
              type="password"
              placeholder="New password"
              key="password"
              name="password"
              onChange={this.handleInputChange}
            />
          </label>
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
            <button onClick={() => this.changeState('signIn')}>Back to Sign In</button>
          </Col>
        </Row>
      </Grid>
    );
  }
}
