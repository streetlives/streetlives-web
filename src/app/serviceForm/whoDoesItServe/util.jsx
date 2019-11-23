import React from 'react';
import { EVERYONE } from 'constants';

const ifMinOrMaxAge = (minAge, maxAge) => (
  (minAge || maxAge) ?
    ` (${minAge}${maxAge ? `-${maxAge}` : '+'})` :
    ' (all ages)'
);

export const formatLabel = (groupName, minAge, maxAge) => (
  <div>
    <span>{groupName}</span>
    <span>
      {
        EVERYONE === groupName ?
          '' :
          ifMinOrMaxAge(minAge, maxAge)
      }
    </span>
  </div>
);

export const isEditing = value => !Array.isArray(value);
