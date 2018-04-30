import React, { Component } from 'react';

import ListItem from './ListItem';
import Header from '../../components/header';
import SectionHeader from '../../components/sectionHeader';

class ServicesRecapPage extends Component {
  getServiceItems = (category) => {
    const { services } = this.props;

    return Object.keys(services[category]).map((id) => {
      const service = services[category][id];

      return service.selected ? (
        <ListItem key={id} title={service.name} progress={service.progress || 0} />
      ) : (
        undefined
      );
    });
  };

  render() {
    return (
      <div className="text-left">
        <div className="py-5 px-3 container">
          <Header>
            Please fill in all the information available for each of the services at this location:
          </Header>
        </div>

        <SectionHeader title="Shelter" icon="home" />
        {this.getServiceItems('shelter')}

        <SectionHeader title="Food" icon="cutlery" />
        {this.getServiceItems('food')}

        <SectionHeader title="Other Services" icon="ellipsis-h" />
        {this.getServiceItems('other')}
      </div>
    );
  }
}

export default ServicesRecapPage;
