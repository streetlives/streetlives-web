import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';

import { getLocation } from '../../../selectors/location';
import { getTaxonomy } from '../../../selectors/taxonomy';
import * as actions from '../../../actions';
import Button from '../../../components/button';
import Header from '../../../components/header';
import SectionHeader from '../../../components/sectionHeader';
import getCategoryIcon from '../util/getCategoryIcon';
import ThanksOverlay, { overlayStyles } from '../../locationForm/thanks/ThanksOverlay';

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

const thanksHeader = 'Great work!';
const thanksContent =
  'Thank you on behalf of all the people who use social services and community programs in NYC!';

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
    if (nextProps.locationData && nextProps.locationData !== this.props.locationData) {
      const services =
        nextProps.locationData.Services &&
        nextProps.locationData.Services.map(service => ({
          ...service,
          parent_id: service.Taxonomies[0] && service.Taxonomies[0].parent_id,
        }));
      this.setState({ services });
    }
  }

  onNext = () => {
    const { locationId } = this.props.match.params;
    this.props.history.push(`/location/${locationId}/services/recap/thanks`);
  };

  onNextSection = () => this.props.history.push('/');

  onBackSection = () =>
    this.props.history.push(`/location/${this.props.match.params.locationId}/services/recap`);

  render() {
    const { taxonomy = [] } = this.props;
    const { services = [] } = this.state;

    if (!taxonomy || !services) {
      return <LoadingView />;
    }

    console.log('props', this.props);
    // const showThanks = true;
    const showThanks = this.props.location.pathname.split('/').pop() === 'thanks';

    return (
      <div className="text-left">
        <div style={overlayStyles(showThanks)}>
          <ThanksOverlay.GaussianBlur />
          <NavBar
            backButtonTarget={`/location/${this.props.match.params.locationId}/services`}
            title="Services recap"
          />
          <div style={{marginBottom:'1em'}} className="px-3 container">
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
          <div className="position-fixed" style={{ right: 0, bottom: 0, left: 0 }}>
            <Button fluid primary onClick={this.onNext}>
              DONE
            </Button>
          </div>
        </div>
        {showThanks && (
          <ThanksOverlay
            header={thanksHeader}
            content={thanksContent}
            nextLabel="BACK TO THE MAP"
            backLabel="KEEP EDITING"
            onNextSection={this.onNextSection}
            onBackSection={this.onBackSection}
          />
        )}
      </div>
    );
  }
}

const mapStateToProps = (state, ownProps) => ({
  locationData: getLocation(state, ownProps),
  taxonomy: getTaxonomy(state, ownProps),
});

const mapDispatchToProps = (dispatch, ownProps) => ({
  getLocation: bindActionCreators(actions.getLocation, dispatch),
  getTaxonomy: bindActionCreators(actions.getTaxonomy, dispatch),
});

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(ServicesRecap));
