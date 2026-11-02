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
  readSchedule, isSpecialHours, groupAtoms, describeCard, describeClosure, describeSpecialHours,
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
  ...row,
  weekday: row.weekday ? DAYS[(row.weekday + 6) % 7] : null,
  opensAt: row.opens_at && row.opens_at.slice(0, 5),
  closesAt: row.closes_at && row.closes_at.slice(0, 5),
  validFrom: row.valid_from,
  validTo: row.valid_to,
});

// Plain weekly hours as before ("Open Monday to Friday 9 AM to 5 PM"), then every other card
// of hours in words ("1st and 3rd Sat of every month: 9AM to 5PM. Skips Nov 14"), then closures
// that repeat and special hours such as holidays.
const renderFullSchedule = (openDays, specialRows) => {
  const { atoms, closures, specialHours } =
    readSchedule([...openDays, ...specialRows].map(toEditorRow));
  const cards = groupAtoms(atoms);
  const isPlainWeekly = card => card.freq === 'WEEKLY' && card.interval <= 1 &&
    !card.months.length && !card.validFrom && !card.validTo && !card.exdates.length &&
    card.ranges.every(range => !range.description);
  const plainDays = new Set(cards.filter(isPlainWeekly).flatMap(card => card.days
    .flatMap(day => card.ranges.map(range => `${day}|${range.opensAt}|${range.closesAt}`))));
  const weekly = openDays.filter(row => plainDays.has(`${DAYS[(row.weekday + 6) % 7]}|` +
    `${row.opens_at && row.opens_at.slice(0, 5)}|${row.closes_at && row.closes_at.slice(0, 5)}`));

  const lines = [
    ...(weekly.length ? [renderSchedule(weekly)] : []),
    ...cards.filter(card => !isPlainWeekly(card)).map(describeCard),
    ...closures.map(closure => `Closed: ${describeClosure(closure)}`),
    ...specialHours.map(describeSpecialHours),
  ];
  return lines.map(line => <div key={line}>{line}</div>);
};

// Special hours and closures that repeat: neither says whether the service runs at all.
const isSpecialRow = row => isSpecialHours(toEditorRow(row)) || (row.closed && !!row.freq);

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
