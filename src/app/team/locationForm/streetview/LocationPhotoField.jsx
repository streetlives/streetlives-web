import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Button from '../../../../components/button';
import Icon from '../../../../components/icon';
import { PREVIEW_BOX_STYLE, PREVIEW_IMAGE_STYLE } from './utils';
import { readAndDownscale, ACCEPT_ATTRIBUTE } from './photoUpload';

// The organization-provided photo. It replaces the Street View still on
// yourpeer.nyc, while the image there still links out to Google's panorama.
//
// Nothing here touches the API. Choosing or removing a photo only stages the
// change; the enclosing form commits it on OK and discards it on CANCEL, like
// every other field on this question. The resize still happens at pick time,
// because that is what lets the specialist see what they are about to save and
// catch an oversized file before submitting.

const hintStyle = { fontSize: '0.8em', color: 'var(--darkerGray)', marginTop: 2 };

const formatBytes = (bytes) => {
  if (bytes == null) return null;
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

class LocationPhotoField extends Component {
  state = { preparing: false };

  onPick = async (event) => {
    const input = event.target;
    const file = input.files && input.files[0];
    // Reset the input so picking the same file twice still fires a change.
    input.value = ''; // eslint-disable-line no-param-reassign
    if (!file) return;

    this.setState({ preparing: true });
    try {
      const prepared = await readAndDownscale(file);
      this.props.onStage(prepared);
    } catch (err) {
      this.props.onError(err.message);
    } finally {
      this.setState({ preparing: false });
    }
  };

  renderPreview() {
    const { photo, pending, pendingRemoval } = this.props;

    if (pendingRemoval) {
      return (
        <div style={hintStyle}>
          The photo will be removed when you press OK.
          {' '}
          <Button onClick={this.props.onUndo} primary basic compact>UNDO</Button>
        </div>
      );
    }

    // A staged photo is shown in place of the saved one, so what is on screen is
    // always what OK will leave behind.
    const url = (pending && pending.dataUrl) || (photo && photo.url);
    if (!url) return null;

    const meta = pending
      ? [pending.filename, formatBytes(pending.byteSize), 'not saved yet']
      : [
        photo.original_filename,
        photo.width && photo.height ? `${photo.width}×${photo.height}` : null,
        formatBytes(photo.byte_size),
      ];

    return (
      <div className="mb-2">
        <div style={PREVIEW_BOX_STYLE}>
          <img
            src={url}
            alt="Entrance, provided by the organization"
            loading="lazy"
            style={PREVIEW_IMAGE_STYLE}
          />
        </div>
        <div style={hintStyle}>{meta.filter(Boolean).join(' · ')}</div>
        <Button onClick={this.props.onRemove} primary basic compact className="mt-2">
          Remove photo
        </Button>
      </div>
    );
  }

  render() {
    const {
      photo, pending, pendingRemoval, error,
    } = this.props;
    const { preparing } = this.state;
    const hasPhoto = Boolean(pending) || (Boolean(photo && photo.url) && !pendingRemoval);

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
          Street View image on YourPeer, which still links to Google Street View. Nothing is
          saved until you press OK.
        </div>

        <div className="mt-2">{this.renderPreview()}</div>

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
          disabled={preparing}
          className="mt-1"
        >
          <Icon name="camera" />
          &nbsp;{hasPhoto ? 'Replace photo' : 'Choose photo'}
        </Button>
        <div style={hintStyle}>JPEG, PNG or WebP. Large photos are resized automatically.</div>

        {preparing && <div style={hintStyle}>Preparing photo…</div>}
        {error && (
          <div style={{ color: 'red', fontSize: '0.85em', marginTop: 4 }}>{error}</div>
        )}
      </div>
    );
  }
}

LocationPhotoField.propTypes = {
  // The photo already saved against this location, if any.
  photo: PropTypes.shape({
    url: PropTypes.string,
    width: PropTypes.number,
    height: PropTypes.number,
    byte_size: PropTypes.number,
    original_filename: PropTypes.string,
  }),
  // A resized photo waiting to be saved on OK.
  pending: PropTypes.shape({
    dataUrl: PropTypes.string,
    filename: PropTypes.string,
    byteSize: PropTypes.number,
  }),
  pendingRemoval: PropTypes.bool,
  error: PropTypes.string,
  onStage: PropTypes.func.isRequired,
  onRemove: PropTypes.func.isRequired,
  onUndo: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
};

LocationPhotoField.defaultProps = {
  photo: null,
  pending: null,
  pendingRemoval: false,
  error: null,
};

export default LocationPhotoField;
