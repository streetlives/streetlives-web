import React, { Component } from 'react';
import fuzzy from 'fuzzy';

import Icon from 'components/icon';
import Dropdown from 'components/dropdown';

import './AddLanguageForm.css';

class AddLanguageForm extends Component {
  state = { query: '' };

  componentDidMount() {
    this.input.focus();
  }

  onChange = (e) => {
    this.setState({ query: e.target.value });
  };

  render() {
    const { languages } = this.props;
    const { query } = this.state;
    const results = fuzzy.filter(query, languages, { extract: el => el.name });
    const matches = results.map(el => el.original);

    return (
      <div className="AddLanguageForm w-100 mt-2 position-relative">
        <div className="position-relative">
          <input
            ref={(c) => {
              this.input = c;
            }}
            value={query}
            onChange={this.onChange}
            placeholder="Add another language"
          />
          <div
            className="close-button"
            onClick={this.props.onDismiss}
            onKeyPress={this.props.onDismiss}
            role="button"
            tabIndex="-1"
          >
            <Icon name="times-circle" size="lg" />
          </div>
        </div>

        {matches.length > 0 && (
          <div className="w-100 border">
            <p className="list-header text-secondary m-0 p-2">Is it one of these?</p>
            <Dropdown
              options={matches.map(option => ({
                id: option.id,
                label: option.name,
                onClick: () => this.props.onSelect(option),
              }))}
            />
          </div>
        )}
      </div>
    );
  }
}

export default AddLanguageForm;
