import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Button from '../../../../components/button';
import Icon from '../../../../components/icon';
import { PREVIEW_BOX_STYLE, PREVIEW_IMAGE_STYLE } from './utils';
import {
  loadSource, releaseSource, renderCrop, ACCEPT_ATTRIBUTE,
} from './photoUpload';
import PhotoCropModal from './PhotoCropModal';

// The organization-provided photo. It replaces the Street View still on
// yourpeer.nyc, while the image there still links out to Google's panorama.
//
// Nothing here touches the API. Choosing or removing a photo only stages the
// change; the enclosing form commits it on OK and discards it on CANCEL, like
// every other field on this question. The crop and resize still happen before
// staging, because that is what lets the specialist see what they are about to
// save and catch an oversized file before submitting.
//
// Picking a file opens it in PhotoCropModal, a cropper the exact size and shape
// of the preview box, where the specialist frames it before it is staged.

const hintStyle = { fontSize: '0.8em', color: 'var(--darkerGray)', marginTop: 2 };

const freshDraft = source => ({
  source, crop: { x: 0, y: 0 }, zoom: 1, area: null,
});

// Draft and staged can share one source (adjusting a crop), so only release a
// source the other one does not still need.
const releaseUnlessInUse = (source, keep) => {
  if (source && (!keep || keep.source !== source)) releaseSource(source);
};

class LocationPhotoField extends Component {
  // `draft` is the photo open in the cropper. `staged` is the source and framing
  // behind the photo handed to the form, kept so "Adjust crop" can reopen it
  // where the specialist left it rather than from the already-cropped result.
  state = { preparing: false, draft: null, staged: null };

  componentDidUpdate(prevProps) {
    // The form dropped the staged photo: removed, failed, or replaced by a save.
    // Nothing can reopen it now, so let go of the original.
    if (prevProps.pending && !this.props.pending && this.state.staged) {
      releaseUnlessInUse(this.state.staged.source, null);
      this.setState({ staged: null }); // eslint-disable-line react/no-did-update-set-state
    }
  }

  componentWillUnmount() {
    const { draft, staged } = this.state;
    if (draft) releaseSource(draft.source);
    if (staged && (!draft || staged.source !== draft.source)) releaseSource(staged.source);
  }

  onPick = async (event) => {
    const input = event.target;
    const file = input.files && input.files[0];
    // Reset the input so picking the same file twice still fires a change.
    input.value = ''; // eslint-disable-line no-param-reassign
    if (!file) return;

    this.setState({ preparing: true });
    try {
      const source = await loadSource(file);
      this.setDraft(freshDraft(source));
    } catch (err) {
      this.props.onError(err.message);
    } finally {
      this.setState({ preparing: false });
    }
  };

  onAdjust = () => {
    const { staged } = this.state;
    if (staged) this.setDraft({ ...staged, area: null });
  };

  onCropChange = (crop) => {
    this.setState(prev => (prev.draft ? { draft: { ...prev.draft, crop } } : null));
  };

  onZoomChange = (zoom) => {
    this.setState(prev => (prev.draft ? { draft: { ...prev.draft, zoom } } : null));
  };

  onAreaChange = (area) => {
    this.setState(prev => (prev.draft ? { draft: { ...prev.draft, area } } : null));
  };

  onCancelCrop = () => {
    const { draft, staged } = this.state;
    if (draft) releaseUnlessInUse(draft.source, staged);
    this.setDraft(null);
  };

  onApplyCrop = async () => {
    const { draft, staged } = this.state;
    if (!draft || !draft.area) return;

    this.setState({ preparing: true });
    try {
      const prepared = await renderCrop(draft.source, draft.area);
      if (staged) releaseUnlessInUse(staged.source, draft);
      this.setState({ staged: draft });
      this.setDraft(null);
      this.props.onStage(prepared);
    } catch (err) {
      this.onCancelCrop();
      this.props.onError(err.message);
    } finally {
      this.setState({ preparing: false });
    }
  };

  setDraft(draft) {
    this.setState({ draft });
    if (this.props.onCroppingChange) this.props.onCroppingChange(Boolean(draft));
  }

  renderCropper() {
    const { draft, preparing } = this.state;
    return (
      <PhotoCropModal
        imageUrl={draft.source.url}
        crop={draft.crop}
        zoom={draft.zoom}
        canApply={Boolean(draft.area)}
        busy={preparing}
        onCropChange={this.onCropChange}
        onZoomChange={this.onZoomChange}
        onAreaChange={this.onAreaChange}
        onApply={this.onApplyCrop}
        onCancel={this.onCancelCrop}
      />
    );
  }

  renderPreview() {
    const { photo, pending, pendingRemoval } = this.props;

    if (pendingRemoval) {
      return (
        <div style={hintStyle}>
          The photo will be removed when you press OK.
          {' '}
          <Button onClick={this.props.onUndo} primary basic compact disabled={this.props.disabled}>
            UNDO
          </Button>
        </div>
      );
    }

    // A staged photo is shown in place of the saved one, so what is on screen is
    // always what OK will leave behind.
    const url = (pending && pending.dataUrl) || (photo && photo.url);
    if (!url) return null;

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
        {/* No file name or size: the photo itself is what matters. Only an
            unsaved one is labelled, since OK still has to be pressed. */}
        {pending ? <div style={hintStyle}>Not saved yet</div> : null}
        {pending && this.state.staged ? (
          <Button
            onClick={this.onAdjust}
            primary
            basic
            compact
            className="mt-2"
            disabled={this.props.disabled}
          >
            Adjust crop
          </Button>
        ) : null}
        <Button
          onClick={this.props.onRemove}
          primary
          basic
          compact
          className="mt-2"
          disabled={this.props.disabled}
        >
          Remove photo
        </Button>
      </div>
    );
  }

  render() {
    const {
      photo, pending, pendingRemoval, error, disabled,
    } = this.props;
    const { preparing, draft } = this.state;
    const hasPhoto = Boolean(pending) || (Boolean(photo && photo.url) && !pendingRemoval);
    const busy = preparing || disabled;

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
        {draft ? this.renderCropper() : null}

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
          &nbsp;{hasPhoto ? 'Replace photo' : 'Choose photo'}
        </Button>
        <div style={hintStyle}>
          JPEG, PNG or WebP. You can position it next; it is resized and compressed automatically.
        </div>

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
  // A cropped, resized photo waiting to be saved on OK.
  pending: PropTypes.shape({
    dataUrl: PropTypes.string,
    filename: PropTypes.string,
    byteSize: PropTypes.number,
  }),
  pendingRemoval: PropTypes.bool,
  error: PropTypes.string,
  // True while the enclosing form is committing, so nothing can be staged or
  // unstaged behind an in-flight save.
  disabled: PropTypes.bool,
  onStage: PropTypes.func.isRequired,
  onRemove: PropTypes.func.isRequired,
  onUndo: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
  // Told when the cropper opens and closes, so the form can hold OK until the
  // specialist has finished framing the photo rather than save without it.
  onCroppingChange: PropTypes.func,
};

LocationPhotoField.defaultProps = {
  photo: null,
  pending: null,
  pendingRemoval: false,
  error: null,
  disabled: false,
  onCroppingChange: null,
};

export default LocationPhotoField;
