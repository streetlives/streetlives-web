import React from "react";
import { SignIn } from 'aws-amplify-react';
import Input from '../../components/input';
import Button from '../../components/button';
import './SignIn.css';
import {Grid, Row, Col} from '../../components/layout/bootstrap';

export default class StreetlivesSignIn extends SignIn {

  showComponent(theme) {
    const { hide } = this.props;
    if (hide && hide.includes(SignIn)) { return null; }

    return (
      <Grid>
        <Row>
          <Col customClasses="sign-in-header">
            <div>Streetlives <strong>NYC</strong></div>
            <br/>
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
            <label className="w-100">Username or Phone Number</label>
            <Input 
              fluid placeholder="Enter your username or phone number" 
              key="username"
              name="username"
              onChange={this.handleInputChange}
              />
          </Col>
        </Row>
        <Row>
          <Col>
            <label className="w-100">Password</label>
            <Input fluid placeholder="Enter your password" 
              key="password"
              name="password"
              type="password"
              onChange={this.handleInputChange}
              />
          </Col>
        </Row>
        <Row>
          <Col>
            <Button primary onClick={this.signIn}>
              <span>Login</span>
            </Button>
          </Col>
        </Row>
        <Row>
          <Col>
            <a onClick={() => this.changeState('forgotPassword')}>Forgot password? Click here</a>
          </Col>
        </Row>
        <Row>
          <Col>
            <a onClick={() => this.changeState('signUp')}>Don't have an account? Click here</a>
          </Col>
        </Row>
      </Grid>
    )
  }
}
