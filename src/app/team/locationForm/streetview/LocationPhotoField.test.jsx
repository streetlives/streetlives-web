import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
// Registers faCamera; the app does this at startup, tests have to ask for it.
import '../../../IconLibrary';
import LocationPhotoField from './LocationPhotoField';
import { loadSource, renderCrop, releaseSource } from './photoUpload';
import { PREVIEW_WIDTH } from './utils';

// jsdom has no canvas, so the crop and resize steps are stubbed wholesale.
// Their rules are covered separately in photoUpload.test.js.
jest.mock('./photoUpload', () => ({
  loadSource: jest.fn(),
  renderCrop: jest.fn(),
  releaseSource: jest.fn(),
  ASPECT: 5 / 3,
  ACCEPT_ATTRIBUTE: 'image/jpeg,image/png,image/webp',
}));

// react-easy-crop measures its container, which jsdom always reports as 0x0.
// This stand-in reports a framing as soon as it mounts, like the real one does.
jest.mock('react-easy-crop', () => {
  const ReactActual = jest.requireActual('react');
  return class MockCropper extends ReactActual.Component {
    componentDidMount() {
      this.props.onCropComplete({}, {
        x: 0, y: 0, width: 1000, height: 600,
      });
    }

    render() {
      return ReactActual.createElement('div', {
        'data-testid': 'mock-cropper',
        'data-zoom': this.props.zoom,
        'data-grid': String(this.props.showGrid),
        onMouseDown: () => this.props.onInteractionStart(),
        onMouseUp: () => this.props.onInteractionEnd(),
        onWheel: () => this.props.onZoomChange(2.5),
      });
    }
  };
});

const SOURCE = {
  url: 'blob:original',
  image: { naturalWidth: 4000, naturalHeight: 3000 },
  filename: 'storefront.jpg',
};

const PREPARED = {
  data: 'YmFzZTY0',
  dataUrl: 'data:image/jpeg;base64,YmFzZTY0',
  contentType: 'image/jpeg',
  filename: 'storefront.jpg',
  byteSize: 561641,
};

const SAVED = {
  url: 'https://cdn.example/location-photos/abc/def.jpg',
  width: 1600,
  height: 1200,
  byte_size: 548000,
  original_filename: 'storefront.jpg',
};

const pickFile = () => {
  const file = new File(['bytes'], 'storefront.jpg', { type: 'image/jpeg' });
  const input = screen.getByTestId('photo-file-input');
  Object.defineProperty(input, 'files', { value: [file], configurable: true });
  fireEvent.change(input);
  return file;
};

const handlers = () => ({
  onStage: jest.fn(),
  onRemove: jest.fn(),
  onUndo: jest.fn(),
  onError: jest.fn(),
});

const renderField = (props = {}) => {
  const h = handlers();
  const utils = render(<LocationPhotoField {...h} {...props} />);
  return { ...utils, ...h };
};

