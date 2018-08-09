import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Header from '../../../components/header';
import Button from '../../../components/button';
import TextArea from '../../../components/textarea';
import Info from '../../../components/info';
import IntroModal from '../intro/IntroModal';

class CommentText extends Component {
  constructor(props) {
    super(props);
    this.state = { isShowingInfo: false };

    this.onShowInfo = this.onShowInfo.bind(this);
    this.onHideInfo = this.onHideInfo.bind(this);
  }

  onShowInfo() {
    this.setState({ isShowingInfo: true });
  }

  onHideInfo() {
    this.setState({ isShowingInfo: false });
  }

  render() {
    const instructions =
      'How was your experience? If you like, please add your name or initals at the end';

    // TODO: Update the textarea styles based on the new designs.
    return (
      <div>
        {this.state.isShowingInfo && (
          <IntroModal name={this.props.name} onDismiss={this.onHideInfo} />
        )}
        <div>
          <div className="px-4 pb-5">
            <Header size="large" className="mb-3 text-left">{this.props.name}</Header>
            <TextArea
              placeholder={instructions}
              value={this.props.value}
              minRows={3}
              onChange={this.props.onChange}
              fluid
            />
          </div>
          {!this.state.isShowingInfo && (
            <div style={{ position: 'absolute', bottom: 55, right: 10 }}>
              <Info onClick={this.onShowInfo} />
            </div>
          )}
          <div className="mx-5">
            <Button
              onClick={this.props.onSubmit}
              disabled={!this.props.value}
              primary
              fluid
              className="fixed-bottom mt-3"
            >
              NEXT
            </Button>
          </div>
        </div>
      </div>
    );
  }
}

CommentText.propTypes = {
  name: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
};

export default CommentText;
