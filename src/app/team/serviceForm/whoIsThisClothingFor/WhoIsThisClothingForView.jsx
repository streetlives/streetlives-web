import React from 'react';
import PropTypes from 'prop-types';

import Selector from '../../../../components/selector';
import ConfirmationOptions from '../../../../components/form/ConfirmationOptions';

import { getLabelsFromWearerAge } from './options';

function WhoIsThisClothingForView({ value, onConfirm, onEdit }) {
  return (
    <div className="w-100">
      <div style={{ fontSize: '13px', marginBottom: '1em' }} className="font-weight-bold mt-2">
        Who is this clothing for?
      </div>

      <Selector fluid>
        {
          value && getLabelsFromWearerAge(value).map(name => (
            <Selector.Option
              key={`selector-${name}`}
              active
              hide={false}
            >
              {name}
            </Selector.Option>
          ))
        }
      </Selector>
      <ConfirmationOptions onConfirm={onConfirm} onEdit={onEdit} />
    </div>
  );
}

WhoIsThisClothingForView.propTypes = {
  value: PropTypes.arrayOf(PropTypes.string),
  onConfirm: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
};

export default WhoIsThisClothingForView;
