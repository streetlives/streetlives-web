import React, { Component } from 'react';
import Input from '../../../components/input';
import Button from '../../../components/button';
import './OpeningHoursEditForm.css';

export default class WhoDoesItServeEditForm extends Component {
  constructor(props){
    super(props);

    this.state = {group : props.group};
  }

  render() {
    return <form
      className="WhoDoesItServeEditForm"
    >
      <ul>
        <li onClick={() => { this.state.group.allAges = true; this.setState({group: this.state.group});}}>
          <input className="form-check-input" type="radio" name="ages" checked={this.state.group.allAges}/>All ages in this group
        </li>
        <li onClick={() => { this.state.group.allAges = false; this.setState({group: this.state.group});}}>
          <input className="form-check-input" type="radio"  name="ages" checked={!this.state.group.allAges} />Specific ages in this group
        </li>
      </ul>
      <div className="bottomSection">
        <div className="inputContainer">
          <div> From: </div> 
          <div>
            <input disabled={this.state.group.allAges} type="number" defaultValue={this.state.group.minAge} onChange={(e) => { this.state.group.minAge = e.target.value;this.setState({group: this.state.group})}}/>
          </div>
          <div> To: </div>
          <div> 
            <input disabled={this.state.group.allAges} type="number" defaultValue={this.state.group.maxAge} onChange={(e) => { this.state.group.maxAge = e.target.value; this.setState({group: this.state.group})}}/>
          </div>
        </div>
        <div className="buttonContainer">
          <Button fluid onClick={(e) =>{ e.preventDefault(); this.props.onClick(this.props.groupName, this.state.group)}} primary>
            OK
          </Button>
        </div>
      </div>
    </form>;
  }
}
