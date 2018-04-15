import React from 'react';
import PropTypes from 'prop-types';
import ConfirmationOptions from '../ConfirmationOptions';
import Header from '../../../components/header';

function LocationNameEdit(props) {
  // TODO: Style title, probably turn into component, etc.
  return (
    <div>
      <div style={{ fontSize: '13px' }} className="font-weight-bold mt-2">
        LOCATION NAME (OPTIONAL)
      </div>
      <Header>{props.name}</Header>
      <ConfirmationOptions onConfirm={props.onConfirm} onEdit={props.onEdit} />
    </div>
  );
}

LocationNameEdit.propTypes = {
  name: PropTypes.string.isRequired,
  onConfirm: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
};

export default LocationNameEdit;
