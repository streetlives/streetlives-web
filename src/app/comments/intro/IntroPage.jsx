import React from 'react';
import IntroComponent from './IntroComponent';
import withCommentsForm from '../withCommentsForm';
import config from '../../../config';

function IntroPage(props) {
  return (
    <IntroComponent
      name={props.organizationName}
      footer={(
        <small>
          Comments are anonymous unless you choose to share identifying information.
          By using this site you agree to our
          <a
            href={config.termsOfUseUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-1"
          >
            Terms of use
          </a>,
          <a
            href={config.privacyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mx-1"
          >
            Privacy Policy
          </a>
          and
          <a
            href={config.commentGuidelinesUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-1"
          >
            Guidelines
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
