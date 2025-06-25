import React from 'react';
import { EVERYONE } from '../../../../Constants';

const ifMinOrMaxAge = (age_min, age_max) => (
  (age_min || age_max) ?
    ` (${age_min}${age_max ? `-${age_max}` : '+'})` :
    ' (all ages)'
);

export const formatLabel = (groupName, age_min, age_max) => (
  <div>
    <span>{groupName}</span>
    <span>
      {
        EVERYONE === groupName ?
          '' :
          ifMinOrMaxAge(age_min, age_max)
      }
    </span>
  </div>
);

export const isEditing = value => !Array.isArray(value);
