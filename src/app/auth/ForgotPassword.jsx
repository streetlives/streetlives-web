import React from "react";
import { ForgotPassword } from 'aws-amplify-react';
import Input from '../../components/input';
import Button from '../../components/button';

export default class StreetlivesForgotPassword extends ForgotPassword {

  sendView() {
      return [
        <div className="row" key={1}>
          <div className="col-sm-12 col-md-8 offset-md-2">
            <h3> Forgotten password?<br/>No worries.</h3>
            <p>
              Enter the phone number you used to sign up to the Streetlives
              street team tool.  We'll send an SMS with a reactivation code to the phone
              number you used to sign up.
            </p>
          </div>
        </div>,
        <div className="row" key={2}>
          <div className="col-sm-12 col-md-8 offset-md-2">        
            <label className="w-100">Phone Number</label>
            <Input 
              fluid 
              placeholder="Enter your phone number" 
              key="username"
              name="username"
              onChange={this.handleInputChange}
              />
          </div>
        </div>,
        <div className="row" key={3}>
          <div className="col-sm-12 col-md-8 offset-md-2">
            <Button primary onClick={this.send}>
              Send
            </Button>
          </div>
        </div>
      ]
  }

  submitView() {
      return [
        <div className="row" key={1}>
          <div className="col-sm-12 col-md-8 offset-md-2">
            <p>
              Enter the the SMS reactivation code and a new password.
            </p>
          </div>
        </div>,
        <div className="row" key={2}>
          <div className="col-sm-12 col-md-8 offset-md-2">        
            <label className="w-100">Code</label>
            <Input 
              fluid 
              placeholder="Code" 
              key="code"
              name="code"
              onChange={this.handleInputChange}
              />
          </div>
        </div>,
        <div className="row" key={3}>
          <div className="col-sm-12 col-md-8 offset-md-2">        
            <label className="w-100">New password</label>
            <Input 
              fluid 
              type="password"
              placeholder="New password" 
              key="password"
              name="password"
              onChange={this.handleInputChange}
              />
          </div>
        </div>,
        <div className="row" key={4}>
          <div className="col-sm-12 col-md-8 offset-md-2">
            <Button primary onClick={this.submit}>
              Submit
            </Button>
          </div>
        </div>
      ]
  }

  showComponent(theme) {
      const { hide } = this.props;
      if (hide && hide.includes(ForgotPassword)) { return null; }

      return (
          <div className="container-fluid">
            <div className="row">
              <div className="col-sm-12 col-md-8 offset-md-2 sign-in-header">
                <div>Streetlives <strong>NYC</strong></div>
              </div>
            </div>
            { this.state.delivery? this.submitView() : this.sendView() }
            <div className="row">
              <div className="col-sm-12 col-md-8 offset-md-2">
                <a onClick={() => this.changeState('signIn')}>Back to Sign In</a>
              </div>
            </div>
          </div>
      )
  }
}