describe('LocationPhotoField', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    loadSource.mockResolvedValue(SOURCE);
    renderCrop.mockResolvedValue(PREPARED);
  });

  describe('choosing a photo', () => {
    it('accepts only the formats the API allows', () => {
      renderField();
      expect(screen.getByTestId('photo-file-input'))
        .toHaveAttribute('accept', 'image/jpeg,image/png,image/webp');
    });

    it('opens the picked file in a cropper instead of staging it straight away', async () => {
      const onCroppingChange = jest.fn();
      const { onStage } = renderField({ onCroppingChange });

      const file = pickFile();

      expect(await screen.findByTestId('mock-cropper')).toBeInTheDocument();
      expect(loadSource).toHaveBeenCalledWith(file);
      expect(onStage).not.toHaveBeenCalled();
      expect(onCroppingChange).toHaveBeenLastCalledWith(true);
    });

    it('frames the photo in the same box as every other preview', async () => {
      renderField();

      pickFile();

      const box = await screen.findByTestId('photo-cropper');
      expect(box).toHaveStyle({ width: `${PREVIEW_WIDTH}px`, overflow: 'hidden' });
    });

    // The whole point of this field: picking a file changes nothing on the
    // server. The enclosing form commits it on OK.
    it('stages the cropped photo rather than saving it', async () => {
      const onCroppingChange = jest.fn();
      const { onStage } = renderField({ onCroppingChange });

      pickFile();
      fireEvent.click(await screen.findByText('Use this photo'));

      await waitFor(() => expect(onStage).toHaveBeenCalledWith(PREPARED));
      expect(renderCrop).toHaveBeenCalledWith(SOURCE, {
        x: 0, y: 0, width: 1000, height: 600,
      });
      expect(onCroppingChange).toHaveBeenLastCalledWith(false);
      expect(screen.queryByTestId('mock-cropper')).not.toBeInTheDocument();
    });

    it('opens the cropper in a dialog', async () => {
      renderField();

      pickFile();

      expect(await screen.findByRole('dialog', { name: 'Position the photo' }))
        .toContainElement(screen.getByTestId('mock-cropper'));
    });

    // No slider: the wheel, a trackpad or a pinch zooms the photo itself.
    it('zooms with the wheel and has no zoom slider', async () => {
      renderField();

      pickFile();
      fireEvent.wheel(await screen.findByTestId('mock-cropper'));

      expect(screen.getByTestId('mock-cropper')).toHaveAttribute('data-zoom', '2.5');
      expect(screen.queryByRole('slider')).not.toBeInTheDocument();
    });

    it('shows that the photo can be dragged until it is first touched', async () => {
      renderField();

      pickFile();
      const hint = await screen.findByTestId('photo-drag-hint');
      expect(hint).toHaveTextContent(/Drag to reposition/);
      expect(hint).toHaveStyle({ opacity: '1' });

      fireEvent.mouseDown(screen.getByTestId('mock-cropper'));
      expect(hint).toHaveStyle({ opacity: '0' });
      expect(screen.getByTestId('mock-cropper')).toHaveAttribute('data-grid', 'true');

      // The grid is feedback for a drag in progress; the hint stays gone.
      fireEvent.mouseUp(screen.getByTestId('mock-cropper'));
      expect(hint).toHaveStyle({ opacity: '0' });
      expect(screen.getByTestId('mock-cropper')).toHaveAttribute('data-grid', 'false');
    });

    it('discards the pick on Escape', async () => {
      const { onStage } = renderField();

      pickFile();
      const dialog = await screen.findByRole('dialog');
      fireEvent.keyDown(dialog, { key: 'Escape', keyCode: 27 });

      await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
      expect(onStage).not.toHaveBeenCalled();
      expect(releaseSource).toHaveBeenCalledWith(SOURCE);
    });

    it('discards the pick on cancel', async () => {
      const onCroppingChange = jest.fn();
      const { onStage } = renderField({ onCroppingChange });

      pickFile();
      fireEvent.click(await screen.findByText('Cancel'));

      expect(screen.queryByTestId('mock-cropper')).not.toBeInTheDocument();
      expect(onStage).not.toHaveBeenCalled();
      expect(releaseSource).toHaveBeenCalledWith(SOURCE);
      expect(onCroppingChange).toHaveBeenLastCalledWith(false);
    });

    it('reports a file it cannot open without opening the cropper', async () => {
      loadSource.mockRejectedValue(new Error('That file is not a JPEG, PNG or WebP image.'));
      const { onError } = renderField();

      pickFile();

      await waitFor(() =>
        expect(onError).toHaveBeenCalledWith('That file is not a JPEG, PNG or WebP image.'));
      expect(screen.queryByTestId('mock-cropper')).not.toBeInTheDocument();
    });

    it('reports a resize failure without staging anything', async () => {
      renderCrop.mockRejectedValue(new Error('That image is still too large.'));
      const { onStage, onError } = renderField();

      pickFile();
      fireEvent.click(await screen.findByText('Use this photo'));

      await waitFor(() =>
        expect(onError).toHaveBeenCalledWith('That image is still too large.'));
      expect(onStage).not.toHaveBeenCalled();
      expect(screen.queryByTestId('mock-cropper')).not.toBeInTheDocument();
    });
  });

  describe('adjusting a staged crop', () => {
    // The form owns `pending`, so the test plays its part: whatever is staged
    // comes back down as the pending prop.
    const renderWithForm = () => {
      const h = handlers();
      const utils = render(<LocationPhotoField {...h} />);
      h.onStage.mockImplementation((prepared) => {
        utils.rerender(<LocationPhotoField {...h} pending={prepared} />);
      });
      return { ...utils, ...h };
    };

    const stageOne = async () => {
      pickFile();
      fireEvent.click(await screen.findByText('Use this photo'));
      await screen.findByText(/not saved yet/);
    };

    it('reopens the original rather than the cropped result', async () => {
      renderWithForm();
      await stageOne();

      fireEvent.click(screen.getByText('Adjust crop'));
      fireEvent.click(await screen.findByText('Use this photo'));

      await waitFor(() => expect(renderCrop).toHaveBeenCalledTimes(2));
      expect(renderCrop.mock.calls[1][0]).toBe(SOURCE);
      expect(loadSource).toHaveBeenCalledTimes(1);
    });

    it('keeps the staged photo when an adjustment is cancelled', async () => {
      renderWithForm();
      await stageOne();

      fireEvent.click(screen.getByText('Adjust crop'));
      fireEvent.click(await screen.findByText('Cancel'));

      expect(screen.getByText(/not saved yet/)).toBeInTheDocument();
      expect(releaseSource).not.toHaveBeenCalled();
    });

    it('lets go of the original once the form drops the staged photo', async () => {
      const { rerender, ...h } = renderWithForm();
      await stageOne();

      rerender(<LocationPhotoField {...h} pending={null} />);

      expect(releaseSource).toHaveBeenCalledWith(SOURCE);
      expect(screen.queryByText('Adjust crop')).not.toBeInTheDocument();
    });

    it('offers no adjustment for a photo that was already saved', () => {
      renderField({ photo: SAVED });
      expect(screen.queryByText('Adjust crop')).not.toBeInTheDocument();
    });
  });

  describe('showing what OK will save', () => {
    it('shows the saved photo when nothing is staged', () => {
      renderField({ photo: SAVED });

      expect(screen.getByAltText(/provided by the organization/i))
        .toHaveAttribute('src', SAVED.url);
      expect(screen.getByText(/1600×1200/)).toBeInTheDocument();
    });

    // What is on screen is always what OK leaves behind, so a staged photo
    // replaces the saved one in the preview.
    it('shows a staged photo in place of the saved one, marked unsaved', () => {
      renderField({ photo: SAVED, pending: PREPARED });

      expect(screen.getByAltText(/provided by the organization/i))
        .toHaveAttribute('src', PREPARED.dataUrl);
      expect(screen.getByText(/not saved yet/)).toBeInTheDocument();
    });

    it('crops the photo into the same box as the Street View still', () => {
      renderField({ photo: SAVED });

      const img = screen.getByAltText(/provided by the organization/i);
      expect(img).toHaveStyle({ objectFit: 'cover', width: '100%', height: '100%' });
      // jsdom's CSS parser drops aspect-ratio, so it never reaches computed
      // style. The ratio itself is pinned as data in utils.test.js instead.
      expect(img.parentElement).toHaveStyle({
        width: `${PREVIEW_WIDTH}px`,
        overflow: 'hidden',
      });
    });

    it('offers to replace rather than choose once there is a photo', () => {
      renderField({ photo: SAVED });
      expect(screen.getByText(/Replace photo/)).toBeInTheDocument();
    });

    it('offers to replace a staged photo too', () => {
      renderField({ pending: PREPARED });
      expect(screen.getByText(/Replace photo/)).toBeInTheDocument();
    });

    it('offers to choose when there is nothing', () => {
      renderField();
      expect(screen.getByText(/Choose photo/)).toBeInTheDocument();
    });
  });

  describe('removing', () => {
    it('asks the form to stage a removal', () => {
      const { onRemove } = renderField({ photo: SAVED });

      fireEvent.click(screen.getByText('Remove photo'));

      expect(onRemove).toHaveBeenCalled();
    });

    it('says the removal is pending and offers to undo it', () => {
      const { onUndo } = renderField({ photo: SAVED, pendingRemoval: true });

      expect(screen.getByText(/removed when you press OK/)).toBeInTheDocument();
      expect(screen.queryByAltText(/provided by the organization/i)).not.toBeInTheDocument();

      fireEvent.click(screen.getByText('UNDO'));
      expect(onUndo).toHaveBeenCalled();
    });

    it('invites a new photo while a removal is staged', () => {
      renderField({ photo: SAVED, pendingRemoval: true });
      expect(screen.getByText(/Choose photo/)).toBeInTheDocument();
    });
  });

  it('shows an error handed down by the form', () => {
    renderField({ photo: SAVED, error: 'Could not save the photo. Please try again.' });

    expect(screen.getByText(/Could not save the photo/)).toBeInTheDocument();
  });
});
