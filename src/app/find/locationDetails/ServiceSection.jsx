import React, { useState } from 'react';
import moment from 'moment';
import orderBy from 'lodash.orderby';
import PhoneLink from '../../../components/phoneLink';
import ServiceOfferings from './ServiceOfferings';
import ServiceRestrictions from './ServiceRestrictions';
import Icon from '../../../components/icon';
import { DAYS, OCCASIONS } from '../../../Constants';
import InfoItem from './InfoItem';
import {
  readSchedule, isSpecialHours, describeWeeks, describeSeason, describeSpecialHours,
} from '../../team/serviceForm/openingHours/recurrence';

const renderSchedule = (schedule) => {
  if (schedule.length === 7 &&
    schedule.every(day => day.opens_at === '00:00:00' && day.closes_at === '23:59:00')) {
    return 'Open 24/7';
  }

  const dayNumberToName = weekday => DAYS[weekday - 1];

  const formatHour = (time) => {
    const regexMidnight = /(23:59:00)|(00:00:00)/;
    if (regexMidnight.test(time)) {
      return 'midnight';
    }
    return moment(time, 'HH:mm:ss').format('LT').replace(':00 ', ' ');
  };

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

  const orderedSchedule = orderBy(schedule, ['weekday', 'opens_at']);

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

// The API rows in the shape the street-team editor's recurrence helpers read.
const toEditorRow = row => ({
  weekday: row.weekday ? DAYS[row.weekday - 1] : null,
  opensAt: row.opens_at,
  closesAt: row.closes_at,
  closed: row.closed,
  validFrom: row.valid_from,
  validTo: row.valid_to,
  byday: row.byday,
  description: row.description,
});

// Weekly hours as before, then hours that only apply on some weeks of the month
// ("1st and 2nd Fridays of the month: 9 AM to 5 PM"), the season they run in, and
// special hours such as holidays.
const renderFullSchedule = (openDays, specialRows) => {
  const {
    weekPatterns, validFrom, validTo, specialHours,
  } = readSchedule([...openDays, ...specialRows].map(toEditorRow));
  const weeksFor = row => weekPatterns[DAYS[row.weekday - 1]] || [];
  const weekly = openDays.filter(row => !weeksFor(row).length);
  const monthly = orderBy(openDays.filter(row => weeksFor(row).length), ['weekday', 'opens_at']);

  const formatHour = time => moment(time, 'HH:mm:ss').format('LT').replace(':00 ', ' ');
  const lines = [
    ...(weekly.length ? [renderSchedule(weekly)] : []),
    ...monthly.map(row => `${describeWeeks(DAYS[row.weekday - 1], weeksFor(row))}: ` +
      `${formatHour(row.opens_at)} to ${formatHour(row.closes_at)}`),
    ...(openDays.length && describeSeason({ validFrom, validTo })
      ? [describeSeason({ validFrom, validTo })] : []),
    ...specialHours.map(describeSpecialHours),
  ];
  return lines.map(line => <div key={line}>{line}</div>);
};

const isSpecialRow = row => isSpecialHours(toEditorRow(row));

function ServiceSection({ service, showOnMount }) {
  const [isExpanded, setIsExpanded] = useState(showOnMount);

  const coronavirusInfo =
    service.EventRelatedInfos &&
    service.EventRelatedInfos.filter(({ event }) => event === OCCASIONS.CLOSURE || event === OCCASIONS.COVID19);

  const holidaySchedules =
    service.HolidaySchedules &&
    service.HolidaySchedules.filter(({ occasion }) => occasion === OCCASIONS.CLOSURE || occasion === OCCASIONS.COVID19);
  // Special hours (holidays and other dates) don't say whether the service runs at all.
  const schedule = holidaySchedules && holidaySchedules.filter(row => !isSpecialRow(row));
  const specialRows = (holidaySchedules || []).filter(isSpecialRow);
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

    if ((openDays && openDays.length) || specialRows.length) {
      serviceDetails.push((
        <InfoItem key="schedule" coronavirus icon="clock">
          {renderFullSchedule(openDays || [], specialRows)}
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
