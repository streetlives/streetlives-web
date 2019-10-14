import React from 'react';
import cx from 'classnames';
import { DAYS } from '../../../constants';
import { getCategoryIcon } from '../../../services/iconography';
import Icon from '../../../components/icon';
import Header from '../../../components/header';
import PhoneLink from '../../../components/phoneLink';
import InfoItem from './InfoItem';
import ServiceRestrictions from './ServiceRestrictions';
import ServiceOfferings from './ServiceOfferings';

const renderSchedule = (schedule) => {
  const dayNumberToName = weekday => DAYS[weekday - 1];
  const formatHours = (opens, closes) => `${opens.substring(0, 5)} to ${closes.substring(0, 5)}`;
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

const CategoryCard = ({ category, services, className }) => (
  <div
    className={cx('shadow pb-2 px-3 position-relative', className)}
    style={{
      backgroundColor: '#F8F8FC',
      border: '1px solid #DADADA',
    }}
  >
    <div>
      <Header size="large">{category}</Header>
      <Icon
        name={getCategoryIcon(category)}
        size="2x"
        style={{
          position: 'absolute',
          right: '0.7em',
          top: '0.7em',
        }}
      />
    </div>

    {services.map((service, i) => (
      <div
        key={service.id}
        style={{ borderBottom: i === services.length - 1 ? '0' : '1px solid #DADADA' }}
      >
        <Header size="medium" className="mb-2">
          {service.Taxonomies[0].parent_name ? service.Taxonomies[0].name : service.name}
        </Header>

        {!!service.description && (
          <div className="mb-3">
            {service.description}
          </div>
        )}

        <ServiceRestrictions
          eligibilities={service.Eligibilities}
          requiredDocuments={service.RequiredDocuments}
        />

        {service.RegularSchedules && service.RegularSchedules.length > 0 && (
          <InfoItem icon="clock">{renderSchedule(service.RegularSchedules)}</InfoItem>
        )}

        {service.Phones && service.Phones.map(phone => (
          <InfoItem key={phone.id} icon="phone">
            <PhoneLink {...phone} />
          </InfoItem>
        ))}

        <ServiceOfferings attributes={service.ServiceTaxonomySpecificAttributes} />
      </div>
    ))}
  </div>
);

export default CategoryCard;
