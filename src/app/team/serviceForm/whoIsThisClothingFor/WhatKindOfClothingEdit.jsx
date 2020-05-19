import React, { Component } from 'react';

import Header from '../../../../components/header';
import Button from '../../../../components/button';
import Selector from '../../../../components/selector';

const LIST = [
  'Men',
  'Women',
  'Girls',
  'Boys',
];

class WhoDoesItServe extends Component {
  constructor(props) {
    super(props);

    this.state = {
      value: this.props.value,
    };

    this.updateValue = this.updateValue.bind(this);
  }

  onListClick(name) {
    const { value } = this.state;

    const nameIndex = value.findIndex(el => el === name);

    if (nameIndex > -1) {
      value.splice(nameIndex, 1);
    } else {
      value.push(name);
    }
    this.setState({ value });
  }

  updateValue = e => this.props.updateValue(
    this.state.value,
    this.props.id,
    this.props.metaDataSection,
    this.props.fieldName,
  );

  render() {
    const { state: { value } } = this;

    console.log(value);

    return (
      <div className="w-100 WhoDoesItServe">
        <Header className="mb-3">Who is this clothing for?</Header>
        <Selector fluid>
          {
            LIST.map(name => (
              <Selector.Option
                key={`selector-${name}`}
                active={value.includes(name)}
                hide={false}
                onClick={() => this.onListClick(name)}
              >
                {name}
              </Selector.Option>
            ))
          }
        </Selector>

        <Button onClick={this.updateValue} primary>
          OK
        </Button>
      </div>
    );
  }
}

export default WhoDoesItServe;
