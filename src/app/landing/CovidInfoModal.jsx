import React from 'react';
import { withRouter, Link } from 'react-router-dom';
import config from '../../config';
import Modal from '../../components/modal';
import Header from '../../components/header';
import Button from '../../components/button';

function CovidInfoModal({ history }) {
  return (
    <Modal compact>
      <div className="m-4"><img src="/img/virus.png" alt="virus icon" /></div>
      <Header size="large" className="m-4 flex-grow-1">
        Covid-19 Version
      </Header>
      <div className="covidModalInner">
        <div>
          <p>
            During the pandemic we will show when information on every location was last updated,
            but please contact providers before accessing their services.
          </p>
          <p>At this time some of our regular features may not be available.</p>
        </div>
        <div>
          <div className="px-3">
            <Link to="/find">
              <Button onClick={() => {}} primary fluid> Great, continue </Button>
            </Link>
          </div>
          <div className="text-center legal">
            <a
              href={config.termsOfUseUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              Terms of Use
            </a>
            {' '}and{' '}
            <a href={config.privacyUrl} target="_blank" rel="noopener noreferrer">Privacy Policy</a>
          </div>
        </div>
      </div>
    </Modal>
  );
}

export default withRouter(CovidInfoModal);
