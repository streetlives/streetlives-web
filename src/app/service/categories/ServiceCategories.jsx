import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import * as actions from '../../../actions';
import Header from '../../../components/header';
import Accordion from '../../../components/accordion';
import Selector from '../../../components/selector';
import Button from '../../../components/button';

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
  state = { active: 0, selected: {} };

  componentWillMount() {
    if (!this.props.taxonomy) {
      this.props.getTaxonomy();
    }
  }

  onToggleOpen = value =>
    this.setState(({ active }) => ({ active: active !== value ? value : -1 }));

  onSelect = (category) => {
    const { selected } = this.state;
    const selection = selected[category.id];
    this.setState({ selected: { ...selected, [category.id]: !selection } });
  };

  onSubmit = () => {
    const { selected } = this.state;
    const { locationId } = this.props.match.params;
    const locationServices = this.props.taxonomy.filter(service => selected[service.id]);
    this.props.selectCategories(locationId, locationServices);
    this.props.history.push(`/location/${locationId}/services/recap`);
  };

  render() {
    const { active, selected } = this.state;
    const { taxonomy } = this.props;

    if (!taxonomy) {
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
            <Accordion.Item
              active={active === 0}
              onClick={() => this.onToggleOpen(0)}
              title="All Services"
              icon="home"
            />
            <Accordion.Content active={active === 0}>
              <Selector fluid>
                {taxonomy.map(category => (
                  <Selector.Option
                    key={category.id}
                    onClick={() => this.onSelect(category)}
                    active={selected[category.id]}
                  >
                    {category.name}
                  </Selector.Option>
                ))}
                <Selector.Option align="center">+ Add another shelter service</Selector.Option>
              </Selector>
            </Accordion.Content>
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

const mapStateToProps = state => ({
  taxonomy: state.db.taxonomy,
});

const mapDispatchToProps = (dispatch, ownProps) => ({
  getTaxonomy: bindActionCreators(actions.getTaxonomy, dispatch),
  selectCategories: bindActionCreators(actions.selectCategories, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(ServiceCategories);
