import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link, withRouter } from 'react-router-dom';
import { connect } from 'react-redux';

import { deletePhone, getLocation } from '../../../../actions';
import { getPhoneNumbers } from '../../../../selectors/location';

import Button from '../../../../components/button';
import ConfirmationOptions from '../../../../components/form/ConfirmationOptions';
import ConfirmationModal from '../../../../components/confirmationModal';

import deleteIcon from './DeleteIcon.svg';

const formatPhoneNumber = phone =>
  `${phone.number.replace(/\./g, '-')}${
    phone.extension ? ` ext. ${phone.extension}` : ''
  }`;

class LocationNumberView extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isEditing: false,
      showDeleteModal: false,
    };

    this.toggleEdit = this.toggleEdit.bind(this);
    this.onConfirmDelete = this.onConfirmDelete.bind(this);
    this.onCancelDelete = this.onCancelDelete.bind(this);
    this.deletePhone = this.deletePhone.bind(this);
  }

  async onConfirmDelete() {
    const { showDeleteModal: { id } } = this.state;

    await this.props.deletePhone(id);

    this.setState({
      showDeleteModal: false,
    }, () => {
      this.props.fetchResourceData();
    });
  }

  onCancelDelete() {
    this.setState({
      showDeleteModal: false,
    });
  }

  deletePhone(phone) {
    this.setState({
      showDeleteModal: phone,
    });
  }

  toggleEdit() {
    this.setState({
      isEditing: !this.state.isEditing,
    });
  }

  render() {
    const { phones, onConfirm, match } = this.props;
    const { isEditing, showDeleteModal } = this.state;

    return (
      <div className="w-100">
        <div style={{ fontSize: '13px', marginBottom: '1em' }} className="font-weight-bold mt-2">
          Phone Numbers
        </div>

        { showDeleteModal &&
          <ConfirmationModal
            headerText={`Are you sure that you want to delete? ${formatPhoneNumber(showDeleteModal)}`}
            onCancel={this.onCancelDelete}
            onConfirm={this.onConfirmDelete}
            cancelText="NO, LET’S KEEP IT"
          /> }

        <ul className="PhoneNumbers-List">
          {
            phones.map(phone => (
              <li key={`selector-${phone.id}`} className="PhoneNumbers-Element">
                { isEditing &&
                  <button
                    onClick={() => this.deletePhone(phone)}
                    className="PhoneNumber-Delete"
                  >
                    <img src={deleteIcon} alt="Delete" />
                  </button>
                }
                <p className="PhoneNumber-Number">{ formatPhoneNumber(phone) }</p>
                <p className="PhoneNumber-Type">{phone.type}</p>

                { isEditing &&
                  <Link
                    to={`${match.url}/${phone.id}`}
                    className="Button Button-secondary Button-fluid"
                  >
                    Edit
                  </Link>
                }
              </li>
            ))
          }
        </ul>

        <Link
          to={`${match.url}/new`}
          className="Button Button-secondary Button-fluid PhoneNumbers-Add"
        >
          + Add another number
        </Link>

        {
          isEditing ?
            <Button
              primary
              fluid
              onClick={this.toggleEdit}
              className="mt-2"
            >
              Done Editing
            </Button> :
            <ConfirmationOptions onConfirm={onConfirm} onEdit={this.toggleEdit} />
        }
      </div>
    );
  }
}

LocationNumberView.propTypes = {
  phones: PropTypes.arrayOf(PropTypes.shape),
  onConfirm: PropTypes.func.isRequired,
};

LocationNumberView.defaultProps = {
  phones: [],
};

const mapStateToProps = (state, ownProps) => ({
  phones: getPhoneNumbers(state, ownProps),
});

const mapDispatchToProps = (dispatch, ownProps) => ({
  deletePhone: id => dispatch(deletePhone(id)),
  fetchResourceData: () => {
    dispatch(getLocation(ownProps.match.params.locationId));
  },
});

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(LocationNumberView));
