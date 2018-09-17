import React from 'react';
import PropTypes from 'prop-types';
import Header from '../../../components/header';
import Button from '../../../components/button';
import TextArea from '../../../components/textarea';
import withCommentsForm from '../withCommentsForm';

function CommentText(props) {
  const instructions =
    'How was your experience? If you like, please add your first name or initals at the end.' +
    ' Please do not leave your full name';

  return (
    <div>
      <div className="px-4 pb-5">
        <Header size="large" className="mb-3 text-left">
          Tell us what you think about {props.organizationName}
        </Header>
        <TextArea
          placeholder={instructions}
          value={props.value}
          minRows={12}
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
          NEXT
        </Button>
      </div>
    </div>
  );
}

CommentText.propTypes = {
  organizationName: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
};

export default withCommentsForm(CommentText);
