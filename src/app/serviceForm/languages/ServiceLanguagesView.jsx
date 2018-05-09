import React from 'react';
import PropTypes from 'prop-types';
import ConfirmationOptions from '../../../components/form/ConfirmationOptions';

const styles = {
  borderColor: '#EDEDED',
  backgroundColor: '#FCFCFC',
};
function ServiceLanguagesView(props) {
  return (
    <div className="w-100">
      <div style={{ fontSize: '13px' }} className="font-weight-bold mt-2">
        LANGUAGES
      </div>
      <ul className="list-group my-4 border" style={styles}>
        {props.value.map(language => <li className="list-group-item border-0">{language.name}</li>)}
      </ul>
      <ConfirmationOptions onConfirm={props.onConfirm} onEdit={props.onEdit} />
    </div>
  );
}

ServiceLanguagesView.propTypes = {
  onConfirm: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
};

export default ServiceLanguagesView;
