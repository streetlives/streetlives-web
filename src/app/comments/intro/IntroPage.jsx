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
          Comments are anonymous. By using this site you agree to our
          <a
            className="ml-1"
            href="https://policies.google.com/technologies/partner-sites"
            target="_blank"
            rel="noopener noreferrer"
          >
            guidelines
          </a>
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
