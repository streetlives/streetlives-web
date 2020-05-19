import React, { Component, createRef } from 'react';

import Header from '../../../../components/header';
import Button from '../../../../components/button';
import Selector from '../../../../components/selector';
import Input from '../../../../components/input';

const OCCASIONS = [
  'Everyday',
  'Job Interview',
];

class ClothingOccasionsEdit extends Component {
  constructor(props) {
    super(props);

    this.state = {
      occasions: this.props.value,
      showForm: false,
    };

    this.customOccasionRef = createRef();
    this.updateValue = this.updateValue.bind(this);
    this.showForm = this.showForm.bind(this);
    this.onSubmitOccasionForm = this.onSubmitOccasionForm.bind(this);
  }

  showForm() {
    this.setState({
      showForm: true,
    }, () => {
      this.customOccasionRef.current.element.focus();
    });
  }

  onSubmitOccasionForm(e) {
    e.preventDefault();

    const newValue = this.customOccasionRef.current.element.value;

    this.setState(prevState => ({
      occasions: [
        ...prevState.occasions,
        newValue,
      ],
      showForm: false,
    }));
  }

  occasionForm() {
    return (
      <form onSubmit={this.onSubmitOccasionForm}>
        <div>
          <label
            htmlFor="custom-occasion-form"
            className="w-100 mt-4"
          >
            Add clothing occasion
          </label>
          <Input
            id="custom-occasion-form"
            ref={this.customOccasionRef}
            fluid
          />
        </div>

        <Button
          primary
          className="mt-3 mb-3"
          onClick={this.onSubmitOccasionForm}
        >
          OK
        </Button>
      </form>
    );
  }

  onOccasionClick(name) {
    const { occasions } = this.state;

    const occasionIndex = occasions.findIndex(el => el === name);

    if (occasionIndex > -1) {
      occasions.splice(occasionIndex, 1);
    } else {
      occasions.push(name);
    }
    this.setState({ occasions });
  }

  updateValue = e => this.props.updateValue(
    this.state.occasions,
    this.props.id,
    this.props.metaDataSection,
    this.props.fieldName,
  );

  render() {
    const { state: { occasions, showForm } } = this;

    const totalOccasions = [...new Set([
      ...OCCASIONS,
      ...occasions,
    ])];

    return (
      <div className="w-100">
        <Header className="mb-3">What kind of clothing is it?</Header>
        <p>(select all that applies)</p>
        <Selector fluid>
          {
            totalOccasions.map(name => (
              <Selector.Option
                key={`selector-${name}`}
                active={this.state.occasions.includes(name)}
                hide={false}
                onClick={() => this.onOccasionClick(name)}
              >
                {name}
              </Selector.Option>
            ))
          }

          { showForm && this.occasionForm() }

          <Selector.Option
            key="selector-add-another-group"
            disablePadding={false}
            active={false}
            hide={false}
            onClick={this.showForm}
          >
            <div className="addAnotherGroup">
              + Add another
            </div>
          </Selector.Option>
        </Selector>

        <Button onClick={this.updateValue} primary>
          OK
        </Button>
      </div>
    );
  }
}

export default ClothingOccasionsEdit;
