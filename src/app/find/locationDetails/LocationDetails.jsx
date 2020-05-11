import React, { Component } from 'react';
import moment from 'moment';
import Modal from '../../../components/modal';
import Header from '../../../components/header';
import Icon from '../../../components/icon';
import PhoneLink from '../../../components/phoneLink';
import WebsiteLink from '../../../components/websiteLink';
import ErrorBoundary from '../../../components/errorBoundary';
import { OCCASIONS } from '../../../Constants';
import CategoryCard from './CategoryCard';
import './locationDetails.css';

const getLatestActionDate = (metadata) => {
  const dates = metadata && metadata
    .filter(field => field.last_action_date)
    .map(field => new Date(field.last_action_date));
  return new Date((dates && dates.length) ? Math.max(...dates) : 0);
};

const mapServiceToLastUpdate = (service) => {
  const metadata = service.metadata.service;
  return { ...service, lastUpdate: getLatestActionDate(metadata) };
};

const getLocationLastUpdate = (location, servicesWithLastUpdate) => {
  const lastLocationUpdate = getLatestActionDate(location.metadata.location);
  const serviceUpdates = servicesWithLastUpdate.map(({ lastUpdate }) => lastUpdate);

  const latestUpdate = new Date(Math.max(lastLocationUpdate, ...serviceUpdates));
  if (!latestUpdate.getTime()) {
    return null;
  }

  return latestUpdate;
};

const groupByCategory = services => services.reduce((grouped, service) => {
  if (!service.Taxonomies || !service.Taxonomies.length) {
    return grouped;
  }

  const [category] = service.Taxonomies;
  const rootCategory = category.parent_name || category.name;

  const currentCategory = grouped[rootCategory];
  const currentCategoryServices = currentCategory && currentCategory.services;
  const currentLastUpdate = currentCategory && currentCategory.lastUpdate;

  const groupLastUpdate = (currentLastUpdate && currentLastUpdate > service.lastUpdate) ?
    currentLastUpdate :
    service.lastUpdate;

  return {
    ...grouped,
    [rootCategory]: {
      services: currentCategoryServices ? [...currentCategoryServices, service] : [service],
      lastUpdate: groupLastUpdate,
    },
  };
}, {});

const renderAddress = (address) => {
  const addressString = `${address.street}, ${address.city}, ${address.postalCode}`;
  const directionsLink =
    `https://www.google.com/maps/dir/?api=1&destination=${encodeURI(addressString)}`;
  return (
    <a className="locationLinks" href={directionsLink} target="_blank" rel="noopener noreferrer">
      {addressString}
    </a>
  );
};

const renderCategoriesLine = (services) => {
  const categories = Object.keys(services.reduce((currCategories, service) => ({
    ...currCategories,
    [service.Taxonomies[0].name]: true,
  }), {}));
  return <div className="detailPageCategories">{categories.join(' & ')}</div>;
};

// returns an array of sorted category names with preference for search option and last update, in that order
const sortedCategoryNames = (categories, searchCategoryName) => {
  return Object.keys(categories).sort((categoryNameA, categoryNameB) => {
    // searched category should always go on top
    if (categoryNameA === searchCategoryName) {
      return -1;
    }
    if (categoryNameB === searchCategoryName) {
      return 1;
    }

    // otherwise sort categories initially by date last updated
    return categories[categoryNameB].lastUpdate - categories[categoryNameA].lastUpdate;
  });
};

const renderLocation = (location, searchCategory) => {
  const coronavirusInfo = location.EventRelatedInfos &&
    location.EventRelatedInfos.filter(({ event }) => event === OCCASIONS.COVID19);
  const isClosed = !!(coronavirusInfo && coronavirusInfo.length);

  const servicesWithLastUpdate = location.Services.map(mapServiceToLastUpdate);
  const servicesByCategory = groupByCategory(servicesWithLastUpdate);

  const locationLastUpdate = getLocationLastUpdate(location, servicesWithLastUpdate);

  const phones = [];
  if (location.Organization.Phones) {
    phones.push(...location.Organization.Phones);
  }
  if (location.Phones) {
    location.Phones.forEach((phone) => {
      if (!phones.find(existingPhone => existingPhone.number === phone.number)) {
        phones.push(phone);
      }
    });
  }

  return (
    <div className="px-3 mb-5">
      <Header size="medium" className="locationTitle">{location.Organization.name}</Header>
      {isClosed ? <p className="text-left coronavirusInfo">*{coronavirusInfo[0].information}</p> : (
        <div className="text-left">
          {locationLastUpdate && (
            <div className="lastUpdateLine coronavirusInfo">
              <Icon custom name="coronavirus" className="lastUpdateIcon" />
              <div className="updateText">
                Information during coronavirus pandemic was
                <span className="updateTime"> updated {moment(locationLastUpdate).fromNow()}.</span>
              </div>
            </div>
          )}

          {renderCategoriesLine(location.Services)}

          <Header size="large" className="locationHeaders">Address</Header>
          {renderAddress(location.address)}

          {location.Organization.url && (
            <div>
              <Header size="large" className="locationHeaders">Website</Header>
              <WebsiteLink url={location.Organization.url} className="locationLinks" />
            </div>
          )}

          {phones.length > 0 && (
            <div>
              <Header size="large" className="locationHeaders">Phone Number</Header>
              {phones.map(phone => (
                <div key={phone.id}>
                  <PhoneLink {...phone} className="locationLinks" />
                </div>
              ))}
            </div>
          )}

          {location.AccessibilityForDisabilities.length > 0 && (
            <div>
              <Header size="large" className="locationHeaders">Accessibility</Header>
              {location.AccessibilityForDisabilities.map(accessibility => (
                <p className="accessibilityText" key={accessibility.id}>
                  {accessibility.details || accessibility.accessibility}
                </p>
              ))}
            </div>
          )}

          <Header size="large" className="locationHeaders">Services Offered:</Header>
          {sortedCategoryNames(servicesByCategory, searchCategory)
            .map(category => (
              <CategoryCard
                key={category}
                className="my-3"
                category={category}
                isInitiallyExpanded={searchCategory === category}
                services={servicesByCategory[category].services}
              />
            ))}
        </div>
      )}
    </div>
  );
};

class LocationDetails extends Component {
  componentDidMount() {
    if (!this.props.location) {
      this.props.fetchLocation();
    }
  }

  render() {
    const {
      location,
      locationError,
      goBack,
      searchCategory,
    } = this.props;

    return (
      <Modal className="pb-4">
        <div className="mx-3 mt-4 position-relative">
          <Icon
            name="times"
            onClick={goBack}
            style={{
              position: 'absolute',
              right: 0,
              top: '0.2em',
            }}
          />
        </div>
        {locationError && (
          <div className="d-flex align-items-center h-100">
            Sorry, an error occurred loading data about this location.
          </div>
        )}
        <ErrorBoundary>
          {location ? renderLocation(location, searchCategory) : null}
        </ErrorBoundary>
      </Modal>
    );
  }
}

export default LocationDetails;
