import React from 'react';
import { SignIn } from 'aws-amplify-react';
import Input from '../../components/input';
import './SignIn.css';
import { Row, Col } from '../../components/layout/bootstrap';

export default class StreetlivesSignIn extends SignIn {
  constructor(props) {
    super(props);
    this.doSignIn = this.doSignIn.bind(this);
  }

  doSignIn(e) {
    e.preventDefault();
    this.signIn();
  }

  showComponent(theme) {
    const { hide } = this.props;
    if (hide && hide.includes(SignIn)) {
      return null;
    }

    return (
      <form className="container-fluid" onSubmit={this.doSignIn}>
        <Row>
          <Col customClasses="sign-in-header">
            <div>
              Streetlives <strong>NYC</strong>
            </div>
            <br />
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
            <label className="w-100" htmlFor="username">Username or Phone Number</label>
            <Input
              autoFocus
              tabIndex={0}
              fluid
              placeholder="Enter your username or phone number"
              id="username"
              key="username"
              name="username"
              autoCorrect="off"
              autoCapitalize="none"
              onChange={this.handleInputChange}
            />
          </Col>
        </Row>
        <Row>
          <Col>
            <label className="w-100" htmlFor="password">Password</label>
            <Input
              tabIndex={0}
              fluid
              placeholder="Enter your password"
              id="password"
              key="password"
              name="password"
              type="password"
              onChange={this.handleInputChange}
            />
          </Col>
        </Row>
        <Row>
          <Col>
            <input type="submit" className="Button Button-primary mt-3" value="Login" />
          </Col>
        </Row>
        <Row>
          <Col>
            <a onClick={() => this.changeState('forgotPassword')}>Forgot password? Click here</a>
          </Col>
        </Row>
      </form>
    );
  }
}
