import React from "react";
import { SignIn } from 'aws-amplify-react';
import Input from '../../components/input';
import Button from '../../components/button';
import './SignIn.css';

export default class StreetlivesSignIn extends SignIn {

  showComponent(theme) {
    const { hide } = this.props;
    if (hide && hide.includes(SignIn)) { return null; }

    return (
      <div className="container-fluid">
        <div className="row">
          <div className="col-sm-12 col-md-8 offset-md-2 sign-in-header">
            <div>Streetlives <strong>NYC</strong></div>
            <br/>
            <div>Thank you for choosing to be a Streetlives Street team member</div>
          </div>
        </div>
        <div className="row">
          <div className="col-sm-12 col-md-8 offset-md-2">
            <h3>Login</h3>
          </div>
        </div>
        <div className="row">
          <div className="col-sm-12 col-md-8 offset-md-2">          
            <label className="w-100">Username or Phone Number</label>
            <Input 
              fluid placeholder="Enter your username or phone number" 
              key="username"
              name="username"
              onChange={this.handleInputChange}
              />
          </div>
        </div>
        <div className="row">
          <div className="col-sm-12 col-md-8 offset-md-2">
            <label className="w-100">Password</label>
            <Input fluid placeholder="Enter your password" 
              key="password"
              name="password"
              type="password"
              onChange={this.handleInputChange}
              />
          </div>
        </div>
        <div className="row">
          <div className="col-sm-12 col-md-8 offset-md-2">
            <Button primary onClick={this.signIn.bind(this)}>
              Login
            </Button>
          </div>
        </div>
        <div className="row">
          <div className="col-sm-12 col-md-8 offset-md-2">
            <a onClick={() => this.changeState('forgotPassword')}>Forgot password? Click here</a>
          </div>
        </div>
      </div>
    )
  }
}
