import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';

import { selectLocationData, selectLocationError } from '../../../selectors/location';
import { getTaxonomy } from '../../../selectors/taxonomy';
import * as actions from '../../../actions';
import Button from '../../../components/button';
import Header from '../../../components/header';
import SectionHeader from '../../../components/sectionHeader';
import getCategoryIcon from '../util/getCategoryIcon';
import ThanksOverlay, { overlayStyles } from '../../locationForm/thanks/ThanksOverlay';
import LoadingLabel from '../../../components/form/LoadingLabel';
import ErrorLabel from '../../../components/form/ErrorLabel';

import NavBar from '../../NavBar';
import ListItem from './ListItem';

const thanksHeader = 'Great work!';
const thanksContent =
  'Thank you on behalf of all the people who use social services and community programs in NYC!';

class ServicesRecap extends Component {
  state = { services: [] };

  componentDidMount() {
    const { locationId } = this.props.match.params;
    this.props.getLocation(locationId);

    if (!this.props.taxonomy) {
      this.props.getTaxonomy();
    }
  }

  componentWillReceiveProps(nextProps, prevState) {
    if (!nextProps.locationError &&
      nextProps.locationData &&
      nextProps.locationData !== this.props.locationData) {
      const services =
        nextProps.locationData.Services &&
        nextProps.locationData.Services.map((service) => {
          const serviceTaxonomy = service.Taxonomies[0];
          if (!serviceTaxonomy) {
            return null;
          }

          const serviceRootCategory = serviceTaxonomy.parent_id || serviceTaxonomy.id;
          return { ...service, categoryId: serviceRootCategory };
        }).filter(service => service !== null);

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
    const { taxonomy = [], locationError } = this.props;
    const { services = [] } = this.state;

    if (locationError) {
      return <ErrorLabel errorMessage={locationError} />;
    }

    if (!taxonomy || !services) {
      return <LoadingLabel />;
    }

    const showThanks = this.props.location.pathname.split('/').pop() === 'thanks';

    return (
      <div className="text-left">
        <div style={overlayStyles(showThanks)}>
          <ThanksOverlay.GaussianBlur />
          <NavBar
            backButtonTarget={`/location/${this.props.match.params.locationId}/services`}
            title="Services recap"
          />
          <div style={{ marginBottom: '1em' }} className="px-3 container">
            <Header>
              Please fill in all the information available for each of the services at this
              location:
            </Header>
          </div>

          {taxonomy.map(category => (
            <div key={category.id}>
              <SectionHeader title={category.name} icon={getCategoryIcon(category.name)} />
              {services
                .filter(service => service.categoryId === category.id)
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
  locationData: selectLocationData(state, ownProps),
  locationError: selectLocationError(state, ownProps),
  taxonomy: getTaxonomy(state, ownProps),
});

const mapDispatchToProps = (dispatch, ownProps) => ({
  getLocation: bindActionCreators(actions.getLocation, dispatch),
  getTaxonomy: bindActionCreators(actions.getTaxonomy, dispatch),
});

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(ServicesRecap));
