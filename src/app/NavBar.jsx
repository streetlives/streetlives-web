import React from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';

function NavBar({ title, history }) {
  return (
    <div style={{ backgroundColor: '#333333' }} className="text-white">
      <div className="container">
        <div className="row d-flex justify-content-between align-items-center p-2">
          <a
            style={{ fontSize: '14px' }}
            className="font-weight-light"
            onClick={() => history.goBack()}
          >
            Back
          </a>
          <span style={{ fontSize: '18px' }} className="font-weight-bold m-0">
            {title}
          </span>
          <a
            style={{ fontSize: '14px' }}
            className="font-weight-light"
            onClick={() => history.push('/')}
          >
            <i className="fa fa-close" />
          </a>
        </div>
      </div>
    </div>
  );
}

NavBar.propTypes = {
  title: PropTypes.string.isRequired,
  history: PropTypes.any,
};

export default withRouter(NavBar);
