import React from 'react';
import PropTypes from 'prop-types';

import './Dropdown.css';

function ListItem({ label, onClick }) {
  return (
    <li className="list-group-item" onClick={onClick} onKeyPress={onClick} role="menuitem">
      {label}
    </li>
  );
}

function Dropdown(props) {
  return (
    <ul className="list-group list-group-flush">
      {props.options.map(option => (
        <ListItem
          key={option.id}
          label={option.label}
          onClick={option.onClick}
        />
      ))}
    </ul>
  );
}

Dropdown.propTypes = {
  options: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    onClick: PropTypes.func.isRequired,
  })).isRequired,
};

export default Dropdown;
