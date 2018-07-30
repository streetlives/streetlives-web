import React from 'react';
import PropTypes from 'prop-types';
import Header from '../../../components/header';
import Button from '../../../components/button';
import TextArea from '../../../components/textarea';

function CommentText(props) {
  const instructions = 'Share what is good (or bad) here, based on your experience.'
    + ' (If you want, add your name or initials at the end.)';

  return (
    <div>
      <Header size="large" className="mb-5 mx-5 text-left">{props.name}</Header>
      <TextArea
        placeholder={instructions}
        value={props.value}
        minRows={3}
        onChange={props.onChange}
        fluid
        className="ml-5 pr-5"
      />
      <div className="w-100 position-absolute" style={{ bottom: 0 }}>
        <Button
          onClick={props.onSubmit}
          disabled={!props.value}
          primary
          fluid
          className="mt-3"
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
