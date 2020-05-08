import React, { Component } from 'react';
import { getCategoryIcon } from '../../../services/iconography';
import Icon from '../../../components/icon';
import './locationDetails.css';
import ShelterService from './ShelterService';

// this card contains a category (e.g. Food) and displays
// all services that a shelter provides within that category
class CategoryCard extends Component {
  state = {
    collapsed: false,
  }

  handleCollapse = () => {
    this.setState({ collapsed: !this.state.collapsed });
  }

  render() {
    const { category, services, isSearchCategory } = this.props;

    return (
      <div className="categoryCard">
        <div className="serviceCategoryHeadersContainer">
          <Icon
            name={getCategoryIcon(category)}
            size="lg"
          />
          <div className="serviceCategoryHeaders">{category}</div>
        </div>
        <div>
          {services
            .sort((service1, service2) => service2.lastUpdate - service1.lastUpdate)
            .map(service => <ShelterService service={service} selectedCategory={false} key={service.id} showOnMount={isSearchCategory} />)}
        </div>
      </div>
    );
  }
}

export default CategoryCard;
