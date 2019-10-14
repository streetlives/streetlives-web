import React, { Component } from 'react';
import Modal from '../../../../components/modal';
import Button from '../../../../components/button';
import Icon from '../../../../components/icon';
import Header from '../../../../components/header';
import categoryModals from './categoryModals';

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
        <div className="p-3 fixed-bottom">
          <Button onClick={this.submit} primary fluid className="position-relative">
            <Icon
              name="check"
              style={{
                position: 'absolute',
                left: 16,
                lineHeight: 'inherit',
              }}
            />
            Done
          </Button>
        </div>
      </Modal>
    );
  }
}

export default FiltersModal;
