import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ReactModal from 'react-modal';
import Cropper from 'react-easy-crop';
import Button from '../../../../components/button';
import Icon from '../../../../components/icon';
import { PREVIEW_BOX_STYLE } from './utils';
import { ASPECT } from './photoUpload';

// Frames an organization photo before it is staged. The frame is fixed at 5:3
// and fills the whole box, so the box itself is the preview: what is visible is
// exactly what is uploaded and what YourPeer shows, with nothing dimmed around
// it. The specialist drags the photo behind the frame and zooms with the
// wheel, a trackpad or a pinch.
//
// react-modal rather than components/modal: this one has to trap focus, close
// on Escape and hide the page from screen readers while it is open.

const MAX_ZOOM = 4;

const hintStyle = { fontSize: '0.8em', color: 'var(--darkerGray)', marginTop: 6 };

const modalStyle = {
  overlay: {
    zIndex: 2000,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  content: {
    // react-modal pins its content 40px in from every edge; centre it instead.
    position: 'relative',
    top: 'auto',
    left: 'auto',
    right: 'auto',
    bottom: 'auto',
    width: PREVIEW_BOX_STYLE.width + 48,
    maxWidth: '100%',
    maxHeight: '100%',
    overflow: 'auto',
    padding: 24,
    borderRadius: 8,
    border: 'none',
  },
};

// Sits over the photo until the specialist first touches it, so it is obvious
// the photo moves without reading any instructions. It never blocks a drag.
const badgeStyle = visible => ({
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  padding: '8px 14px',
  borderRadius: 999,
  backgroundColor: 'rgba(0, 0, 0, 0.6)',
  color: '#fff',
  fontSize: '0.9em',
  whiteSpace: 'nowrap',
  pointerEvents: 'none',
  opacity: visible ? 1 : 0,
  transition: 'opacity 200ms ease-out',
});

// The root element only exists in the app; tests render without one.
const appElement = () => document.getElementById('root') || undefined;

class PhotoCropModal extends Component {
  state = { touched: false, dragging: false };

  onInteractionStart = () => {
    this.setState({ touched: true, dragging: true });
  };

  onInteractionEnd = () => {
    this.setState({ dragging: false });
  };

  onCropComplete = (_areaPercent, area) => {
    this.props.onAreaChange(area);
  };

  render() {
    const {
      imageUrl, crop, zoom, canApply, busy, onCropChange, onZoomChange, onApply, onCancel,
    } = this.props;
    const { touched, dragging } = this.state;
    const element = appElement();

    return (
      <ReactModal
        isOpen
        onRequestClose={busy ? undefined : onCancel}
        // A stray click beside the photo should not throw away the framing.
        shouldCloseOnOverlayClick={false}
        appElement={element}
        ariaHideApp={Boolean(element)}
        contentLabel="Position the photo"
        style={modalStyle}
      >
        <div style={{ fontWeight: 600, fontSize: '1.1em', marginBottom: 12 }}>
          Position the photo
        </div>

        <div
          style={{ ...PREVIEW_BOX_STYLE, position: 'relative', touchAction: 'none' }}
          data-testid="photo-cropper"
        >
          <Cropper
            image={imageUrl}
            crop={crop}
            zoom={zoom}
            minZoom={1}
            maxZoom={MAX_ZOOM}
            aspect={ASPECT}
            objectFit="cover"
            // Lines only while moving, as feedback that the photo is following.
            showGrid={dragging}
            onCropChange={onCropChange}
            onZoomChange={onZoomChange}
            onCropComplete={this.onCropComplete}
            onInteractionStart={this.onInteractionStart}
            onInteractionEnd={this.onInteractionEnd}
            style={{ containerStyle: { cursor: dragging ? 'grabbing' : 'grab' } }}
          />
          <div style={badgeStyle(!touched)} data-testid="photo-drag-hint" aria-hidden>
            <Icon name="arrows-alt" />
            Drag to reposition · Scroll or pinch to zoom
          </div>
        </div>
        <div style={hintStyle}>This frame is exactly what YourPeer will show.</div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
          <Button onClick={onCancel} primary basic compact disabled={busy}>
            Cancel
          </Button>
          &nbsp;
          <Button onClick={onApply} primary compact disabled={busy || !canApply}>
            {busy ? 'Preparing…' : 'Use this photo'}
          </Button>
        </div>
      </ReactModal>
    );
  }
}

PhotoCropModal.propTypes = {
  imageUrl: PropTypes.string.isRequired,
  crop: PropTypes.shape({ x: PropTypes.number, y: PropTypes.number }).isRequired,
  zoom: PropTypes.number.isRequired,
  // False until the cropper has reported a framing to apply.
  canApply: PropTypes.bool.isRequired,
  busy: PropTypes.bool,
  onCropChange: PropTypes.func.isRequired,
  onZoomChange: PropTypes.func.isRequired,
  onAreaChange: PropTypes.func.isRequired,
  onApply: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};

PhotoCropModal.defaultProps = {
  busy: false,
};

export default PhotoCropModal;
