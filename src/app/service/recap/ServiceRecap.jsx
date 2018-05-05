import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import * as actions from '../../../actions';
import Button from '../../../components/button';
import Header from '../../../components/header';
import SectionHeader from '../../../components/sectionHeader';
import getCategoryIcon from '../util/getCategoryIcon';

import NavBar from '../../NavBar';
import ListItem from './ListItem';

const LoadingView = () => (
  <div className="d-flex flex-column">
    <NavBar title="Services recap" />
    <p>
      <i className="fa fa-spinner fa-spin" aria-hidden="true" /> Loading location data ...{' '}
    </p>
  </div>
);
class ServicesRecap extends Component {
  state = { services: [] };

  componentWillMount() {
    const { locationId } = this.props.match.params;
    this.props.getLocation(locationId);

    if (!this.props.taxonomy) {
      this.props.getTaxonomy();
    }
  }

  componentWillReceiveProps(nextProps, prevState) {
    if (nextProps.location !== this.props.location) {
      const services = nextProps.location.Services.map(service => ({
        ...service,
        parent_id: service.Taxonomies[0] && service.Taxonomies[0].parent_id,
      }));
      this.setState({ services });
    }
  }

  onNext = () => console.log('Clicked Next'); // eslint-disable-line no-console

  render() {
    const { taxonomy = [] } = this.props;
    const { services = [] } = this.state;

    if (!taxonomy || !services) {
      return <LoadingView />;
    }

    return (
      <div className="text-left">
        <NavBar 
          backButtonTarget={`/location/${this.props.match.params.locationId}/services`}
          title="Services recap" />
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
              {services
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

const mapStateToProps = (state, ownProps) => ({
  taxonomy: state.locations.taxonomy,
  location: state.locations[ownProps.match.params.locationId],
});

const mapDispatchToProps = (dispatch, ownProps) => ({
  getLocation: bindActionCreators(actions.getLocation, dispatch),
  getTaxonomy: bindActionCreators(actions.getTaxonomy, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(ServicesRecap);
