import React, { Component } from 'react';

import Accordion from 'components/accordion';
import Selector from 'components/selector';
import Button from 'components/button';
import Input from 'components/input';
import { getCategoryIcon } from 'services/iconography';

function getLabelForAddServiceButton(category) {
  const categoryName = category.name.toLowerCase().trim();

  let label = '+ Add ';
  if (!categoryName.startsWith('other')) {
    label += 'another ';
  }

  label += categoryName;

  if (categoryName.indexOf('service') === -1) {
    label += ' service';
  }

  return label;
}

class ServiceCategory extends Component {
  state = {
    isExpanded: false,
    isAddingNewService: false,
    newServiceName: null,
  };

  onToggleExpanded = () => this.setState(({ isExpanded }) => ({ isExpanded: !isExpanded }));

  onStartAddingOtherService = (category) => {
    this.setState({ isAddingNewService: true });
  };

  onDoneAddingOtherService = () => {
    this.props.onAddOtherService(this.state.newServiceName, this.props.category.id);
    this.setState({ isAddingNewService: false, newServiceName: null });
  };

  onCancelAddingOtherService = () => {
    this.setState({ isAddingNewService: false, newServiceName: null });
  };

  isSubcategoryActive = (subcategory) => {
    const { currentServices, selected } = this.props;
    return currentServices.subcategories[subcategory.id].hasExistingService
      || selected[subcategory.id];
  };

  isCategoryActive = (category) => {
    const { currentServices, newOtherServices } = this.props;
    const { subcategories, otherServices } = currentServices;

    if (otherServices.length) {
      return true;
    }

    const activeSubcategories =
      Object.keys(subcategories).filter(id => this.isSubcategoryActive(subcategories[id]));
    if (activeSubcategories.length) {
      return true;
    }

    const selectedNewServices =
      Object.keys(newOtherServices).filter(name => newOtherServices[name].isSelected);
    if (selectedNewServices.length) {
      return true;
    }

    return false;
  };

  renderSubcategory = subcategory => (
    <Selector.Option
      key={subcategory.id}
      onClick={() => this.props.onSelectSubcategory(subcategory)}
      active={this.isSubcategoryActive(subcategory)}
      disabled={subcategory.hasExistingService}
    >
      {subcategory.name}
    </Selector.Option>
  );

  renderExistingOtherService = service => (
    <Selector.Option key={service.name} active disabled>
      {service.name}
    </Selector.Option>
  );

  renderNewOtherService = service => (
    <Selector.Option
      key={service.name}
      onClick={() => this.props.onSelectOtherService(service)}
      active={service.isSelected}
    >
      {service.name}
    </Selector.Option>
  );

  renderAddServiceFooter = (category) => {
    const { isAddingNewService, newServiceName } = this.state;

    if (isAddingNewService) {
      return (
        <div>
          <Input
            fluid
            onChange={event => this.setState({ newServiceName: event.target.value })}
          />
          <Button
            onClick={this.onDoneAddingOtherService}
            disabled={!newServiceName || !newServiceName.trim()}
            primary
            className="mt-3"
          >
            OK
          </Button>&nbsp;
          <Button onClick={this.onCancelAddingOtherService} basic primary className="mt-3">
            CANCEL
          </Button>
        </div>
      );
    }

    return (
      <Selector.Option
        align="center"
        onClick={() => this.onStartAddingOtherService(category)}
      >
        {getLabelForAddServiceButton(category)}
      </Selector.Option>
    );
  }

  render() {
    const { category, newOtherServices } = this.props;
    const { isExpanded } = this.state;

    return (
      <div>
        <Accordion.Item
          active={this.isCategoryActive(category)}
          expanded={isExpanded}
          onClick={this.onToggleExpanded}
          title={category.name}
          icon={getCategoryIcon(category.name)}
        />
        <Accordion.Content active={isExpanded}>
          <Selector fluid>
            {Object.keys(category.subcategories).map(id =>
              this.renderSubcategory(category.subcategories[id]))}
            {category.otherServices.map(this.renderExistingOtherService)}
            {Object.keys(newOtherServices).map(name =>
              this.renderNewOtherService(newOtherServices[name]))}
            {this.renderAddServiceFooter(category)}
          </Selector>
        </Accordion.Content>
      </div>
    );
  }
}

export default ServiceCategory;
