import React from 'react';
import { EVERYONE } from '../../../../Constants';

const ifMinOrMaxAge = (age_min, age_max) => {
  const hasMin = age_min !== undefined && age_min !== null;
  const hasMax = age_max !== undefined && age_max !== null;

  if (!hasMin && !hasMax) return ' (all ages)';
  if (!hasMin && hasMax) return ` (under ${age_max})`;
  if (hasMin && !hasMax) return ` (${age_min}+)`;
  return ` (${age_min}-${age_max})`;
};

export const formatLabel = (groupName, age_min, age_max) => (
  <div>
    <span>{groupName}</span>
    <span>
      {
        EVERYONE === groupName ?
          ((age_min !== undefined && age_min !== null) || (age_max !== undefined && age_max !== null)
            ? ifMinOrMaxAge(age_min, age_max)
            : '') :
          ifMinOrMaxAge(age_min, age_max)
      }
    </span>
  </div>
);

export const isEditing = value => !Array.isArray(value);
