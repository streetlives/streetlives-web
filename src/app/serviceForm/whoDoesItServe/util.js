import React from 'react';
import { EVERYONE } from '../../../constants';

export const formatLabel = (groupName, minAge, maxAge) => (
  <div>
    <span>{groupName}</span> 
    <span>
      {
        EVERYONE === groupName ? 
          '' :
          (
            (minAge || maxAge) ? 
            ` (${minAge}${maxAge ? `-${maxAge}` : '+' })` :
            ' (all ages)'
          )
      }
    </span>
  </div>
)

export const isEditing = (value) => !Array.isArray(value)
