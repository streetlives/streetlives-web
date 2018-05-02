import React, { Component } from 'react';

import Header from '../../../components/header';
import Button from '../../../components/button';
import Selector from '../../../components/selector';
import Icon from '../../../components/icon';

class ServiceLanguages extends Component {
  state = { languages: {} };

  onSelect = (index) => {
    const { languages } = this.state;
    const value = languages[index];
    this.setState({ languages: { ...languages, [index]: !value } });
  };

  render() {
    const { languages } = this.state;
    return (
      <div className="w-100">
        <Header className="mb-3">What languages are available for this service?</Header>
        <Selector fluid>
          <Selector.Option active={languages[0]} onClick={() => this.onSelect(0)}>
            English
          </Selector.Option>
          <Selector.Option active={languages[1]} onClick={() => this.onSelect(1)}>
            Español (Spanish)
          </Selector.Option>
          <Selector.Option active={languages[2]} onClick={() => this.onSelect(2)}>
            中文 (Chinese)
          </Selector.Option>
          <Selector.Option active={languages[3]} onClick={() => this.onSelect(3)}>
            русский (Russian)
          </Selector.Option>
          <Selector.Option align="center" onClick={() => {}}>
            <Icon name="plus" className="mr-2" />Add another language
          </Selector.Option>
        </Selector>
        <Button
          onClick={() => {}}
          primary
          disabled={Object.keys(languages).length === 0}
          className="mt-3"
        >
          OK
        </Button>
      </div>
    );
  }
}

export default ServiceLanguages;
