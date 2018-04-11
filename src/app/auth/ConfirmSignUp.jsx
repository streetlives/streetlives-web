import React from "react";
import { ConfirmSignUp } from 'aws-amplify-react';
import Input from '../../components/input';
import Button from '../../components/button';

export default class StreetlivesConfirmSignUp extends ConfirmSignUp {

  showComponent(theme) {
    const { hide } = this.props;
    if (hide && hide.includes(ConfirmSignUp)) { return null; }

    return (
      <div className="container-fluid">
        <div className="row">
          <div className="col-sm-12 col-md-8 offset-md-2 sign-in-header">
            <div>Streetlives <strong>NYC</strong></div>
          </div>
        </div>
        <div className="row">
          <div className="col-sm-12 col-md-8 offset-md-2">
            <h3>Confirm Sign Up</h3>
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
            <label className="w-100">Code</label>
            <Input fluid placeholder="Enter your code" 
              key="code"
              name="code"
              type="code"
              onChange={this.handleInputChange}
              />
          </div>
        </div>
        <div className="row">
          <div className="col-sm-6 col-md-8 offset-md-2">
            <Button primary onClick={this.confirm}>
              Confirm
            </Button>
          </div>
          <div className="col-sm-6 col-md-8 offset-md-2">
            <Button secondary onClick={this.resend}>
              Resend Code
            </Button>
          </div>
        </div>
        <div className="row">
          <div className="col-sm-12 col-md-8 offset-md-2">
            <a onClick={() => this.changeState('signIn')}>Want to go back to sign in? Click here</a>
          </div>
        </div>
      </div>
    )
  }
}


