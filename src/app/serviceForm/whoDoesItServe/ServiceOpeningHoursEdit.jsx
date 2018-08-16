import React, { Component } from 'react';

import OpeningHoursEditForm from './OpeningHoursEditForm';
import Header from '../../../components/header';
import Button from '../../../components/button';
import Selector from '../../../components/selector';
import Input from '../../../components/input';
import { SERVICE_GROUPS } from '../../../constants';
import { formatLabel } from './util'
import './OpeningHoursEditForm.css';

class ServiceOpeningHours extends Component {
  constructor(props) {
    super(props);

    this.updateValue = this.updateValue.bind(this);
    // serviceGroups -> Group Name -> { allAges: true, customMinAge, customMaxAge}
    let serviceGroups = this.props.value || {};
    this.state = {serviceGroups};
  }

  onServiceGroupClick(groupName, defaultMinAge, defaultMaxAge){
    // toggle him
    if(this.state.serviceGroups[groupName]){
      delete this.state.serviceGroups[groupName];
    }else{
      this.state.serviceGroups[groupName] = { allAges : true, minAge: defaultMinAge, maxAge: defaultMaxAge};
    }
    this.setState({ serviceGroups : this.state.serviceGroups });
  }

  updateValue = e => this.props.updateValue(
    this.state.serviceGroups,
    this.props.id,
    this.props.metaDataSection,
    this.props.fieldName,
  );

  onCheckInputClick(group, serviceGroups, value, e){
    e.stopPropagation();
    e.preventDefault();
    group.allAges = value; 
    this.setState({serviceGroups});
  }

  render() {
    return <div className="w-100">
      <Header className="mb-3">Which groups does this service serve?</Header>
      <Selector fluid>
        {
          SERVICE_GROUPS.map(([groupName, defaultMinAge, defaultMaxAge], i) => {
            const serviceGroups = this.state.serviceGroups;
            const group = this.state.serviceGroups[groupName];
            const minAge = (group && group.minAge) || defaultMinAge;
            const maxAge = (group && group.maxAge) || defaultMaxAge;
            const isActive = !!group;
            const showForm = isActive && i !== 0;
            return [
              <Selector.Option
                  key={`selector-${groupName}`}
                  disablePadding={showForm}
                  active={isActive}
                  hide={false}
                  onClick={this.onServiceGroupClick.bind(this, groupName, defaultMinAge, defaultMaxAge)}
                >
                {formatLabel(groupName, minAge, maxAge)}
              </Selector.Option>
            ].concat(showForm ? 
              <form
                key={`editForm-${groupName}`}
                className="WhoDoesItServeEditForm"
                >
                <ul>
                  <li onClick={this.onCheckInputClick.bind(this, group, serviceGroups, true)}>
                    <input onChange={() => null} className="form-check-input" type="radio" name="ages" checked={group.allAges}/>All ages in this group
                  </li>
                  <li onClick={this.onCheckInputClick.bind(this, group, serviceGroups, false)}>
                    <input onChange={() => null} className="form-check-input" type="radio"  name="ages" checked={!group.allAges} />Specific ages in this group
                  </li>
                </ul>
                <div className="bottomSection">
                  <div className="inputContainer">
                    <div> From: </div> 
                    <div>
                      <input disabled={group.allAges} type="number" defaultValue={group.minAge} onChange={(e) => { group.minAge = e.target.value;this.setState({serviceGroups})}}/>
                    </div>
                    <div> To: </div>
                    <div> 
                      <input disabled={group.allAges} type="number" defaultValue={group.maxAge} onChange={(e) => { group.maxAge = e.target.value; this.setState({serviceGroups})}}/>
                    </div>
                  </div>
                </div>
              </form> : 
              []
            )
          })
        }
      </Selector>
      <Button onClick={this.updateValue} primary>
        OK
      </Button>
    </div>;
  }
}

export default ServiceOpeningHours;
