import React, { Component } from 'react';

import Header from '../../../components/header';
import Button from '../../../components/button';
import Selector from '../../../components/selector';
import Icon from '../../../components/icon';
import * as api from '../../../services/api';

import AddLanguageForm from './AddLanguageForm';

const PRESET_LANGUAGES = ['en', 'es', 'ru', 'zh'];

class ServiceLanguages extends Component {
  constructor(props) {
    super(props);

    const selected = {};
    props.value.forEach((language) => {
      selected[language.id] = language;
    });

    this.state = {
      selected,
      fetched: [],
      languages: [],
      isAdding: false,
    };
  }

  componentWillMount() {
    api
      .getLanguages()
      .then(({ data }) => {
        const languages = data.filter(item => PRESET_LANGUAGES.indexOf(item.language) > -1);
        this.setState({ fetched: data, languages });
      })
      .catch(error => console.log('error', error)); // eslint-disable-line no-console
  }

  onSelect = (language) => {
    this.setState(({ selected }) => ({
      selected: { ...selected, [language.id]: !selected[language.id] ? language : false },
    }));
  };

  onAddLanguage = (option) => {
    this.setState(({ languages, selected }) => ({
      languages: [...languages, option],
      selected: { ...selected, [option.id]: option },
      isAdding: false,
    }));
  };

  onSubmit = () => {
    const { selected } = this.state;
    const newValues = Object.keys(selected)
      .filter(el => selected[el])
      .map(el => selected[el]);

    this.props.updateValue(
      newValues,
      this.props.id,
      this.props.metaDataSection,
      this.props.fieldName,
    );
    this.props.onSubmit();
  };

  render() {
    const { languages, selected, isAdding } = this.state;

    if (isAdding) {
      return (
        <AddLanguageForm
          languages={this.state.fetched}
          onSelect={this.onAddLanguage}
          onDismiss={() => this.setState({ isAdding: false })}
        />
      );
    }

    return (
      <div className="w-100">
        <Header className="mb-3">What languages are available for this service?</Header>
        <Selector fluid>
          {languages.map(option => (
            <Selector.Option
              key={option.id}
              active={selected[option.id]}
              onClick={() => this.onSelect(option)}
            >
              {option.name}
            </Selector.Option>
          ))}
          <Selector.Option align="center" onClick={() => this.setState({ isAdding: true })}>
            <Icon name="plus" className="mr-2" />Add another language
          </Selector.Option>
        </Selector>
        <Button
          onClick={this.onSubmit}
          primary
          disabled={Object.keys(selected).length === 0}
          className="mt-3"
        >
          OK
        </Button>
      </div>
    );
  }
}

export default ServiceLanguages;
