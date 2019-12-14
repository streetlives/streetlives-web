import React, { Component } from 'react';
import Speech, { ListeningIndicator } from '../../../components/speech';
import Icon from '../../../components/icon';
import { getCategoryIcon } from '../../../services/iconography';

const minCharsForSuggestions = 3;

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
    const suggestedCategory = (newString.length >= minCharsForSuggestions && suggestions) ?
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
          <div style={{ position: 'absolute', bottom: 210, right: 25 }}>
            <Icon
              onClick={startSpeechToText}
              name="microphone"
              size="2x"
              circle
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
      <form className="input-group border" onSubmit={this.submitSearchString} >
        {this.state.isEnteringSearchString && (
          <span
            style={{ backgroundColor: 'blue', border: 'none', borderRadius: 0 }}
            className="input-group-prepend input-group-text"
          >
            <Icon
              name="chevron-left"
              onClick={this.cancelSearchMode}
              style={{ color: 'white' }}
            />
          </span>
        )}
        <input
          onChange={this.updateSearchString}
          onFocus={this.enterSearchMode}
          style={{ border: 'none', borderRadius: 0, boxShadow: 'none' }}
          type="text"
          className="form-control"
          placeholder="Find what you need"
          value={this.state.modifiedSearchString}
          required
        />
        {this.state.isEnteringSearchString && (
          <button
            type="submit"
            style={{ backgroundColor: 'blue', border: 'none', borderRadius: 0 }}
            className="input-group-text"
          >
            <Icon name="search" style={{ color: 'white' }} />
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
