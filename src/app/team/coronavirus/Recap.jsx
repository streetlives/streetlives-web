import React from 'react';
import Button from '../../../components/button';
import NavBar from '../../../components/navBar';

function Recap({ history, match, location }) {
  return (
    <div className="d-flex flex-column">
      <NavBar
        backButtonTarget={location.pathname.slice(0, location.pathname.indexOf('/location'))}
        title="Coronavirus Version"
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
          <div className="p-4">
            <div>
              <img
                src="/img/coronavirus.png"
                alt=""
              />
            </div>

            <div className="mt-4">
              Please only enter/edit data that is relevant during the Coronavirus pandemic.
            </div>
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
          onClick={() =>
            history.push(`${location.pathname.slice(
              0,
              location.pathname.indexOf('/recap'),
            )}/isClosed`)}
        >
          Got it
        </Button>
      </div>
    </div>
  );
}

export default Recap;
