import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Button from '../../../../components/button';
import Icon from '../../../../components/icon';
import { readAndDownscale, ACCEPT_ATTRIBUTE } from './photoUpload';
import { PREVIEW_BOX_STYLE, PREVIEW_IMAGE_STYLE } from './utils';

// The organization-provided photo. It replaces the Street View still on
// yourpeer.nyc, while the image there still links out to Google's panorama.
//
// This saves on its own, the moment a file is picked, rather than on the
// enclosing form's OK. The photo is a separate API resource, and unlike every
// other field here a failure cannot be left to the global ErrorBar: the
// specialist would have to find and re-pick the file. So it carries its own
// pending and error state, and says so on screen, because CANCEL below it does
// not undo an upload.

const STATUS = {
  IDLE: 'idle',
  PREPARING: 'preparing',
  UPLOADING: 'uploading',
  DONE: 'done',
  ERROR: 'error',
};

const UPLOAD_FAILED = 'Upload failed. Please try again.';

const formatBytes = (bytes) => {
  if (bytes == null) return null;
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const hintStyle = { fontSize: '0.8em', color: 'var(--darkerGray)', marginTop: 2 };

class LocationPhotoField extends Component {
  state = {
    status: STATUS.IDLE,
    error: null,
    confirmingRemove: false,
  };

  onPick = async (event) => {
    const input = event.target;
    const file = input.files && input.files[0];
    // Reset the input so picking the same file twice still fires a change.
    input.value = ''; // eslint-disable-line no-param-reassign
    if (!file) return;

    this.setState({ status: STATUS.PREPARING, error: null, confirmingRemove: false });

    let prepared;
    try {
      prepared = await readAndDownscale(file);
    } catch (err) {
      this.setState({ status: STATUS.ERROR, error: err.message });
      return;
    }

    this.setState({ status: STATUS.UPLOADING });

    try {
      await this.props.onUpload(prepared);
      this.setState({ status: STATUS.DONE, error: null });
    } catch (err) {
      this.setState({ status: STATUS.ERROR, error: UPLOAD_FAILED });
    }
  };

  onRemoveClick = () => this.setState({ confirmingRemove: true, error: null });

  onCancelRemove = () => this.setState({ confirmingRemove: false });

  onConfirmRemove = async () => {
    this.setState({ status: STATUS.UPLOADING, confirmingRemove: false, error: null });
    try {
      await this.props.onRemove();
      this.setState({ status: STATUS.IDLE, error: null });
    } catch (err) {
      this.setState({
        status: STATUS.ERROR,
        error: 'Could not remove the photo. Please try again.',
      });
    }
  };

  renderStatus() {
    const { status, error } = this.state;

    if (status === STATUS.PREPARING) return <div style={hintStyle}>Preparing photo…</div>;
    if (status === STATUS.UPLOADING) return <div style={hintStyle}>Uploading…</div>;
    if (status === STATUS.ERROR) {
      return <div style={{ color: 'red', fontSize: '0.85em', marginTop: 4 }}>{error}</div>;
    }
    if (status === STATUS.DONE) {
      return <div style={{ ...hintStyle, color: 'green' }}>Saved.</div>;
    }
    return null;
  }

  renderPhoto() {
    const { photo } = this.props;
    const { confirmingRemove } = this.state;
    if (!photo || !photo.url) return null;

    const meta = [
      photo.original_filename,
      photo.width && photo.height ? `${photo.width}×${photo.height}` : null,
      formatBytes(photo.byte_size),
    ].filter(Boolean).join(' · ');

    return (
      <div className="mb-2">
        <div style={PREVIEW_BOX_STYLE}>
          <img
            src={photo.url}
            alt="Entrance, provided by the organization"
            loading="lazy"
            style={PREVIEW_IMAGE_STYLE}
          />
        </div>
        <div style={hintStyle}>{meta}</div>

        {confirmingRemove ? (
          <div className="mt-2">
            <span style={{ fontSize: '0.9em' }}>Remove this photo?&nbsp;</span>
            <Button onClick={this.onConfirmRemove} primary compact>YES, REMOVE</Button>
            &nbsp;
            <Button onClick={this.onCancelRemove} primary basic compact>KEEP IT</Button>
          </div>
        ) : (
          <Button onClick={this.onRemoveClick} primary basic compact className="mt-2">
            Remove photo
          </Button>
        )}
      </div>
    );
  }

  render() {
    const { photo } = this.props;
    const { status } = this.state;
    const busy = status === STATUS.PREPARING || status === STATUS.UPLOADING;

    return (
      <div
        style={{
          marginBottom: '1.5em',
          paddingBottom: '1.5em',
          borderBottom: '1px solid var(--borderGray)',
        }}
      >
        <div style={{ fontWeight: 600 }}>Organization-provided photo</div>
        <div style={hintStyle}>
          If the organization sent a photo of the entrance, upload it here. It replaces the
          Street View image on YourPeer, which still links to Google Street View. Saved as soon
          as you choose it — CANCEL below will not undo it.
        </div>

        <div className="mt-2">{this.renderPhoto()}</div>

        <input
          type="file"
          accept={ACCEPT_ATTRIBUTE}
          onChange={this.onPick}
          ref={(el) => { this.fileInput = el; }}
          style={{ display: 'none' }}
          data-testid="photo-file-input"
          aria-label="Choose a photo"
        />
        <Button
          onClick={() => this.fileInput && this.fileInput.click()}
          primary
          basic
          disabled={busy}
          className="mt-1"
        >
          <Icon name="camera" />
          &nbsp;{photo && photo.url ? 'Replace photo' : 'Choose photo'}
        </Button>
        <div style={hintStyle}>JPEG, PNG or WebP. Large photos are resized automatically.</div>

        {this.renderStatus()}
      </div>
    );
  }
}

LocationPhotoField.propTypes = {
  photo: PropTypes.shape({
    url: PropTypes.string,
    width: PropTypes.number,
    height: PropTypes.number,
    byte_size: PropTypes.number,
    original_filename: PropTypes.string,
  }),
  onUpload: PropTypes.func.isRequired,
  onRemove: PropTypes.func.isRequired,
};

LocationPhotoField.defaultProps = {
  photo: null,
};

export default LocationPhotoField;
