import React from 'react';
import { withRouter } from 'react-router-dom';
import Button from '../../../components/button';
import NavBar from '../../../components/navBar';

function Recap({ history, match }) {
  return (
    <div className="d-flex flex-column">
      <NavBar
        backButtonTarget="/team"
        title="Recap"
      />
      <div
        style={{
          backgroundColor: '#525252',
          position: 'absolute',
          top: '2.6em',
          bottom: '2.6em',
          right: 0,
          left: 0,
          overflowY: 'auto',
        }}
        className="text-white text-left font-weight-light"
      >
        <div className="container">
          <div className="row p-4">
            <p>
              The <strong>Streetlives Street Team Tool (SSTT)</strong> is for gathering and
              validating vital information, that people can trust, on programs and resources in NYC.
            </p>
            <p className="mt-2">
              At this time we will mainly be collecting details on places that help the community
              with food and/or shelter, including organization names, contact info, operation hours
              and eligibility.
            </p>
            <p className="mt-2">
              Visiting places in person and carefully checking everything step by step, means we can
              be sure information is good and up to date.
            </p>
          </div>
        </div>
      </div>
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
        }}
      >
        <Button
          fluid
          primary
          onClick={() => history.push(`/team/location/${match.params.locationId}`)}
        >
          Let&apos;s Get Started
        </Button>
      </div>
    </div>
  );
}

export default withRouter(Recap);
