import React, { Fragment, Component } from 'react';
import moment from 'moment';
import { DAYS, OCCASIONS } from '../../../Constants';
import { getCategoryIcon } from '../../../services/iconography';
import Icon from '../../../components/icon';
import PhoneLink from '../../../components/phoneLink';
import InfoItem from './InfoItem';
import ServiceRestrictions from './ServiceRestrictions';
import ServiceOfferings from './ServiceOfferings';
import './locationDetails.css';

const renderSchedule = (schedule) => {
  if (schedule.length === 7 &&
    schedule.every(day => day.opens_at === '00:00:00' && day.closes_at === '23:59:00')) {
    return 'Open 24/7';
  }

  const dayNumberToName = weekday => DAYS[weekday - 1];

  const formatHour = time => moment(time, 'HH:mm:ss').format('LT').replace(':00 ', ' ');
  const formatHours = (opens, closes) => `${formatHour(opens)} to ${formatHour(closes)}`;

  const formatRange = ({ start, end }) => {
    if (end === start) {
      return dayNumberToName(start);
    }
    if (end === start + 1) {
      return `${dayNumberToName(start)} & ${dayNumberToName(end)}`;
    }
    return `${dayNumberToName(start)} to ${dayNumberToName(end)}`;
  };

  const orderedSchedule = schedule.sort(({ weekday: day1 }, { weekday: day2 }) => day1 - day2);

  const daysGroupedByHours = orderedSchedule.reduce((grouped, day) => {
    const hoursString = formatHours(day.opens_at, day.closes_at);
    return { ...grouped, [hoursString]: [...(grouped[hoursString] || []), day.weekday] };
  }, {});

  const groupStrings = Object.keys(daysGroupedByHours).map((hoursString) => {
    const dayRanges = [];
    const remainingWeekdays = daysGroupedByHours[hoursString];

    while (remainingWeekdays.length) {
      const currentDayRange = dayRanges[dayRanges.length - 1];
      const day = remainingWeekdays.shift();

      if (currentDayRange && currentDayRange.end === day - 1) {
        currentDayRange.end = day;
      } else {
        dayRanges.push({ start: day, end: day });
      }
    }

    return `${dayRanges.map(formatRange).join(', ')} ${hoursString}`;
  });

  return `Open ${groupStrings.join(', ')}`;
};

const renderService = (service, isLastItem) => {
  const coronavirusInfo = service.EventRelatedInfos &&
    service.EventRelatedInfos.filter(({ event }) => event === OCCASIONS.COVID19);

  const schedule = service.HolidaySchedules &&
    service.HolidaySchedules.filter(({ occasion, closed }) => occasion === OCCASIONS.COVID19);
  const isScheduleKnown = schedule && schedule.length;

  let isClosed = false;
  let openDays;
  if (isScheduleKnown) {
    openDays = schedule.filter(({ closed }) => !closed);

    if (!openDays.length) {
      isClosed = true;
    }
  }

  return (
    <div
      key={service.id}
      style={{
        borderBottom: isLastItem ? '0' : '1px solid #DADADA',
        paddingBottom: '1.3vh',
      }}
    >
      <div size="medium" className="specificServiceHeaders">
        {service.name || service.Taxonomies[0].name}
        {isClosed && <span className="coronavirusInfo"> (suspended)</span>}
      </div>

      {!!(coronavirusInfo && coronavirusInfo.length) && (
        <InfoItem coronavirus icon="exclamation-triangle">
          {coronavirusInfo[0].information}
        </InfoItem>
      )}

      {!isClosed && (
        <Fragment>
          {!!service.description && (
            <div className="serviceDescription">
              {service.description}
            </div>
          )}

          <ServiceRestrictions
            eligibilities={service.Eligibilities}
            requiredDocuments={service.RequiredDocuments}
          />

          {openDays && (
            <InfoItem coronavirus icon="clock">{renderSchedule(openDays)}</InfoItem>
          )}

          {service.Phones && service.Phones.map(phone => (
            <InfoItem key={phone.id} icon="phone">
              <PhoneLink {...phone} className="locationLinks" />
            </InfoItem>
          ))}

          <ServiceOfferings attributes={service.ServiceTaxonomySpecificAttributes} />
        </Fragment>
      )}
    </div>
  );
};

class CategoryCard extends Component {
  state = {
    collapsed: false
  }

  handleCollapse = () => {
    this.setState({ collapsed: !this.state.collapsed })
  }

  render() {
    const { category, services, className } = this.props;

    return (
      <div
        className="categoryCard"
        style={{
          backgroundColor: '#F8F8FC',
          border: '1px solid #DADADA',
        }}
      >
        <div
          className="serviceCategoryHeadersContainer"
          onClick={this.handleCollapse}
        >
          <div className="serviceCategoryHeaders">{category}</div>
          <Icon
            name={getCategoryIcon(category)}
            size="2x"
          />
        </div>

        <div className={this.state.collapsed ? 'collapsed' : ''}>
          {services
            .sort((service1, service2) => service2.lastUpdate - service1.lastUpdate)
            .map((service, i) => renderService(service, i === services.length - 1))}
        </div>
      </div>
    )
  }
};

export default CategoryCard;
