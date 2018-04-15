import React from 'react';
import PropTypes from 'prop-types';

function ProgressBar({ step, steps }) {
  const progress = Number(step / steps) * 100;
  const width = 100 - progress;
  return (
    <div
      style={{ backgroundColor: '#c4c4c4', fontSize: '14px' }}
      className="text-left font-weight-light p-1 position-relative"
    >
      <div
        style={{
          backgroundColor: '#F8E71C',
          top: 0,
          bottom: 0,
          left: 0,
          right: `${width}%`,
          zIndex: 0,
        }}
        className="position-absolute"
      />
      <div className="container">
        <div className="row px-4">
          <span style={{ zIndex: 1 }}>
            Progress {step}/{steps} completed
          </span>
        </div>
      </div>
    </div>
  );
}

ProgressBar.propTypes = {
  step: PropTypes.number.isRequired,
  steps: PropTypes.number.isRequired,
};

export default ProgressBar;
