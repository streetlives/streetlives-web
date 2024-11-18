import React, { Component } from 'react';

import Header from '../../../../components/header';
import Button from '../../../../components/button';
import Selector from '../../../../components/selector';
import Input from '../../../../components/input';
import Icon from '../../../../components/icon';
import { SERVICE_GROUPS } from '../../../../Constants';
import { formatLabel, isEditing } from './util';
import './WhoDoesItServeEditForm.css';

class WhoDoesItServe extends Component {
  constructor(props) {
    super(props);

    this.updateValue = this.updateValue.bind(this);
    this.addCustomGroup = this.addCustomGroup.bind(this);
    this.getCustomGroups = this.getCustomGroups.bind(this);

    // serviceGroups -> { allAges: true, customMinAge, customMaxAge, name}
    const serviceGroups = isEditing(this.props.value) ? [] : this.props.value;
    this.state = { 
      serviceGroups,
    };

    this.onCheckInputClick = this.onCheckInputClick.bind(this);
  }

  onServiceGroupClick(groupName, defaultMinAge, defaultMaxAge) {
    // toggle it
    const { state: { serviceGroups } } = this;
    const groupIndex = serviceGroups.findIndex(group => group.name === groupName);
    if (groupIndex > -1) {
      serviceGroups.splice(groupIndex, 1);
    } else {
      serviceGroups.push({
        all_ages: true, 
        age_min: defaultMinAge, 
        age_max: defaultMaxAge, 
        name: groupName,
      });
    }
    this.setState({ serviceGroups });
  }

  onCheckInputClick(group, serviceGroups, value, e) {
    e.stopPropagation();
    e.preventDefault();

    this.updateServiceGroups(group, serviceGroups, 'all_ages', value);
  }

  getCustomGroups() {
    const builtInGroupNames = SERVICE_GROUPS.map(group => group[0]);
    const allGroupNames = this.state.serviceGroups.map(group => group.name);
    return this.state.serviceGroups
      .filter(group => builtInGroupNames.indexOf(group.name) === -1)
      .map(group => [group, allGroupNames.lastIndexOf(group.name)]);
  }

  getForm(groupName, group, serviceGroups) {

    console.log(this.state);

    return (
      <form
        key={`editForm-${groupName}`}
        className="WhoDoesItServeEditForm"
      >
        <ul>
          <li
            role="presentation"
            onClick={e => this.onCheckInputClick(group, serviceGroups, true, e)}
          >
            <Input
              onChange={() => null}
              className="form-check-input"
              type="radio"
              name="ages"
              checked={group.all_ages}
            />
            <span>All ages in this group</span>
          </li>
          <li
            role="presentation"
            onClick={e => this.onCheckInputClick(group, serviceGroups, false, e)}
          >
            <Input
              onChange={() => null}
              className="form-check-input"
              type="radio"
              name="ages"
              checked={!group.all_ages}
            />
            <span>Specific ages in this group</span>
          </li>
        </ul>
        <div className="bottomSection">
          <div className="inputContainer">
            <div> From: </div>
            <div>
              <Input
                disabled={group.all_ages}
                type="number"
                defaultValue={group.age_min}
                onChange={(e) => {
                  this.updateServiceGroups(group, serviceGroups, 'age_min', e.target.value);
                }}
              />
            </div>
            <div> To: </div>
            <div>
              <Input
                disabled={group.all_ages}
                type="number"
                defaultValue={group.age_max}
                onChange={(e) => {
                  this.updateServiceGroups(group, serviceGroups, 'age_max', e.target.value);
                }}
              />
            </div>
          </div>
        </div>
      </form>
    );
  }

  updateServiceGroups(group, serviceGroups, prop, value) {
    const idx = serviceGroups.indexOf(group);
    const updatedServiceGroups = [
      ...serviceGroups.slice(0, idx),
      {
        ...group,
        [prop]: value,
      },
      ...serviceGroups.slice(idx + 1),
    ];

    this.setState({ serviceGroups: updatedServiceGroups });
  }

  removeCustomGroup(i) {
    const { state: { serviceGroups } } = this;
    serviceGroups.splice(i, 1);
    this.setState({ serviceGroups });
  }

  addCustomGroup() {
    const { state: { serviceGroups } } = this;
    serviceGroups.push({ all_ages: true, name: '' });
    const customGroups = this.getCustomGroups();
    this.setState({ serviceGroups, lastAddedIndex: customGroups.length - 1 });
  }

  updateValue = e => {

    console.log('update value');
    console.log(this.state.serviceGroups);

    return this.props.updateValue(
      this.state.serviceGroups,
      this.props.id,
      this.props.metaDataSection,
      this.props.fieldName,
    );
  }

  render() {
    const { state: { serviceGroups } } = this;
    console.log(this.state);
    console.log(this.props)
    return (
      <div className="w-100 WhoDoesItServe">
        <Header className="mb-3">Which groups does this service serve?</Header>
        <Selector fluid>
          {
            SERVICE_GROUPS.map(([groupName, defaultMinAge, defaultMaxAge], i) => {
              const group = this.state.serviceGroups.find(_group => _group.name === groupName);
              const age_min = (group && group.age_min) || defaultMinAge;
              const age_max = (group && group.age_max) || defaultMaxAge;
              const isActive = !!group;
              const showForm = isActive && i !== 0;
              return [
                <Selector.Option
                  key={`selector-${groupName}`}
                  disablePadding={showForm}
                  active={isActive}
                  hide={false}
                  onClick={() => this.onServiceGroupClick(groupName, defaultMinAge, defaultMaxAge)}
                >
                  {formatLabel(groupName, age_min, age_max)}
                </Selector.Option>,
              ].concat(showForm ?
                this.getForm(groupName, group, serviceGroups) :
                []);
            })
          }
          {
            this.getCustomGroups().map(([group, i], j) => (
              <div
                className="customGroup"
                key={`custom-group-${j}`} // eslint-disable-line react/no-array-index-key
              >
                <input
                  ref={e => e && e.value === '' && this.state.lastAddedIndex === j && e.focus()}
                  onChange={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    this.updateServiceGroups(
                      serviceGroups[i],
                      serviceGroups,
                      'name',
                      e.target.value,
                    );
                  }}
                  value={group.name}
                />
                <button
                  className="default"
                  onClick={() => this.removeCustomGroup(i)}
                >
                  <Icon name="times-circle" />
                </button>
                {
                  this.getForm(group.name, group, serviceGroups)
                }
              </div>
            ))
          }
          <Selector.Option
            key="selector-add-another-group"
            disablePadding={false}
            active={false}
            hide={false}
            onClick={this.addCustomGroup}
          >
            <div className="addAnotherGroup">
              + Add another group
            </div>
          </Selector.Option>
        </Selector>
        <Button onClick={this.updateValue} primary>
          OK
        </Button>
      </div>
    );
  }
}

export default WhoDoesItServe;
