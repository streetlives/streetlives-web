import React from 'react';
import Modal from '../../../../../components/modal';
import Header from '../../../../../components/header';
import Button from '../../../../../components/button';
import Icon from '../../../../../components/icon';

const TgncAlert = ({ onContinue, onBack }) => (
  <Modal compact className="text-left px-4 py-4">
    <Icon name="exclamation" custom />
    <Header size="medium" className="mt-4">
      Just so you know
    </Header>
    <div className="my-4">
      We apologize to those looking for a non-binary gender service. At this time most providers are
      only offering clothing closets for either male or female gender identities.
      <br />
      You could zoom out to find more results on the map. Or go back to redo the search.
    </div>
    <Button onClick={onContinue} primary fluid className="mt-4 position-relative">
      <Icon
        name="check"
        style={{
          position: 'absolute',
          left: 16,
          lineHeight: 'inherit',
        }}
      />
      See results
    </Button>
    <Button onClick={onBack} secondary fluid className="mt-4 position-relative">
      <Icon
        name="times"
        style={{
          position: 'absolute',
          left: 16,
          lineHeight: 'inherit',
        }}
      />
      Go back
    </Button>

  </Modal>
);

export default TgncAlert;
