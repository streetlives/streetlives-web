import { Component } from 'react';
import GoogleAnalytics from 'react-ga4';

const LISTENING_STATUS = {
  IDLE: 'IDLE',
  LOADING: 'LOADING',
  LISTENING: 'LISTENING',
};

export default class Speech extends Component {
  state = {
    listeningStatus: LISTENING_STATUS.IDLE,
    currentTranscript: '',
    isSpeechSupported: Object.prototype.hasOwnProperty.call(window, 'webkitSpeechRecognition'),
  };

  getText = () => {
    if (!this.props.initialValue) {
      return this.state.currentTranscript;
    }

    if (this.state.listeningStatus !== LISTENING_STATUS.LISTENING) {
      return this.props.initialValue;
    }

    return `${this.props.initialValue}\n${this.state.currentTranscript}`;
  };

  startSpeechToText = () => {
    GoogleAnalytics.event({
      category: 'User',
      action: 'Speech-to-text clicked',
    });

    // eslint-disable-next-line new-cap
    this.recognition = new window.webkitSpeechRecognition();

    this.setState({ listeningStatus: LISTENING_STATUS.LOADING });

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

      if (this.props.onInterimText) {
        this.props.onInterimText(this.getText());
      }
      this.setState({ currentTranscript: transcript });
    };

    this.recognition.onend = () => {
      const text = this.getText();
      this.setState({ listeningStatus: LISTENING_STATUS.IDLE }, () => {
        if (this.state.currentTranscript) {
          this.props.onGotText(text);
        }
      });
    };

    this.recognition.onerror = (event) => {
      this.recognition.stop();
      this.setState({ listeningStatus: LISTENING_STATUS.IDLE });
    };

    this.recognition.start();
  };

  render() {
    return this.props.children({
      isSpeechSupported: this.state.isSpeechSupported,
      isListening: this.state.listeningStatus === LISTENING_STATUS.LISTENING,
      currentTranscript: this.getText(),
      startSpeechToText: this.startSpeechToText,
    });
  }
}
