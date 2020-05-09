import React from 'react';
import { getCategoryIcon } from '../../../services/iconography';
import Icon from '../../../components/icon';
import './locationDetails.css';
import ServiceSection from './ServiceSection';

// this card contains a category (e.g. Food) and displays
// all services that a shelter provides within that category
function CategoryCard({ category, services, isInitiallyExpanded }) {
  return (
    <div className="categoryCard">
      <div className="serviceCategoryHeadersContainer">
        <span className="categoryIcon">
          <Icon
            name={getCategoryIcon(category)}
            size="lg"
          />
        </span>
        <div className="serviceCategoryHeaders">{category}</div>
      </div>
      <div>
        {services
          .sort((service1, service2) => service2.lastUpdate - service1.lastUpdate)
          .map(service => (
            <ServiceSection
              service={service}
              key={service.id}
              showOnMount={isInitiallyExpanded}
            />
          ))}
      </div>
    </div>
  );
}

export default CategoryCard;
