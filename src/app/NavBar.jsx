import React from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';

function NavBar({ title, history }) {
  return (
    <div style={{ backgroundColor: '#333333' }} className="text-white">
      <div className="container">
        <div className="row d-flex justify-content-between align-items-center p-2">
          <div style={{width:'100%',height:'100%',textAlign:'center', position:'relative'}}>
      
            <a
              style={{ 
                fontSize: '14px',
                position: 'absolute',
                left: 0,
                top: '.25em'
              }}
              className="font-weight-light"
              onClick={() => history.goBack()}
            >
              &lt;Back
            </a>
            <span style={{ fontSize: '18px' }} className="font-weight-bold m-0">
              {title}
            </span>
            <a
              style={{ 
                fontSize: '14px',
                position: 'absolute',
                right: 0,
                top: '.25em'
              }}
              className="font-weight-light"
              onClick={() => history.push('/')}
            >
              <i className="fa fa-close" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

NavBar.propTypes = {
  title: PropTypes.string.isRequired,
};

export default withRouter(NavBar);
