import React from 'react';
import IntroComponent from './IntroComponent';
import withCommentsForm from '../withCommentsForm';

function IntroPage(props) {
  return (
    <IntroComponent
      name={props.organizationName}
      className="flex-grow-1 h-100"
      footer={(
        <small>
          Comments are anonymous unless you choose to share identifying information.
          By using this site you agree to our
          <a href="/tou" className="ml-1">Terms of use</a>,
          <a href="/privacy" className="mx-1">Privacy Policy</a>
          and Guidelines
        </small>
      )}
      buttonText="LET’S GET STARTED"
      onClick={() => {
        props.history.push(`/comments/${props.match.params.locationId}/view`);
      }}
    />
  );
}

export default withCommentsForm(IntroPage, { hideInfoLink: true });
