import React from 'react';
import Icon from '../../../components/icon';

const formatWearerAge = values => (values.length ? `Clothing for ${values.join(', ')}` : null);

const formatClothingOccasion = values =>
  (values.length ? `Provides ${values.join(', ')} clothing` : null);

const formatHasHivNutrition = values => (
  (values.length === 1 && values[0] === 'true') ?
    'Provides HIV+ nutrition' :
    null
);

const attributeFormatters = {
  wearerAge: formatWearerAge,
  clothingOccasion: formatClothingOccasion,
  hasHivNutrition: formatHasHivNutrition,
};

const formatAttribute = (attributeName, values) => {
  const formatter = attributeFormatters[attributeName];
  if (formatter) {
    return formatter(values);
  }
  return `Offers ${values.join(', ')}`;
};

const ServiceOfferings = ({ attributes = [] }) => {
  const formattedAttributes = attributes.map(attribute => formatAttribute(
    attribute.attribute.name,
    attribute.values,
  )).filter(attribute => attribute != null);

  if (!formattedAttributes.length) {
    return null;
  }

  return (
    <div className="mb-3">
      <Icon name="user" size="medium" className="float-left mt-1" />
      <div className="ml-4 pl-1">
        {formattedAttributes && formattedAttributes.map(attribute => (
          <div key={attribute}>
            {attribute}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ServiceOfferings;
