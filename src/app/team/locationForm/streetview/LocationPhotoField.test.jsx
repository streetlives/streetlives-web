import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
// Registers faCamera; the app does this at startup, tests have to ask for it.
import '../../../IconLibrary';
import LocationPhotoField from './LocationPhotoField';
import { PREVIEW_WIDTH } from './utils';
import { readAndDownscale } from './photoUpload';

// jsdom has no canvas, so the resize step is stubbed wholesale. Its sizing rule
// is covered separately in photoUpload.test.js.
jest.mock('./photoUpload', () => ({
  readAndDownscale: jest.fn(),
  ACCEPT_ATTRIBUTE: 'image/jpeg,image/png,image/webp',
}));

const PREPARED = {
  data: 'YmFzZTY0',
  contentType: 'image/jpeg',
  filename: 'storefront.jpg',
  byteSize: 1234,
};

const PHOTO = {
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

const renderField = (props = {}) => render(<LocationPhotoField
  onUpload={jest.fn().mockResolvedValue(PHOTO)}
  onRemove={jest.fn().mockResolvedValue()}
  {...props}
/>);

describe('LocationPhotoField', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    readAndDownscale.mockResolvedValue(PREPARED);
  });

  describe('with no photo yet', () => {
    it('offers to choose one', () => {
      renderField();
      expect(screen.getByText(/Choose photo/)).toBeInTheDocument();
    });

    it('accepts only the formats the API allows', () => {
      renderField();
      expect(screen.getByTestId('photo-file-input'))
        .toHaveAttribute('accept', 'image/jpeg,image/png,image/webp');
    });

    // The enclosing form's CANCEL does not undo an upload, so the screen has to
    // say so rather than leave the specialist to find out.
    it('warns that the upload saves immediately', () => {
      renderField();
      expect(screen.getByText(/Saved as soon as you choose it/)).toBeInTheDocument();
    });
  });

  describe('uploading', () => {
    it('resizes then uploads the prepared payload', async () => {
      const onUpload = jest.fn().mockResolvedValue(PHOTO);
      renderField({ onUpload });

      const file = pickFile();

      await waitFor(() => expect(onUpload).toHaveBeenCalledWith(PREPARED));
      expect(readAndDownscale).toHaveBeenCalledWith(file);
    });

    it('confirms when it is saved', async () => {
      renderField();
      pickFile();

      await waitFor(() => expect(screen.getByText('Saved.')).toBeInTheDocument());
    });

    it('surfaces a resize failure without calling the API', async () => {
      const onUpload = jest.fn();
      readAndDownscale.mockRejectedValue(new Error('That image is still too large.'));
      renderField({ onUpload });

      pickFile();

      await waitFor(() =>
        expect(screen.getByText('That image is still too large.')).toBeInTheDocument());
      expect(onUpload).not.toHaveBeenCalled();
    });

    // The rest of this app leaves failures to the global ErrorBar. That is wrong
    // here: the specialist has to re-pick the file, so the error belongs on the
    // control that failed.
    it('surfaces an upload failure in place', async () => {
      const onUpload = jest.fn().mockRejectedValue(new Error('500'));
      renderField({ onUpload });

      pickFile();

      await waitFor(() =>
        expect(screen.getByText(/Upload failed/)).toBeInTheDocument());
    });
  });

  describe('with a photo', () => {
    it('shows it with its details', () => {
      renderField({ photo: PHOTO });

      expect(screen.getByAltText(/provided by the organization/i))
        .toHaveAttribute('src', PHOTO.url);
      expect(screen.getByText(/storefront\.jpg/)).toBeInTheDocument();
      expect(screen.getByText(/1600×1200/)).toBeInTheDocument();
    });

    // An organization's photo is whatever shape their camera produced. Left to
    // size itself it dwarfed the Street View still beside it, which is the
    // thing the specialist is comparing it against.
    it('crops the photo into the same box as the Street View still', () => {
      renderField({ photo: PHOTO });

      const img = screen.getByAltText(/provided by the organization/i);
      expect(img).toHaveStyle({ objectFit: 'cover', width: '100%', height: '100%' });
      // jsdom's CSS parser drops aspect-ratio, so it never reaches computed
      // style. The ratio itself is pinned as data in utils.test.js instead.
      expect(img.parentElement).toHaveStyle({
        width: `${PREVIEW_WIDTH}px`,
        overflow: 'hidden',
      });
    });

    it('offers to replace rather than choose', () => {
      renderField({ photo: PHOTO });
      expect(screen.getByText(/Replace photo/)).toBeInTheDocument();
    });

    it('asks before removing', () => {
      const onRemove = jest.fn();
      renderField({ photo: PHOTO, onRemove });

      fireEvent.click(screen.getByText('Remove photo'));

      expect(screen.getByText(/Remove this photo\?/)).toBeInTheDocument();
      expect(onRemove).not.toHaveBeenCalled();
    });

    it('removes once confirmed', async () => {
      const onRemove = jest.fn().mockResolvedValue();
      renderField({ photo: PHOTO, onRemove });

      fireEvent.click(screen.getByText('Remove photo'));
      fireEvent.click(screen.getByText('YES, REMOVE'));

      await waitFor(() => expect(onRemove).toHaveBeenCalled());
    });

    it('backs out of removal', () => {
      const onRemove = jest.fn();
      renderField({ photo: PHOTO, onRemove });

      fireEvent.click(screen.getByText('Remove photo'));
      fireEvent.click(screen.getByText('KEEP IT'));

      expect(onRemove).not.toHaveBeenCalled();
      expect(screen.getByText('Remove photo')).toBeInTheDocument();
    });

    it('reports a failed removal', async () => {
      const onRemove = jest.fn().mockRejectedValue(new Error('500'));
      renderField({ photo: PHOTO, onRemove });

      fireEvent.click(screen.getByText('Remove photo'));
      fireEvent.click(screen.getByText('YES, REMOVE'));

      await waitFor(() =>
        expect(screen.getByText(/Could not remove the photo/)).toBeInTheDocument());
    });
  });
});
