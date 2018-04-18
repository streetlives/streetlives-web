import React from 'react';
import { ConfirmSignUp } from 'aws-amplify-react';
import Input from '../../components/input';
import Button from '../../components/button';
import { Grid, Row, Col } from '../../components/layout/bootstrap';

export default class StreetlivesConfirmSignUp extends ConfirmSignUp {
  showComponent(theme) {
    const { hide } = this.props;
    if (hide && hide.includes(ConfirmSignUp)) {
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
            <h3>Confirm Sign Up</h3>
          </Col>
        </Row>
        <Row>
          <Col>
            <label className="w-100" htmlFor="username">
              Username
              <Input
                fluid
                id="username"
                placeholder="Enter your username"
                name="username"
                onChange={this.handleInputChange}
              />
            </label>
          </Col>
        </Row>
        <Row>
          <Col>
            <label className="w-100" htmlFor="code">
              Code
              <Input
                fluid
                placeholder="Enter your code"
                id="code"
                name="code"
                type="code"
                onChange={this.handleInputChange}
              />
            </label>
          </Col>
        </Row>
        <Row>
          <Col>
            <Button primary onClick={this.confirm}>
              <span>Confirm</span>
            </Button>
          </Col>
          <Col>
            <Button secondary onClick={this.resend}>
              <span>Resend Code</span>
            </Button>
          </Col>
        </Row>
        <Row>
          <Col>
            <button onClick={() => this.changeState('signIn')}>
              Want to go back to sign in? Click here
            </button>
          </Col>
        </Row>
      </Grid>
    );
  }
}
