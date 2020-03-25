import React, { Component } from 'react';
// import Speech, { ListeningIndicator } from '../../../components/speech';
import Icon from '../../../components/icon';
import Button from '../../../components/button';
import { getCategoryIcon } from '../../../services/iconography';
import './search.css';

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

  // Since most users find search in its current form (no NLP etc) confusing when using speech,
  // we're removing that option for now.
  renderSpeechElements = () => null;
  // renderSpeechElements = () => (
  //   <Speech
  //     onInterimText={this.updateSearchStringFromSpeech}
  //     onGotText={this.submitSearchString}
  //   >
  //     {({
  //       isSpeechSupported,
  //       isListening,
  //       startSpeechToText,
  //     }) => isSpeechSupported && (
  //       isListening ? (
  //         <div
  //           style={{
  //             position: 'absolute',
  //             left: 0,
  //             top: 0,
  //             right: 0,
  //             bottom: 0,
  //             zIndex: 3,
  //             backgroundColor: '#F8F8FC',
  //           }}
  //         >
  //           <div style={{ position: 'relative', top: '50%' }}>
  //             <ListeningIndicator />
  //           </div>
  //         </div>
  //       ) : (
  //         <Icon
  //           name="microphone"
  //           custom
  //           circle
  //           size="2x"
  //           alt="search through voice"
  //           className="voiceToText"
  //           onClick={startSpeechToText}
  //         />
  //       )
  //     )}
  //   </Speech>
  // );

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
          <Button
            className="backSearch"
            onClick={this.cancelSearchMode}
          >
            <img className="backSearchChevron" src="/icons/back.svg" alt="back" />
          </Button>
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
            <img src="/icons/search.svg" alt="search" />
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
