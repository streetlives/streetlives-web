import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Header from '../../../components/header';
import Button from '../../../components/button';
import Icon from '../../../components/icon';
import TextArea from '../../../components/textarea';
import withCommentsForm from '../withCommentsForm';

const LISTENING_STATUS = {
  IDLE: 'IDLE',
  LOADING: 'LOADING',
  LISTENING: 'LISTENING',
};

class CommentText extends Component {
  constructor() {
    super();

    this.state = {
      supportsSpeech: Object.prototype.hasOwnProperty.call(window, 'webkitSpeechRecognition'),
      listeningStatus: LISTENING_STATUS.IDLE,
    };

    this.recognition = null;

    this.onTextChange = this.onTextChange.bind(this);
    this.toggleSpeechToText = this.toggleSpeechToText.bind(this);
  }

  onTextChange(event) {
    this.props.onChange(event.target.value);
  }

  toggleSpeechToText() {
    // TODO: Send GA event, etc.

    if (this.state.listeningStatus !== LISTENING_STATUS.IDLE) {
      this.recognition.stop();
      this.setState({ listeningStatus: LISTENING_STATUS.IDLE });
      return;
    }

    this.setState({ listeningStatus: LISTENING_STATUS.LOADING });

    // eslint-disable-next-line new-cap
    this.recognition = new window.webkitSpeechRecognition();

    // TODO: Keep trying to make continuous work.
    this.recognition.continuous = false;
    this.recognition.interimResults = true;

    this.recognition.onstart = () => {
      this.setState({ listeningStatus: LISTENING_STATUS.LISTENING });
    };

    this.recognition.onresult = (event) => {
      let transcript = '';
      for (let i = 0; i < event.results.length; i += 1) {
        transcript += event.results[i][0].transcript;
      }
      this.props.onChange(transcript);
    };

    this.recognition.onend = () => {
      this.setState({ listeningStatus: LISTENING_STATUS.IDLE });
    };

    this.recognition.onerror = (event) => {
      this.recognition.stop();
      this.setState({ listeningStatus: LISTENING_STATUS.IDLE });
    };

    this.recognition.start();
  }

  render() {
    const instructions =
      'How was your experience? If you like, please add your first name or initals at the end.' +
      ' Please do not leave your full name';

    return (
      <div>
        <div className="px-4 pb-5">
          <Header size="large" className="mb-3 text-left">
            Tell us what you think about {this.props.organizationName}
          </Header>
          {this.state.supportsSpeech && (
            <Icon
              onClick={this.toggleSpeechToText}
              name={
                this.state.listeningStatus === LISTENING_STATUS.LISTENING ?
                  'ellipsis-h' :
                  'microphone'
                }
            />
          )}
          <TextArea
            placeholder={instructions}
            value={this.props.value}
            minRows={12}
            onChange={this.onTextChange}
            fluid
          />
        </div>
        <div className="mx-5">
          <Button
            onClick={this.props.onSubmit}
            disabled={!this.props.value}
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
}

CommentText.propTypes = {
  organizationName: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
};

export default withCommentsForm(CommentText);
