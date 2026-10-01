import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
// Registers faCamera; the app does this at startup, tests have to ask for it.
import '../../../IconLibrary';
import LocationPhotoField from './LocationPhotoField';
import { readAndDownscale } from './photoUpload';
import { PREVIEW_WIDTH } from './utils';

// jsdom has no canvas, so the resize step is stubbed wholesale. Its sizing rule
// is covered separately in photoUpload.test.js.
jest.mock('./photoUpload', () => ({
  readAndDownscale: jest.fn(),
  ACCEPT_ATTRIBUTE: 'image/jpeg,image/png,image/webp',
}));

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
    readAndDownscale.mockResolvedValue(PREPARED);
  });

  describe('choosing a photo', () => {
    it('accepts only the formats the API allows', () => {
      renderField();
      expect(screen.getByTestId('photo-file-input'))
        .toHaveAttribute('accept', 'image/jpeg,image/png,image/webp');
    });

    // The whole point of this field: picking a file changes nothing on the
    // server. The enclosing form commits it on OK.
    it('stages the resized photo rather than saving it', async () => {
      const { onStage } = renderField();

      const file = pickFile();

      await waitFor(() => expect(onStage).toHaveBeenCalledWith(PREPARED));
      expect(readAndDownscale).toHaveBeenCalledWith(file);
    });

    it('reports a resize failure without staging anything', async () => {
      readAndDownscale.mockRejectedValue(new Error('That image is still too large.'));
      const { onStage, onError } = renderField();

      pickFile();

      await waitFor(() =>
        expect(onError).toHaveBeenCalledWith('That image is still too large.'));
      expect(onStage).not.toHaveBeenCalled();
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
