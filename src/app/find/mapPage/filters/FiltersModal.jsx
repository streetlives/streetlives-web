import React, { Component } from 'react';
import Modal from '../../../../components/modal';
import Button from '../../../../components/button';
import Icon from '../../../../components/icon';
import Header from '../../../../components/header';
import categoryModals from './categoryModals';
import './filters.css';

class FiltersModal extends Component {
  state = {
    filterValues: {
      ...this.props.defaultValues,
    },
  };

  setFilterValues = values => this.setState({
    filterValues: {
      ...this.state.filterValues,
      ...values,
    },
  });

  submit = () => {
    this.props.onSubmit(this.state.filterValues);
  };

  render() {
    const {
      category,
      onClose,
    } = this.props;

    const CategoryModal = categoryModals[category.name.trim().toLowerCase()];

    return (
      <Modal className="pb-4">
        <div className="mx-3 mt-4 position-relative">
          <Header size="medium" className="mx-4 d-inline text-uppercase">
            {category.name} Filters
          </Header>
          <Icon
            name="times"
            onClick={onClose}
            style={{
              position: 'absolute',
              right: 0,
              top: '0.2em',
            }}
          />
        </div>
        <div className="px-3 mb-5">
          <CategoryModal
            category={category}
            values={this.state.filterValues}
            onChange={this.setFilterValues}
          />
        </div>
        <div className="doneBtnContainer">
          <Button onClick={this.submit} className="doneBtn"> {/* Could we append a className here, so I can change colors onClick? */}
            {/* <div className="iconContainer">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
<path className="checkmarkColored" fill-rule="evenodd" clip-rule="evenodd" d="M14.7071 3.29289C15.0976 3.68342 15.0976 4.31658 14.7071 4.70711L6.20711 13.2071C5.81658 13.5976 5.18342 13.5976 4.79289 13.2071L1.29289 9.70711C0.902369 9.31658 0.902369 8.68342 1.29289 8.29289C1.68342 7.90237 2.31658 7.90237 2.70711 8.29289L5.5 11.0858L13.2929 3.29289C13.6834 2.90237 14.3166 2.90237 14.7071 3.29289Z" fill="white"/>
</svg>
            </div> */}
            Done
          </Button>
        </div>
      </Modal>
    );
  }
}

export default FiltersModal;
