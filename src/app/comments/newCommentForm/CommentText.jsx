import React from 'react';
import PropTypes from 'prop-types';
import Header from '../../../components/header';
import Button from '../../../components/button';
import TextArea from '../../../components/textarea';

const fullScreenStyles = {
  position: 'absolute',
  top: '0',
  left: '0',
  width: '100%',
  height: '100%',
  overflow: 'auto',
};

function CommentText(props) {
  const instructions =
  'How was your experience? If you like, please add your name or initals at the end';

  // TODO: Update the textarea styles based on the new designs.
  return (
    <div style={{ fullScreenStyles }}>
      <div className="px-4 pb-5">
        <Header size="large" className="mb-3 text-left">{props.name}</Header>
        <TextArea
          placeholder={instructions}
          value={props.value}
          minRows={3}
          onChange={props.onChange}
          fluid
        />
      </div>
      <div className="mx-5">
        <Button
          onClick={props.onSubmit}
          disabled={!props.value}
          primary
          fluid
          className="fixed-bottom mt-3"
        >
          ADD COMMENT
        </Button>
      </div>
    </div>
  );
}

CommentText.propTypes = {
  name: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
};

export default CommentText;
