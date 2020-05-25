import React, { Component, createRef } from 'react';
import Selector from '../../../../components/selector';
import Input from '../../../../components/input';
import Link from '../../../../components/link';
import Button from '../../../../components/button';

import options, { getLabelByValues } from './options';

class MembershipCriteriaEdit extends Component {
  constructor(props) {
    super();

    this.description = (
      props.value &&
      props.value.description
    );

    this.state = {
      showAdditionalDetails: this.description && this.description !== '',
      eligibleValues: props.value && props.value.eligible_values,
    };

    this.onSubmit = this.onSubmit.bind(this);
    this.onShowAdditionalDetails = this.onShowAdditionalDetails.bind(this);

    this.inputRef = createRef();
  }

  onSubmit() {
    const { eligibleValues } = this.state;
    const description = this.inputRef.current && this.inputRef.current.element.value;

    const value = {
      eligible_values: eligibleValues,
      description,
    };

    this.props.updateValue(
      value,
      this.props.id,
      this.props.metaDataSection,
      this.props.fieldName,
    );
  }

  onShowAdditionalDetails() {
    this.setState({
      showAdditionalDetails: !this.state.showAdditionalDetails,
    });
  }

  changeValue(value) {
    let eligibleValues = value;

    if (eligibleValues === this.state.eligible_values) {
      eligibleValues = null;
    }

    this.setState({
      eligibleValues,
    });
  }

  render() {
    const selectedOption = this.state.eligibleValues && getLabelByValues(this.state.eligibleValues);

    return (
      <div className="container-fluid">
        <label className="w-100 mt-4" htmlFor="membershipCriteriaButtons">
          Any membership criteria?
        </label>
        <Selector fluid>
          {options.map(option => (
            <Selector.Option
              onClick={() => this.changeValue(option.values)}
              active={selectedOption === option.label}
              key={option.label}
            >
              {option.label}
            </Selector.Option>
          ))}
        </Selector>

        <div>
          <Link
            onClick={this.onShowAdditionalDetails}
           >
            Additional explanation
          </Link>

          { this.state.showAdditionalDetails &&
            <div>
              <label
                htmlFor="membership-criteria-additional-details"
                className="w-100 mt-4"
              >
                Enter any additional details
              </label>
              <Input
                defaultValue={this.description}
                ref={this.inputRef}
                id="membership-criteria-additional-details"
                fluid
              />
            </div>
          }
        </div>

        <p>
          <Button onClick={this.onSubmit} primary className="mt-3">
            OK
          </Button>&nbsp;
          <Button onClick={this.props.onCancel} basic primary className="mt-3">
            CANCEL
          </Button>
        </p>

      </div>
    )
  }
}

export default MembershipCriteriaEdit;
