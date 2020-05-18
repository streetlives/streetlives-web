import React from 'react';
import { withRouter } from 'react-router-dom';
import Modal from '../../components/modal';
import Header from '../../components/header';
import Button from '../../components/button';
import Icon from '../../components/icon';

function CovidInfoModal({ history, closeModal }) {
  const toMap = (e) => {
    e.preventDefault();
    history.push('/find');
  };

  return (
    <Modal compact>
      <div className="covidTopBar">
        <div className="m-4"><img src="/img/virus.png" alt="virus icon" /></div>
        <div onClick={closeModal} className="closeBtn">
          <Icon name="times" />
        </div>
      </div>

      <Header size="large" className="m-4 flex-grow-1">
        Covid-19 Version
      </Header>
      <div className="covidModalInner">
        <div>
          <p>During the pandemic we will show when information on every location was last updated, but please contact providers before accessing their services.</p>
          <p>At this time some of our regular features may not be available.</p>
        </div>
        <div>
          <div className="px-3">
            <Button primary fluid onClick={toMap}> Great, continue </Button>
          </div>
          <div className="text-center legal">
            <a href="https://docs.google.com/document/d/e/2PACX-1vTBNI2Sv5QC8DSBwBL7WHNBdMI-9kPLuN2ev_Y2VDSo-bLeh8qssi7iBv-w0EEQurX9fgFQF4_2lItn/pub" target="_blank" rel="noopener noreferrer">Terms of Use</a>
            and
            <a href="https://docs.google.com/document/d/e/2PACX-1vQ8djXWiASXKkcKJ2LSHNXMgrQ1PhQPskSs_Thk5oLTZMnKvMy7Nqz1t4Xs18mGGKuORXOj8yNNhJUq/pub" target="_blank" rel="noopener noreferrer">Privacy Policy</a>
          </div>
        </div>
      </div>
    </Modal>
  );
}

export default withRouter(CovidInfoModal);
