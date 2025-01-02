import React, { Component, createRef } from 'react';

import Header from '../../../../components/header';
import Button from '../../../../components/button';
import Selector from '../../../../components/selector';
import Input from '../../../../components/input';

const DEFAULT_PROOFS = [
  'No documents required',
  'Photo ID',
  'Proof of address',
  'Proof of income',
  'Birth certificates',
];

class ProofsRequiredEdit extends Component {
  constructor(props) {
    super(props);

    this.state = {
      proofs: this.props.value,
      showForm: false,
    };

    this.customProofRef = createRef();
    this.updateValue = this.updateValue.bind(this);
    this.showForm = this.showForm.bind(this);
    this.onSubmitProofForm = this.onSubmitProofForm.bind(this);
    this.onProofClick = this.onProofClick.bind(this);
  }

  onSubmitProofForm(e) {
    e.preventDefault();

    const newValue = this.customProofRef.current.element.value;

    this.setState(prevState => ({
      proofs: [
        ...prevState.proofs,
        newValue,
      ],
      showForm: false,
    }));
  }

  onProofClick(name) {
    let { proofs } = this.state;

    if (name === 'No documents required') {
      if (proofs.includes('No documents required')) {
        proofs = [];
      } else {
        proofs = ['No documents required'];
      }
    } else {
      const proofIndex = proofs.findIndex(el => el === name);

      if (proofIndex > -1) {
        proofs.splice(proofIndex, 1);
      } else {
        proofs.push(name);
      }

      if (proofs.includes('No documents required')) {
        proofs = proofs.filter(p => p !== 'No documents required');
      }
    }

    this.setState({ proofs });
  }

  proofForm() {
    return (
      <form onSubmit={this.onSubmitProofForm}>
        <div>
          <Input
            id="proofs-required-custom-form"
            ref={this.customProofRef}
            placeholder="e.g. Proof of identity, proof of address"
            fluid
          />
        </div>

        <Button
          primary
          className="mt-3 mb-3"
          onClick={this.onSubmitProofForm}
        >
          OK
        </Button>
      </form>
    );
  }

  showForm() {
    this.setState({
      showForm: true,
    }, () => {
      this.customProofRef.current.element.focus();
    });
  }

  updateValue = e => this.props.updateValue(
    this.state.proofs,
    this.props.id,
    this.props.metaDataSection,
    this.props.fieldName,
  );

  render() {
    const { state: { proofs, showForm } } = this;

    const totalProofs = [...new Set([
      ...DEFAULT_PROOFS,
      ...proofs,
    ])];

    return (
      <div className="w-100">
        <Header className="mb-3">What proofs are required to use this service?</Header>
        <Selector fluid>
          {
            totalProofs.map(name => (
              <Selector.Option
                key={`selector-${name}`}
                active={this.state.proofs.includes(name)}
                hide={false}
                onClick={() => this.onProofClick(name)}
              >
                {name}
              </Selector.Option>
            ))
          }

          { showForm && this.proofForm() }

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

export default ProofsRequiredEdit;
