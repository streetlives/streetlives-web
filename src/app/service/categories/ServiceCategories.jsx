import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import * as api from '../../../services/api';
import * as actions from '../../../actions';
import Header from '../../../components/header';
import Accordion from '../../../components/accordion';
import Selector from '../../../components/selector';
import Button from '../../../components/button';
import getCategoryIcon from '../util/getCategoryIcon';

import NavBar from '../../NavBar';

const LoadingView = () => (
  <div className="d-flex flex-column">
    <NavBar title="Services info" />
    <p>
      <i className="fa fa-spinner fa-spin" aria-hidden="true" /> Loading location data ...{' '}
    </p>
  </div>
);

class ServiceCategories extends Component {
  state = {
    active: -1,
    selected: {},
    currentCategories: {},
    isLoading: false,
  };

  componentWillMount() {
    if (!this.props.taxonomy) {
      this.props.getTaxonomy();
    }
    if (!this.props.location) {
      const { locationId } = this.props.match.params;
      this.props.getLocation(locationId);
    }
  }

  componentWillReceiveProps(nextProps, prevState) {
    if (nextProps.location !== this.props.location) {
      const { Services } = nextProps.location;
      let currentCategories = {};
      Services.forEach((service) => {
        service.Taxonomies.forEach((category) => {
          currentCategories = { ...currentCategories, [category.id]: category };
        });
      });
      this.setState({ currentCategories });
    }
  }

  onToggleOpen = value =>
    this.setState(({ active }) => ({ active: active !== value ? value : -1 }));

  onSelect = (category) => {
    const { selected } = this.state;
    const selection = selected[category.id];
    this.setState({ selected: { ...selected, [category.id]: !selection } });
  };

  onGoToRecap = () => {
    const { locationId } = this.props.match.params;
    this.props.history.push(`/location/${locationId}/services/recap`);
  };

  onSubmit = () => {
    const { selected } = this.state;
    const { locationId } = this.props.match.params;
    this.setState({ isLoading: true });
    const locationTaxonomies = this.props.taxonomy
      .reduce((flat, key) => [...flat, ...key.children], [])
      .filter(taxonomy => selected[taxonomy.id]);

    api
      .createServices(locationId, locationTaxonomies)
      .then(() => this.onGoToRecap())
      .catch(error => console.log('error', error)); // eslint-disable-line no-console
  };

  getIsActive = id => this.state.selected[id] || this.state.currentCategories[id];

  render() {
    const {
      active, selected, currentCategories, isLoading,
    } = this.state;
    const { taxonomy = [], location } = this.props;

    if (!taxonomy || !location || isLoading) {
      return <LoadingView />;
    }

    return (
      <div className="text-left">
        <NavBar title="Services info" />
        <div className="mb-5">
          <div className="py-5 px-3 container">
            <Header>What programs and services are available at this location?</Header>
          </div>
          <Accordion>
            {taxonomy.map((category, i) => (
              <div key={category.id}>
                <Accordion.Item
                  active={active === category.id}
                  onClick={() => this.onToggleOpen(category.id)}
                  title={category.name}
                  icon={getCategoryIcon(category.name)}
                />
                <Accordion.Content active={active === category.id}>
                  <Selector fluid>
                    {category.children.map(item => (
                      <Selector.Option
                        key={item.id}
                        onClick={() => this.onSelect(item)}
                        active={selected[item.id] || currentCategories[item.id]}
                        disabled={currentCategories[item.id]}
                      >
                        {item.name}
                      </Selector.Option>
                    ))}
                    <Selector.Option align="center">
                      + Add another {category.name.toLowerCase()} service
                    </Selector.Option>
                  </Selector>
                </Accordion.Content>
              </div>
            ))}
          </Accordion>
        </div>
        <div className="position-fixed" style={{ right: 0, bottom: 0, left: 0 }}>
          <Button fluid primary onClick={this.onSubmit}>
            Next
          </Button>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state, ownProps) => ({
  location: state.db[ownProps.match.params.locationId],
  taxonomy: state.db.taxonomy,
});

const mapDispatchToProps = (dispatch, ownProps) => ({
  getLocation: bindActionCreators(actions.getLocation, dispatch),
  getTaxonomy: bindActionCreators(actions.getTaxonomy, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(ServiceCategories);
