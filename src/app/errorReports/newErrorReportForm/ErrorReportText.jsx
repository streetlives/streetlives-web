import React from 'react';
import PropTypes from 'prop-types';
import Header from '../../../components/header';
import Button from '../../../components/button';
import TextArea from '../../../components/textarea';
import withErrorReportsForm from '../withErrorReportsForm';

const ErrorReportText = (props) => {
  const {
    errorReportText,
    onChange,
    onSubmit,
  } = props;

  return (
    <div>
      <Header size="large" className="locationTitle">Error Report</Header>
      <div className="mx-4 mb-3 text-left">
        <div className="w-100 mr-5">
          <Header size="medium" className="mb-3">
            Please provide the correction below
            <br />
            (Please don&#39;t enter any private information)
          </Header>
        </div>
      </div>
      <div>
        <div className="mx-4 mb-1">
          <TextArea
            value={errorReportText}
            onChange={onChange}
            minRows={7}
            autoFocus
            fluid
            className="border"
          />
        </div>
        <div className="mx-4 mb-1">
          <Button
            onClick={onSubmit}
            primary
            fluid
          >
            Done
          </Button>
        </div>
        <div className="mx-4">
          <Button
            onClick={() => console.log('Cancel button triggered. Still need to implement function.')}
            secondary
            fluid
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
};

ErrorReportText.propTypes = {
  errorReportText: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
};

export default withErrorReportsForm(ErrorReportText, { hideInfoLink: true });
