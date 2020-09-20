import React, { Component } from 'react';
import { connect } from 'react-redux';
import { selectDataEntryErrors } from '../../../selectors/location';
import { dismissDataEntryErrors } from '../../../actions';
import Icon from '../../../components/icon/Icon';
import './ErrorBar.css';

class ErrorBar extends Component {
  state = { isConnected: null };

  componentDidMount() {
    window.addEventListener('online', this.onConnected);
    window.addEventListener('offline', this.onDisconnected);
  }

  componentWillUnmount() {
    window.removeEventListener('online', this.onConnected);
    window.removeEventListener('offline', this.onDisconnected);
  }

  onConnected = () => { this.setState({ isConnected: true }); };
  onDisconnected = () => { this.setState({ isConnected: false }); };

  render() {
    const { isConnected } = this.state;
    const { errors, dismissErrors } = this.props;

    if (this.props.errors && this.props.errors.length) {
      return (
        <div className="ErrorBar">
          Having some issues updating the data ({errors[0].message})...<br />
          Please check if fields updated in the last minute are still correct.
          <Icon name="times" className="DismissButton" onClick={dismissErrors} />
        </div>
      );
    }

    if (isConnected === false) {
      return (
        <div className="NoConnectionBar">
          Not connected to the internet - data entered may not be saved
        </div>
      );
    }

    return null;
  }
}

const mapStateToProps = state => ({ errors: selectDataEntryErrors(state) });
const mapDispatchToProps = { dismissErrors: dismissDataEntryErrors };

export default connect(mapStateToProps, mapDispatchToProps)(ErrorBar);
