import React, { Component } from 'react';

import OpeningHoursEditForm from './OpeningHoursEditForm';
import Header from '../../../components/header';
import Button from '../../../components/button';
import Selector from '../../../components/selector';
import Input from '../../../components/input';
import { SERVICE_GROUPS } from '../../../constants';
import { formatLabel } from './util'

class ServiceOpeningHours extends Component {
  constructor(props) {
    super(props);

    this.updateValue = this.updateValue.bind(this);
    this.handleOkClick = this.handleOkClick.bind(this);
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

  handleOkClick(groupName, group){
    console.log('groupName, group', groupName, group);
    this.state.serviceGroups[groupName] = group;
    this.setState({ serviceGroups : this.state.serviceGroups });
  }

  render() {
    return <div className="w-100">
      <Header className="mb-3">Which groups does this service serve?</Header>
      <Selector fluid>
        {
          SERVICE_GROUPS.map(([groupName, defaultMinAge, defaultMaxAge], i) => {
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
              <OpeningHoursEditForm 
                onClick={this.handleOkClick}
                group={group}
                groupName={groupName}
                key={`editForm-${groupName}`} /> : 
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
