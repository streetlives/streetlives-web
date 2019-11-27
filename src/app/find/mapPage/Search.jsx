import React, { Component } from 'react';
import Speech, { ListeningIndicator } from '../../../components/speech';
import Icon from '../../../components/icon';
import { getCategoryIcon } from '../../../services/iconography';
import './search.css';

class Search extends Component {
  state = {
    isEnteringSearchString: false,
    modifiedSearchString: '',
    suggestionForString: null,
  };

  enterSearchMode = () => {
    if (!this.state.isEnteringSearchString) {
      this.setState({ isEnteringSearchString: true });
    }
  };

  cancelSearchMode = () => {
    this.setState({ isEnteringSearchString: false });
  };

  updateSearchString = (event) => {
    const { suggestions } = this.props;
    const newString = event.target.value;

    const lowerString = newString.toLowerCase();
    const suggestedCategory = (newString && suggestions) ?
      suggestions.find(suggestion => suggestion.name.toLowerCase().includes(lowerString)) :
      null;

    this.setState({
      modifiedSearchString: newString,
      suggestionForString: suggestedCategory,
    });
  };

  updateSearchStringFromSpeech = (searchString) => {
    this.setState({ modifiedSearchString: searchString });
  }

  submitSearchString = () => {
    const searchString = this.state.modifiedSearchString;
    this.setState({
      isEnteringSearchString: false,
      modifiedSearchString: '',
      suggestionForString: null,
    }, () => this.props.onSubmitString(searchString));
  };

  submitSuggestion = () => {
    const suggestion = this.state.suggestionForString;
    this.setState({
      isEnteringSearchString: false,
      modifiedSearchString: '',
      suggestionForString: null,
    }, () => this.props.onSubmitSuggestion(suggestion));
  };

  renderSearchOverlay = () => (
    <div
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        right: 0,
        zIndex: 3,
        height: this.state.isEnteringSearchString ? '100%' : 0,
        transition: 'height 0.2s',
        backgroundColor: '#F8F8FC',
      }}
    >
      {this.state.suggestionForString && (
        <div
          className="font-weight-bold m-2 py-2 px-3 rounded shadow d-flex align-items-center"
          style={{
            position: 'relative',
            top: 50,
            backgroundColor: 'blue',
            color: 'white',
          }}
          onClick={this.submitSuggestion}
          onKeyDown={e => e.keyCode === 13 && this.submitSuggestion()}
          role="button"
          tabIndex={0}
        >
          <Icon
            name={getCategoryIcon(this.state.suggestionForString.name)}
            size="lg"
            className="mr-3"
          />
          Show all places that provide {this.state.suggestionForString.name.toLowerCase()}
        </div>
      )}
    </div>
  );

  renderSpeechElements = () => (
    <Speech
      onInterimText={this.updateSearchStringFromSpeech}
      onGotText={this.submitSearchString}
    >
      {({
        isSpeechSupported,
        isListening,
        startSpeechToText,
      }) => isSpeechSupported && (
        isListening ? (
          <div
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              right: 0,
              bottom: 0,
              zIndex: 3,
              backgroundColor: '#F8F8FC',
            }}
          >
            <div style={{ position: 'relative', top: '50%' }}>
              <ListeningIndicator />
            </div>
          </div>
        ) : (
          <div className="voiceToText_btn">
            <Icon
              onClick={startSpeechToText}
              name="microphone"
              className="voiceToText_icon"
              size="2x"
            />
          </div>
        )
      )}
    </Speech>
  );

  // TODO: Add the icon to the tab order or whatnot.
  renderSearchBar = () => (
    <div
      className="p-2"
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        right: 0,
        zIndex: 4,
      }}
    >
      <form className="input-group" onSubmit={this.submitSearchString} >
        {this.state.isEnteringSearchString && (
          <div
            className="backSearch"
            onClick={this.cancelSearchMode}
          >
            <svg className="backSearchChevron" width="8" height="14" viewBox="0 0 8 14" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" clipRule="evenodd" d="M7.70711 0.292893C8.09763 0.683417 8.09763 1.31658 7.70711 1.70711L2.41421 7L7.70711 12.2929C8.09763 12.6834 8.09763 13.3166 7.70711 13.7071C7.31658 14.0976 6.68342 14.0976 6.29289 13.7071L0.292893 7.70711C-0.0976311 7.31658 -0.0976311 6.68342 0.292893 6.29289L6.29289 0.292893C6.68342 -0.0976311 7.31658 -0.0976311 7.70711 0.292893Z" />
            </svg>

          </div>
        )}
        <input
          onChange={this.updateSearchString}
          onFocus={this.enterSearchMode}
          style={{
 border: 'none', borderRadius: 0, boxShadow: 'none', minHeight: '50px',
}}
          type="text"
          className="form-control"
          placeholder="Find what you need"
          value={this.state.modifiedSearchString}
          required
        />
        {this.state.isEnteringSearchString && (
          <button
            type="submit"
            className="searchSubmit"
          >
            <svg className="searchIcon_white" width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" clipRule="evenodd" d="M0.5 5.47761C0.5 2.72855 2.72855 0.5 5.47761 0.5C8.22667 0.5 10.4552 2.72855 10.4552 5.47761C10.4552 6.55476 10.1131 7.552 9.53154 8.36658C9.6016 8.40471 9.66777 8.45368 9.72785 8.51375L13.6315 12.4174L12.4178 13.6311L8.51416 9.72744C8.45414 9.66743 8.40539 9.60112 8.36755 9.53085C7.5528 10.1128 6.55519 10.4552 5.47761 10.4552C2.72855 10.4552 0.5 8.22667 0.5 5.47761ZM5.47761 2.04605C3.58241 2.04605 2.04605 3.58241 2.04605 5.47761C2.04605 7.37281 3.58241 8.90917 5.47761 8.90917C7.37281 8.90917 8.90917 7.37281 8.90917 5.47761C8.90917 3.58241 7.37281 2.04605 5.47761 2.04605Z" />
            </svg>
          </button>
        )}
      </form>
    </div>
  );

  render() {
    return this.props.children({
      renderSearchBar: this.renderSearchBar,
      renderSearchOverlay: this.renderSearchOverlay,
      renderSpeechElements: this.renderSpeechElements,
    });
  }
}

export default Search;
