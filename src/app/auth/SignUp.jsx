import React from "react";
import { SignUp } from 'aws-amplify-react';
import Input from '../../components/input';
import Button from '../../components/button';

export default class StreetlivesSignUp extends SignUp {

  showComponent(theme) {
    const { hide } = this.props;
    if (hide && hide.includes(SignUp)) { return null; }

    return (
      <div className="container-fluid">
        <div className="row">
          <div className="col-sm-12 col-md-8 offset-md-2 sign-in-header">
            <div>Streetlives <strong>NYC</strong></div>
          </div>
        </div>
        <div className="row">
          <div className="col-sm-12 col-md-8 offset-md-2">
            <h3>Sign Up</h3>
          </div>
        </div>
        <div className="row">
          <div className="col-sm-12 col-md-8 offset-md-2">          
            <label className="w-100">Username</label>
            <Input 
              fluid placeholder="Enter your username" 
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
            <label className="w-100">Email</label>
            <Input fluid placeholder="Enter your email" 
              key="email"
              name="email"
              type="email"
              onChange={this.handleInputChange}
              />
          </div>
        </div>
        <div className="row">
          <div className="col-sm-12 col-md-8 offset-md-2">
            <label className="w-100">Phone Number</label>
            <Input fluid placeholder="Enter your phone number" 
              key="phone_number"
              name="phone_number"
              type="phone_number"
              onChange={this.handleInputChange}
              />
          </div>
        </div>
        <div className="row">
          <div className="col-sm-12 col-md-8 offset-md-2">
            <Button primary onClick={this.signUp}>
              Sign Up
            </Button>
          </div>
        </div>
        <div className="row">
          <div className="col-sm-12 col-md-8 offset-md-2">
            <a onClick={() => this.changeState('signIn')}>Want to go back to sign in? Click here</a>
          </div>
        </div>
        <div className="row">
          <div className="col-sm-12 col-md-8 offset-md-2">
            <a onClick={() => this.changeState('confirmSignUp')}>Already signed up? Click here to enter your confirm code</a>
          </div>
        </div>
      </div>
    )
  }
}

