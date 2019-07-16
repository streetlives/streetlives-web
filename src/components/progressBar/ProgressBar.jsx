import React from 'react';
import cx from 'classnames';
import PropTypes from 'prop-types';
import './ProgressBar.css';

function ProgressBar({ step, steps, className }) {
  const classNames = cx('ProgressBar', className);

  const progress = Number(step / steps) * 100;
  const width = 100 - progress;
  return (
    <div className={classNames}>
      <div className="ProgressBarValue" style={{ right: `${width}%` }} />
      <div className="container">
        <div className="row px-4">
          <span className="ProgressBarText">
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
