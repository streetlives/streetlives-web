import React, { useState } from 'react';
import moment from 'moment';
import PhoneLink from '../../../components/phoneLink';
import ServiceOfferings from './ServiceOfferings';
import ServiceRestrictions from './ServiceRestrictions';
import Icon from '../../../components/icon';
import { DAYS, OCCASIONS } from '../../../Constants';
import InfoItem from './InfoItem';

const renderSchedule = (schedule) => {
  if (schedule.length === 7 &&
    schedule.every(day => day.opens_at === '00:00:00' && day.closes_at === '23:59:00')) {
    return 'Open 24/7';
  }

  const dayNumberToName = weekday => DAYS[weekday - 1];

  const formatHour = time => moment(time, 'HH:mm:ss')
    .format('LT')
    .replace(':00 ', ' ')
    .replace(/(11:59 PM)|(12 AM)/, 'midnight');

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

function ServiceSection({ service, showOnMount }) {
  const [isExpanded, setIsExpanded] = useState(showOnMount);

  const coronavirusInfo =
    service.EventRelatedInfos &&
    service.EventRelatedInfos.filter(({ event }) => event === OCCASIONS.COVID19);

  const schedule =
    service.HolidaySchedules &&
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

  const handleKeyPress = (e) => {
    // toggle service info on 'enter' key
    if (e.keyCode === 13) {
      setIsExpanded(!isExpanded);
    }
  };

  const serviceDetails = [];

  const hasCoronavirusInfo = Boolean(coronavirusInfo && coronavirusInfo.length);

  if (hasCoronavirusInfo) {
    serviceDetails.push((
      <InfoItem key="coronavirusInfo" coronavirus icon="exclamation-triangle">
        {coronavirusInfo[0].information}
      </InfoItem>
    ));
  }

  if (!isClosed) {
    const {
      description,
      Eligibilities: eligibilities,
      RequiredDocuments: requiredDocuments,
      Phones: phones,
      ServiceTaxonomySpecificAttributes: taxonomySpecificAttributes,
    } = service;

    if (description) {
      serviceDetails.push((
        <div key="description" className="serviceDescription">{description}</div>
      ));
    }

    if ((eligibilities && eligibilities.length)
      || (requiredDocuments && requiredDocuments.length)) {
      serviceDetails.push((
        <ServiceRestrictions
          key="restrictions"
          eligibilities={eligibilities}
          requiredDocuments={requiredDocuments}
        />
      ));
    }

    if (openDays) {
      serviceDetails.push((
        <InfoItem key="schedule" coronavirus icon="clock">
          {renderSchedule(openDays)}
        </InfoItem>
      ));
    }

    if (phones && phones.length) {
      serviceDetails.push(phones.map(phone => (
        <InfoItem key={phone.id} icon="phone">
          <PhoneLink {...phone} className="locationLinks" />
        </InfoItem>
      )));
    }

    if (taxonomySpecificAttributes && taxonomySpecificAttributes.length) {
      serviceDetails.push((
        <ServiceOfferings key="offerings" attributes={taxonomySpecificAttributes} />
      ));
    }
  }

  return (
    <div
      key={service.id}
      className="serviceSection"
    >
      <div
        {...(serviceDetails.length ? {
          className: 'specificServiceHeaders expandableHeaders',
          onClick: () => setIsExpanded(!isExpanded),
          onKeyDown: handleKeyPress,
          role: 'button',
          tabIndex: '0',
        } : {
          className: 'specificServiceHeaders',
        })}
      >
        {(serviceDetails.length > 0) &&
          <span className="expandArrow">
            <Icon name={isExpanded ? 'chevron-down' : 'chevron-right'} />
          </span>
        }
        {service.name || service.Taxonomies[0].name}
        {isClosed && <span className="coronavirusInfo"> (suspended)</span>}
      </div>

      {isExpanded &&
        <div className="serviceDetails">
          {serviceDetails}
        </div>
      }
    </div>
  );
}

export default ServiceSection;
