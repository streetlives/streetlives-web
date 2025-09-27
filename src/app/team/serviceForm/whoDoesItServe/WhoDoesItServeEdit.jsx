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
    this.getDefaultAgesForGroup = this.getDefaultAgesForGroup.bind(this);
    this.isCustomGroup = this.isCustomGroup.bind(this);
    this.shouldSetAllAgesFlag = this.shouldSetAllAgesFlag.bind(this);
    this.isAllAgesSelection = this.isAllAgesSelection.bind(this);
    this.getSelectionType = this.getSelectionType.bind(this);
    this.normalizeDefaultAge = this.normalizeDefaultAge.bind(this);
    this.parseAgeValue = this.parseAgeValue.bind(this);
    this.normalizeAgeValueForPayload = this.normalizeAgeValueForPayload.bind(this);
    this.normalizeServiceGroups = this.normalizeServiceGroups.bind(this);

    // serviceGroups -> { allAges: true, customMinAge, customMaxAge, population_served}
    const serviceGroups = isEditing(this.props.value)
      ? []
      : this.normalizeServiceGroups(this.props.value || []);
    this.state = {
      serviceGroups,
    };

    this.onCheckInputClick = this.onCheckInputClick.bind(this);
  }

  normalizeServiceGroups(serviceGroups = []) {
    return serviceGroups.map((group) => {
      const {
        name,
        population_served,
        ...rest
      } = group;

      return {
        ...rest,
        population_served: population_served !== undefined && population_served !== null
          ? population_served
          : (name || ''),
      };
    });
  }

  onServiceGroupClick(groupName, defaultMinAge, defaultMaxAge) {
    // toggle it
    const { state: { serviceGroups } } = this;
    const groupIndex = serviceGroups.findIndex(group => group.population_served === groupName);
    if (groupIndex > -1) {
      serviceGroups.splice(groupIndex, 1);
    } else {
      serviceGroups.push({
        all_ages: this.shouldSetAllAgesFlag(groupName, true),
        age_min: this.normalizeDefaultAge(defaultMinAge),
        age_max: this.normalizeDefaultAge(defaultMaxAge),
        population_served: groupName,
        __uiSelection: 'all',
      });
    }
    this.setState({ serviceGroups });
  }

  onCheckInputClick(group, serviceGroups, value, defaultMinAge, defaultMaxAge, e) {
    e.stopPropagation();
    e.preventDefault();

    const updates = {
      all_ages: this.shouldSetAllAgesFlag(group.population_served, value),
      __uiSelection: value ? 'all' : 'specific',
    };

    if (this.isCustomGroup(group.population_served)) {
      if (value) {
        updates.age_min = null;
        updates.age_max = null;
      }
    } else if (value) {
      updates.age_min = this.normalizeDefaultAge(defaultMinAge);
      updates.age_max = this.normalizeDefaultAge(defaultMaxAge);
    } else {
      updates.age_min = this.normalizeDefaultAge(defaultMinAge);
      updates.age_max = this.normalizeDefaultAge(defaultMaxAge);
    }

    this.updateServiceGroups(group, serviceGroups, updates);
  }

  getCustomGroups() {
    const builtInGroupNames = SERVICE_GROUPS.map(group => group[0]);
    const allGroupNames = this.state.serviceGroups.map(group => group.population_served);
    return this.state.serviceGroups
      .filter(group => builtInGroupNames.indexOf(group.population_served) === -1)
      .map(group => [group, allGroupNames.lastIndexOf(group.population_served)]);
  }

  getDefaultAgesForGroup(groupName) {
    const groupDefinition = SERVICE_GROUPS.find(([name]) => name === groupName);
    if (!groupDefinition) {
      return { defaultMinAge: null, defaultMaxAge: null };
    }

    const defaultMinAge = groupDefinition[1] !== undefined ? groupDefinition[1] : null;
    const defaultMaxAge = groupDefinition[2] !== undefined ? groupDefinition[2] : null;

    return { defaultMinAge, defaultMaxAge };
  }

  isCustomGroup(populationServed) {
    return SERVICE_GROUPS.findIndex(([name]) => name === populationServed) === -1;
  }

  shouldSetAllAgesFlag(populationServed, value = true) {
    if (this.isCustomGroup(populationServed)) {
      return value;
    }

    const { defaultMinAge, defaultMaxAge } = this.getDefaultAgesForGroup(populationServed);

    return defaultMinAge === null && defaultMaxAge === null;
  }

  getSelectionType(group, defaultMinAge, defaultMaxAge) {
    if (!group) {
      return 'specific';
    }

    if (group.__uiSelection) {
      return group.__uiSelection;
    }

    if (this.isCustomGroup(group.population_served)) {
      return group.all_ages ? 'all' : 'specific';
    }

    const expectedMin = defaultMinAge !== undefined ? defaultMinAge : null;
    const expectedMax = defaultMaxAge !== undefined ? defaultMaxAge : null;

    if (expectedMin === null && expectedMax === null) {
      return 'all';
    }

    const currentMin = group.age_min !== undefined ? group.age_min : null;
    const currentMax = group.age_max !== undefined ? group.age_max : null;

    return currentMin === expectedMin && currentMax === expectedMax ? 'all' : 'specific';
  }

  isAllAgesSelection(group, defaultMinAge, defaultMaxAge) {
    return this.getSelectionType(group, defaultMinAge, defaultMaxAge) === 'all';
  }

  normalizeDefaultAge(age) {
    return age !== undefined ? age : null;
  }

  parseAgeValue(value) {
    if (value === '' || value === null || value === undefined) {
      return null;
    }

    const parsed = parseInt(value, 10);

    return Number.isNaN(parsed) ? null : parsed;
  }

  normalizeAgeValueForPayload(age) {
    if (age === undefined || age === null || Number.isNaN(age)) {
      return null;
    }

    return age;
  }

  getForm(groupName, group, serviceGroups, defaultMinAge, defaultMaxAge) {
    const isCustom = this.isCustomGroup(groupName);
    const selectionType = this.getSelectionType(group, defaultMinAge, defaultMaxAge);
    const isAllAgesSelected = selectionType === 'all';
    const disableAgeInputs = isCustom
      ? !!group.all_ages
      : (defaultMinAge === undefined && defaultMaxAge === undefined)
        ? true
        : isAllAgesSelected;

    return (
      <form
        key={`editForm-${groupName}`}
        className="WhoDoesItServeEditForm"
      >
        <ul>
          <li
            role="presentation"
            onClick={e => this.onCheckInputClick(group, serviceGroups, true, defaultMinAge, defaultMaxAge, e)}
          >
            <Input
              onChange={() => null}
              className="form-check-input"
              type="radio"
              name="ages"
              checked={isAllAgesSelected}
            />
            <span>All ages in this group</span>
          </li>
          <li
            role="presentation"
            onClick={e => this.onCheckInputClick(group, serviceGroups, false, defaultMinAge, defaultMaxAge, e)}
          >
            <Input
              onChange={() => null}
              className="form-check-input"
              type="radio"
              name="ages"
              checked={!isAllAgesSelected}
            />
            <span>Specific ages in this group</span>
          </li>
        </ul>
        <div className="bottomSection">
          <div className="inputContainer">
            <div> From: </div>
            <div>
              <Input
                disabled={disableAgeInputs}
                type="number"
                value={group.age_min !== undefined && group.age_min !== null ? group.age_min : ''}
                onChange={(e) => {
                  this.updateServiceGroups(
                    group,
                    serviceGroups,
                    {
                      age_min: this.parseAgeValue(e.target.value),
                      __uiSelection: 'specific',
                    },
                  );
                }}
              />
            </div>
            <div> To: </div>
            <div>
              <Input
                disabled={disableAgeInputs}
                type="number"
                value={group.age_max !== undefined && group.age_max !== null ? group.age_max : ''}
                onChange={(e) => {
                  this.updateServiceGroups(
                    group,
                    serviceGroups,
                    {
                      age_max: this.parseAgeValue(e.target.value),
                      __uiSelection: 'specific',
                    },
                  );
                }}
              />
            </div>
          </div>
        </div>
      </form>
    );
  }

  updateServiceGroups(group, serviceGroups, updates) {
    const idx = serviceGroups.indexOf(group);
    const updatedServiceGroups = [
      ...serviceGroups.slice(0, idx),
      {
        ...group,
        ...updates,
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
    serviceGroups.push({
      all_ages: true,
      population_served: '',
      age_min: null,
      age_max: null,
      __uiSelection: 'all',
    });
    const customGroups = this.getCustomGroups();
    this.setState({ serviceGroups, lastAddedIndex: customGroups.length - 1 });
  }

  updateValue = () => {
    const formattedServiceGroups = this.state.serviceGroups.map((group) => {
      const {
        __uiSelection,
        ...groupWithoutUiSelection
      } = group;
      const age_min = this.normalizeAgeValueForPayload(groupWithoutUiSelection.age_min);
      const age_max = this.normalizeAgeValueForPayload(groupWithoutUiSelection.age_max);
      return {
        ...groupWithoutUiSelection,
        age_min,
        age_max,
        all_ages: this.shouldSetAllAgesFlag(
          groupWithoutUiSelection.population_served,
          groupWithoutUiSelection.all_ages,
        ),
      };
    });

    return this.props.updateValue(
      formattedServiceGroups,
      this.props.id,
      this.props.metaDataSection,
      this.props.fieldName,
    );
  }

  render() {
    const { state: { serviceGroups } } = this;
    return (
      <div className="w-100 WhoDoesItServe">
        <Header className="mb-3">Which groups does this service serve?</Header>
        <Selector fluid>
          {
            SERVICE_GROUPS.map(([groupName, defaultMinAge, defaultMaxAge], i) => {
              const group = serviceGroups.find(_group => _group.population_served === groupName);
              const age_min = (group && group.age_min) !== undefined ? group.age_min : defaultMinAge;
              const age_max = (group && group.age_max) !== undefined ? group.age_max : defaultMaxAge;
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
                this.getForm(groupName, group, serviceGroups, defaultMinAge, defaultMaxAge) :
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
                      { population_served: e.target.value },
                    );
                  }}
                  value={group.population_served}
                />
                <button
                  className="default"
                  onClick={() => this.removeCustomGroup(i)}
                >
                  <Icon name="times-circle" />
                </button>
                {
                  this.getForm(group.population_served, group, serviceGroups, group.age_min, group.age_max)
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
