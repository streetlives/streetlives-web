import React, { Component } from 'react';
import { connect } from 'react-redux';

import ServiceFormRoutes, { filterServiceFields, SERVICE_FIELDS } from './routes';
import ServiceForm from './ServiceForm';

import { getServiceTaxonomy } from '../../../selectors/service';

class ServiceFormContainer extends Component {
  constructor(props) {
    super(props);
    this.onNext = this.onNext.bind(this);
    this.onBack = this.onBack.bind(this);

    const { serviceTaxonomy } = this.props;
    this.routes = serviceTaxonomy ? filterServiceFields(serviceTaxonomy) : SERVICE_FIELDS;
  }

  componentWillReceiveProps(nextProps) {
    const { serviceTaxonomy } = nextProps;
    this.routes = filterServiceFields(serviceTaxonomy);
  }

  onBack = () => {
    const prevRoute = this.routes[this.getCurrentIndex() - 1];
    this.props.history.push(`${this.getServiceUrl()}${prevRoute.urlFragment}`);
  };

  onNext = () => {
    const idx = this.getCurrentIndex();
    if (idx === this.routes.length - 1) {
      this.props.history.push(`${this.getServiceUrl()}/documents`);
    } else {
      const nextRoute = this.routes[this.getCurrentIndex() + 1];
      this.props.history.push(`${this.getServiceUrl()}${nextRoute.urlFragment}`);
    }
  };

  getServiceUrl = () => {
    const { locationId, serviceId } = this.props.match.params;
    return `/team/location/${locationId}/services/${serviceId}`;
  };

  getCurrentIndex = () => {
    const { fieldName } = this.props.match.params;
    return this.routes.map(({ urlFragment }) => urlFragment.split('/').pop()).indexOf(fieldName);
  };

  render() {
    const index = this.getCurrentIndex();
    const currentRoute = this.routes[index];

    return (
      <ServiceForm
        onNext={this.onNext}
        onBack={this.onBack}
        backButtonTarget={this.getServiceUrl()}
        currentIndex={index}
        currentRoute={currentRoute}
        totalRoutes={this.routes.length}
      >
        <ServiceFormRoutes onNext={this.onNext} />
      </ServiceForm>
    );
  }
}

const mapStateToProps = (state, ownProps) => ({
  serviceTaxonomy: getServiceTaxonomy(state, ownProps),
});

export default connect(mapStateToProps)(ServiceFormContainer);
