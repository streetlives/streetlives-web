import React, { Component } from 'react';

import Header from '../../../../components/header';
import Button from '../../../../components/button';
import Selector from '../../../../components/selector';

import ZipCodeForm from './ZipCodeForm';

import './AreaEdit.css';
import { AREA_TYPE_LABELS, SERVICE_AREA_TYPES } from './utils';

class AreaEdit extends Component {
  constructor(props) {
    super(props);

    let areaType;
    let customZipCodes;

    if (props.value) {
      customZipCodes = props.value.postal_codes;
      areaType = customZipCodes.length === 0 ? 'ALL' : 'CUSTOM';
    } else {
      customZipCodes = [];
      areaType = '';
    }

    this.state = {
      areaType,
      customZipCodes,
    };

    this.updateValue = this.updateValue.bind(this);
    this.addNewZipCode = this.addNewZipCode.bind(this);
    this.selectAreaType = this.selectAreaType.bind(this);
  }

  onDeleteZipCode(index) {
    const { customZipCodes } = this.state;

    const filtered = [
      ...customZipCodes,
    ];

    filtered.splice(index, 1);

    this.setState({
      customZipCodes: filtered,
    });
  }

  onUpdateZipCode(index, value) {
    const { customZipCodes } = this.state;

    customZipCodes[index] = value;

    this.setState({
      customZipCodes,
    });
  }

  addNewZipCode() {
    const customZipCodes = [
      ...this.state.customZipCodes,
      '',
    ];

    this.setState({
      customZipCodes,
    });
  }

  selectAreaType(areaType) {
    const state = { areaType };

    if (
      areaType === SERVICE_AREA_TYPES.CUSTOM &&
      this.state.customZipCodes.length === 0
    ) {
      state.customZipCodes = [''];
    }

    this.setState(state);
  }

  updateValue() {
    let { customZipCodes } = this.state;

    if (this.state.areaType === SERVICE_AREA_TYPES.ALL) {
      customZipCodes = [];
    }

    this.props.updateValue(
      { postal_codes: customZipCodes },
      this.props.id,
      this.props.metaDataSection,
      this.props.fieldName,
    );
  }

  isSubmitDisabled() {
    const { areaType, customZipCodes } = this.state;

    if (areaType === 'CUSTOM') {
      return customZipCodes.length === 0;
    }

    return areaType === '';
  }

  render() {
    const { state: { customZipCodes, areaType } } = this;

    const lastZipCode = customZipCodes[customZipCodes.length - 1];

    return (
      <div className="w-100">
        <Header className="mb-3">Which area does it serve?</Header>
        <p>(select all that applies)</p>
        <Selector fluid>
          <Selector.Option
            disablePadding={false}
            active={areaType === SERVICE_AREA_TYPES.ALL}
            hide={false}
            onClick={() => this.selectAreaType(SERVICE_AREA_TYPES.ALL)}
          >
            <div className="addAnotherGroup">
              { AREA_TYPE_LABELS[SERVICE_AREA_TYPES.ALL] }
            </div>
          </Selector.Option>

          <Selector.Option
            disablePadding={false}
            active={areaType === SERVICE_AREA_TYPES.CUSTOM}
            hide={false}
            onClick={() => this.selectAreaType(SERVICE_AREA_TYPES.CUSTOM)}
          >
            <div className="addAnotherGroup">
              { AREA_TYPE_LABELS[SERVICE_AREA_TYPES.CUSTOM] }
            </div>
          </Selector.Option>

          { areaType === SERVICE_AREA_TYPES.CUSTOM &&
          <>
            <p>What zipcodes are served?</p>

            {
              customZipCodes.map((zip, index) => (
                <ZipCodeForm
                  key={zip}
                  zip={zip}
                  onUpdate={value => this.onUpdateZipCode(index, value)}
                  onDelete={() => this.onDeleteZipCode(index)}
                />
              ))
            }

            <Selector.Option
              disablePadding={false}
              active={false}
              disabled={lastZipCode === ''}
              onClick={this.addNewZipCode}
            >
              <div className="addAnotherArea">
                + Add another
              </div>
            </Selector.Option>
          </>
          }
        </Selector>

        <Button
          onClick={this.updateValue}
          primary
          disabled={this.isSubmitDisabled()}
        >
          OK
        </Button>
      </div>
    );
  }
}

export default AreaEdit;
