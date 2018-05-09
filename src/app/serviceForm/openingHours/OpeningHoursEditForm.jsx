import React, { Component } from 'react';
import Input from '../../../components/input';

export default class OpeningHoursEditForm extends Component{

  componentWillReceiveProps(newProps){
    if(newProps.active && !newProps.hours.length){
      this.props.addHour(); 
    }
  }

  render(){
    const {active, startTabIndex, hours, onFromChange, onToChange, addHour, removeHour} = this.props;
    return hours.map( (hour, i) => <form 
      style={{
        backgroundColor:'#f0f0f0', 
        marginBottom:'1.5em', 
        marginTop:'1.5em', 
        display: active ? 'block' : 'none',
        border: '1px solid #ccc',
        position: 'relative'
      }}>
      <i 
        onClick={() => removeHour(hour)}
        style={{
          position: 'absolute',
          top: '-1em',
          display: 'block',
          right: '-1em',
          color: 'yellow',
          backgroundColor: 'black',
          padding: '.5em',
          borderRadius: '1em',
          border: '1px solid yellow',
          boxShadow: '1px 2px 1px 0 rgba(0,0,0,.25)',
          width: '2em',
          height: '2em',
          textAlign: 'center',
          cursor: 'pointer',
        }}
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
                  value={hour && hour.opensAt}
                  type="time" 
                  tabIndex={startTabIndex*100 + i*10 + 1} 
                  onChange={(e) => onFromChange('opensAt', hour, e.target.value)}/>
              </td>
            </tr>
            <tr>
              <td>To:</td>
              <td>
                <Input  
                  value={hour && hour.closesAt}
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
