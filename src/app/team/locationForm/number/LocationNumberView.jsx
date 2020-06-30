import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';

import { deletePhone, getLocation } from '../../../../actions';
import { getPhoneNumbers } from '../../../../selectors/location';

import Button from '../../../../components/button';
import Icon from '../../../../components/icon';
import ConfirmationOptions from '../../../../components/form/ConfirmationOptions';
import ConfirmationModal from '../../../../components/confirmationModal';

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
      phoneBeingDeleted: null,
    };

    this.toggleEdit = this.toggleEdit.bind(this);
    this.onConfirmDelete = this.onConfirmDelete.bind(this);
    this.onCancelDelete = this.onCancelDelete.bind(this);
    this.deletePhone = this.deletePhone.bind(this);
    this.goToEditPhone = this.goToEditPhone.bind(this);
  }

  onConfirmDelete() {
    const { phoneBeingDeleted: { id } } = this.state;

    this.props.deletePhone(id);

    this.setState({
      showDeleteModal: false,
      phoneBeingDeleted: null,
    });
  }

  onCancelDelete() {
    this.setState({
      showDeleteModal: false,
      phoneBeingDeleted: null,
    });
  }

  deletePhone(phone) {
    this.setState({
      showDeleteModal: true,
      phoneBeingDeleted: phone,
    });
  }

  toggleEdit() {
    this.setState({
      isEditing: !this.state.isEditing,
    });
  }

  goToEditPhone(id) {
    const { history, match } = this.props;

    history.push(`${match.url}/${id}`);
  }

  render() {
    const { phones, onConfirm } = this.props;
    const { isEditing, showDeleteModal, phoneBeingDeleted } = this.state;

    return (
      <div className="w-100">
        <div style={{ fontSize: '13px', marginBottom: '1em' }} className="font-weight-bold mt-2">
          Phone Numbers
        </div>

        { showDeleteModal &&
          <ConfirmationModal
            headerText={`Are you sure that you want to delete? ${formatPhoneNumber(phoneBeingDeleted)}`}
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
                    <Icon
                      name="trash"
                    />
                  </button>
                }
                <p className="PhoneNumber-Number">{ formatPhoneNumber(phone) }</p>
                <p className="PhoneNumber-Type">{phone.type}</p>

                { isEditing &&
                  <Button
                    onClick={() => this.goToEditPhone(phone.id)}
                    secondary
                    fluid
                  >
                    Edit
                  </Button>
                }
              </li>
            ))
          }
        </ul>

        <Button
          onClick={() => { this.props.onNew(); }}
          secondary
          fluid
          className="PhoneNumbers-Add"
        >
          + Add another number
        </Button>

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
  deletePhone: id => dispatch(deletePhone(ownProps.match.params.locationId, id)),
  fetchResourceData: () => {
    dispatch(getLocation(ownProps.match.params.locationId));
  },
});

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(LocationNumberView));
