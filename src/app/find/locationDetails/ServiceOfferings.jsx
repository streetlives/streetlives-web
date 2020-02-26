import React from 'react';
import InfoItem from './InfoItem';

const formatWearerAge = values => (values.length ? `Clothing for ${values.join(', ')}` : null);

const formatTgncClothing = values => (
  (values.length === 1 && values[0] === 'true') ?
    'TGNC affirmative experience' :
    null
);

const formatClothingOccasion = values =>
  (values.length ? `Provides ${values.join(', ')} clothing` : null);

const formatHasHivNutrition = values => (
  (values.length === 1 && values[0] === 'true') ?
    'Includes PLHIV Nutrition program' :
    null
);

const attributeFormatters = {
  wearerAge: formatWearerAge,
  tgncClothing: formatTgncClothing,
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
    <InfoItem icon="user">
      {formattedAttributes && formattedAttributes.map(attribute => (
        <div key={attribute}>
          {attribute}
        </div>
      ))}
    </InfoItem>
  );
};

export default ServiceOfferings;
