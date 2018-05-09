import React, { Component } from 'react';
import Input from '../../../components/input';
import './OpeningHoursEditForm.css';

export default class OpeningHoursEditForm extends Component{

  render(){
    const {active, startTabIndex, hours, onFromChange, onToChange, addHour, removeHour} = this.props;
    return hours.map( (hour, i) => <form 
      key={i}
      style={{
        display: active ? 'block' : 'none'
      }}
      className="OpeningHoursEditForm" >
      <i 
        onClick={() => removeHour(hour)}
        className="fa fa-trash"></i>
      <div 
        style={{
          padding: '.5em', 
        }}>
        <table> 
          <tbody>
            <tr>
              <td style={{paddingRight: '1em'}}>From:</td>
              <td>
                <Input 
                  value={(hour && hour.opensAt) || '12:00'}
                  type="time" 
                  tabIndex={startTabIndex*100 + i*10 + 1} 
                  onChange={(e) => onFromChange('opensAt', hour, e.target.value)}/>
              </td>
            </tr>
            <tr>
              <td>To:</td>
              <td>
                <Input  
                  value={(hour && hour.closesAt) || '12:00'}
                  type="time" 
                  tabIndex={startTabIndex*100 + i*10 + 2} 
                  onChange={(e) => onToChange('closesAt', hour, e.target.value)}/>
              </td>
            </tr>
          </tbody>
        </table> 
      </div>
      {
        i === (hours.length - 1) &&
        <div 
          onClick={addHour}
          style={{
            textAlign:'center',
            backgroundColor:'white',
            borderTop: '1px solid #ccc',
            cursor: 'pointer',
            padding:'.25em'
          }}>+&nbsp;Add more hours</div>
      }
    </form>);
  }
}
