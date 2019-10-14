import React from 'react';

const formatWearerAge = values => (values.length ? `Clothing for ${values.join(', ')}` : null);

const formatClothingOccasion = values => (values.length ? `${values.join(', ')} clothing` : null);

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

const ServiceOfferings = ({ attributes }) => (
  <div>
    {attributes && attributes.map(serviceAttribute => (
      <div key={serviceAttribute.id}>
        {formatAttribute(serviceAttribute.attribute.name, serviceAttribute.values)}
      </div>
    ))}
  </div>
);

export default ServiceOfferings;
