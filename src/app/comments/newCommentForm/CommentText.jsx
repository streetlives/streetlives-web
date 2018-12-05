import React, { Component } from 'react';
import PropTypes from 'prop-types';
import GoogleAnalytics from 'react-ga';
import Header from '../../../components/header';
import Button from '../../../components/button';
import Icon from '../../../components/icon';
import TextArea from '../../../components/textarea';
import ListeningIndicator from '../../../components/listeningIndicator';
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
      currentTranscript: '',
    };

    this.recognition = null;

    this.onTextChange = this.onTextChange.bind(this);
    this.startSpeechToText = this.startSpeechToText.bind(this);
  }

  onTextChange(event) {
    this.props.onChange(event.target.value);
  }

  getCurrentCommentText() {
    if (this.state.listeningStatus !== LISTENING_STATUS.LISTENING) {
      return this.props.value;
    }

    if (!this.props.value) {
      return this.state.currentTranscript;
    }

    return `${this.props.value}\n${this.state.currentTranscript}`;
  }

  startSpeechToText() {
    GoogleAnalytics.event({
      category: 'User',
      action: 'Speech-to-text clicked',
    });

    this.setState({ listeningStatus: LISTENING_STATUS.LOADING });

    // eslint-disable-next-line new-cap
    this.recognition = new window.webkitSpeechRecognition();

    this.recognition.continuous = false;
    this.recognition.interimResults = true;

    this.recognition.onstart = () => {
      this.setState({
        listeningStatus: LISTENING_STATUS.LISTENING,
        currentTranscript: '',
      });
    };

    this.recognition.onresult = (event) => {
      let transcript = '';
      for (let i = 0; i < event.results.length; i += 1) {
        transcript += event.results[i][0].transcript;
      }
      this.setState({ currentTranscript: transcript });
    };

    this.recognition.onend = () => {
      if (this.state.currentTranscript) {
        this.props.onChange(this.getCurrentCommentText());
      }
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
      'How was your experience? If you like, please add your first name or initials at the end.' +
      ' Please do not leave your full name';

    const isListening = this.state.listeningStatus === LISTENING_STATUS.LISTENING;

    return (
      <div>
        <div className="px-4 pb-5">
          <Header size="large" className="mb-3 text-left">
            Tell us what you think about {this.props.organizationName}
          </Header>
          <div>
            {instructions}
          </div>
        </div>
        {isListening && <ListeningIndicator className="mt-3" />}
        <div className="fixed-bottom p-2 border d-flex flex-row bg-light">
          <TextArea
            value={this.getCurrentCommentText()}
            onChange={this.onTextChange}
            autoFocus
            fluid
            rounded
            className={`flex-1 py-2 pl-2 pr-${this.state.supportsSpeech ? '4' : '2'} border`}
          />
          <div className="align-self-end" style={{ position: 'relative' }}>
            {this.state.supportsSpeech && !isListening && (
              <Icon
                onClick={this.startSpeechToText}
                name="microphone"
                className="border rounded-circle py-1 px-2 mb-2"
                style={{
                  backgroundColor: '#F8E71C',
                  position: 'absolute',
                  right: '3px',
                  bottom: '0px',
                }}
              />
            )}
          </div>
          <Button
            onClick={this.props.onSubmit}
            disabled={!this.props.value}
            primary
            className="py-1 ml-1 mb-2 align-self-end"
          >
            ADD
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

export default withCommentsForm(CommentText, { hideInfoLink: true });
