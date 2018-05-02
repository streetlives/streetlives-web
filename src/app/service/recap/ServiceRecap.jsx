import React, { Component } from 'react';
import { connect } from 'react-redux';

import Button from '../../../components/button';
import Header from '../../../components/header';
import SectionHeader from '../../../components/sectionHeader';
import getCategoryIcon from '../util/getCategoryIcon';

import NavBar from '../../NavBar';
import ListItem from './ListItem';

class ServicesRecap extends Component {
  componentWillMount() {
    if (!this.props.locationServices) {
      const { locationId } = this.props.match.params;
      this.props.history.push(`/location/${locationId}/services`);
    }
  }

  onNext = () => console.log('Clicked Next'); // eslint-disable-line no-console

  render() {
    const { taxonomy, locationServices = [] } = this.props;
    return (
      <div className="text-left">
        <NavBar title="Services recap" />
        <div className="mb-5">
          <div className="py-5 px-3 container">
            <Header>
              Please fill in all the information available for each of the services at this
              location:
            </Header>
          </div>

          {taxonomy.map(category => (
            <div key={category.id}>
              <SectionHeader title={category.name} icon={getCategoryIcon(category.name)} />
              {locationServices
                .filter(service => service.parent_id === category.id)
                .map(service => <ListItem key={service.id} service={service} />)}
            </div>
          ))}
        </div>
        <div className="position-fixed" style={{ right: 0, bottom: 0, left: 0 }}>
          <Button fluid primary onClick={this.onNext}>
            Next
          </Button>
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  taxonomy: state.db.taxonomy,
  locationServices: state.db.locationServices,
});

export default connect(mapStateToProps)(ServicesRecap);
