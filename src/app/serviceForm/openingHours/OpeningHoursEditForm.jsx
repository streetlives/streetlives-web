import React, { Component } from 'react';
import { Row, Col } from '../../../components/layout/bootstrap';
import Input from '../../../components/input';
import Button from '../../../components/button';

export default class OpeningHoursEditForm extends Component{

  onChange(field, e){
    this.setState({[field]: e.target.value})
  }

  render(){
    const {active, onSubmit, onCancel, startTabIndex} = this.props;
    return  <form 
      onSubmit={(e) => onSubmit(e, this.state)}
      style={{
        backgroundColor:'#f0f0f0', 
        marginBottom:'10px', 
        display: active ? 'block' : 'none' 
      }}>
      <div 
        style={{
          padding: '.5em', 
        }}>
        <table> 
          <tbody>
            <tr>
              <td style={{paddingRight: '1em'}}>From:</td>
              <td><Input type="time" tabIndex={startTabIndex + 1} onChange={this.onChange.bind(this, 'opensAt')}/></td>
            </tr>
            <tr>
              <td>To:</td>
              <td><Input type="time" tabIndex={startTabIndex + 2} onChange={this.onChange.bind(this, 'closesAt')}/></td>
            </tr>
          </tbody>
        </table> 
      </div>
    </form>;
  }
}
