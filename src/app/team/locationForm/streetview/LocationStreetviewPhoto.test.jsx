import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
// Registers faCamera; the app does this at startup, tests have to ask for it.
import '../../../IconLibrary';
import LocationStreetviewEdit from './LocationStreetviewEdit';
import { readAndDownscale } from './photoUpload';

// The photo half of the Street View editor: choosing, replacing and removing a
// photo all stage a change that OK commits and CANCEL discards, like every
// other field on this question. Nothing reaches the API until OK.

jest.mock('react-google-maps', () => ({
  ...jest.requireActual('react-google-maps'),
  withScriptjs: Component => props => <Component {...props} />,
}));

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

let panoramaMock;

const setupGoogleMaps = () => {
  const listeners = {};
  panoramaMock = {
    addListener: jest.fn((event, handler) => { listeners[event] = handler; }),
    setPano: jest.fn(),
    setPosition: jest.fn(),
    setPov: jest.fn(),
    setZoom: jest.fn(),
    getPov: jest.fn(() => ({ heading: 0, pitch: 0 })),
    getZoom: jest.fn(() => 1),
    getPosition: jest.fn(() => ({ lat: () => 40.7128, lng: () => -74.006 })),
    getPano: jest.fn(() => 'pano-1'),
  };
  global.window.google = {
    maps: {
      StreetViewPanorama: jest.fn(() => panoramaMock),
      StreetViewService: jest.fn(() => ({ getPanorama: jest.fn() })),
      LatLng: jest.fn((lat, lng) => ({ lat: () => lat, lng: () => lng })),
      StreetViewStatus: { OK: 'OK' },
    },
  };
};

const renderEditor = (overrides = {}) => {
  const props = {
    value: null,
    resourceData: {
      id: 'loc-1',
      position: { coordinates: [-74.0060, 40.7128] },
      LocationPhoto: null,
    },
    updateValue: jest.fn(),
    onSubmit: jest.fn(),
    onCancel: jest.fn(),
    onUploadPhoto: jest.fn().mockResolvedValue(SAVED),
    onRemovePhoto: jest.fn().mockResolvedValue(),
    ...overrides,
  };
  render(<LocationStreetviewEdit {...props} />);
  return props;
};

const pickFile = () => {
  const file = new File(['bytes'], 'storefront.jpg', { type: 'image/jpeg' });
  const input = screen.getByTestId('photo-file-input');
  Object.defineProperty(input, 'files', { value: [file], configurable: true });
  fireEvent.change(input);
};

const clickOk = () => fireEvent.click(screen.getByText('OK'));

describe('Street View editor — staged photo', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    readAndDownscale.mockResolvedValue(PREPARED);
    setupGoogleMaps();
  });

  afterEach(() => {
    delete global.window.google;
  });

  describe('choosing a photo', () => {
    it('saves nothing until OK is pressed', async () => {
      const { onUploadPhoto, onSubmit } = renderEditor();

      pickFile();
      await waitFor(() => expect(screen.getByText(/not saved yet/)).toBeInTheDocument());

      expect(onUploadPhoto).not.toHaveBeenCalled();
      expect(onSubmit).not.toHaveBeenCalled();
    });

    it('uploads it on OK', async () => {
      const { onUploadPhoto, updateValue, onSubmit } = renderEditor();

      pickFile();
      await waitFor(() => expect(screen.getByText(/not saved yet/)).toBeInTheDocument());
      clickOk();

      await waitFor(() => expect(onUploadPhoto).toHaveBeenCalledWith(PREPARED));
      // The streetview fields still save, and the form still closes.
      await waitFor(() => expect(updateValue).toHaveBeenCalled());
      expect(onSubmit).toHaveBeenCalled();
    });

    it('discards it on CANCEL', async () => {
      const { onUploadPhoto, onCancel } = renderEditor();

      pickFile();
      await waitFor(() => expect(screen.getByText(/not saved yet/)).toBeInTheDocument());
      fireEvent.click(screen.getByText('CANCEL'));

      expect(onCancel).toHaveBeenCalled();
      expect(onUploadPhoto).not.toHaveBeenCalled();
    });
  });

  describe('removing a photo', () => {
    const withPhoto = () => renderEditor({
      resourceData: {
        id: 'loc-1',
        position: { coordinates: [-74.0060, 40.7128] },
        LocationPhoto: SAVED,
      },
    });

    it('removes nothing until OK is pressed', () => {
      const { onRemovePhoto } = withPhoto();

      fireEvent.click(screen.getByText('Remove photo'));

      expect(screen.getByText(/removed when you press OK/)).toBeInTheDocument();
      expect(onRemovePhoto).not.toHaveBeenCalled();
    });

    it('removes it on OK', async () => {
      const { onRemovePhoto, onSubmit } = withPhoto();

      fireEvent.click(screen.getByText('Remove photo'));
      clickOk();

      await waitFor(() => expect(onRemovePhoto).toHaveBeenCalled());
      expect(onSubmit).toHaveBeenCalled();
    });

    it('discards the removal on CANCEL', () => {
      const { onRemovePhoto } = withPhoto();

      fireEvent.click(screen.getByText('Remove photo'));
      fireEvent.click(screen.getByText('CANCEL'));

      expect(onRemovePhoto).not.toHaveBeenCalled();
    });

    it('can be undone before OK', () => {
      const { onRemovePhoto } = withPhoto();

      fireEvent.click(screen.getByText('Remove photo'));
      fireEvent.click(screen.getByText('UNDO'));

      expect(screen.getByAltText(/provided by the organization/i)).toBeInTheDocument();
      clickOk();
      expect(onRemovePhoto).not.toHaveBeenCalled();
    });

    // Picking a replacement and then removing it should drop the staged file,
    // not queue a delete of the photo that is still on the server.
    it('removing a freshly staged photo drops the file rather than deleting', async () => {
      const { onRemovePhoto, onUploadPhoto } = withPhoto();

      pickFile();
      await waitFor(() => expect(screen.getByText(/not saved yet/)).toBeInTheDocument());
      fireEvent.click(screen.getByText('Remove photo'));

      expect(screen.queryByText(/removed when you press OK/)).not.toBeInTheDocument();
      clickOk();

      await waitFor(() => expect(onRemovePhoto).not.toHaveBeenCalled());
      expect(onUploadPhoto).not.toHaveBeenCalled();
    });
  });

  describe('when saving the photo fails', () => {
    it('keeps the form open with the staged file intact', async () => {
      const { onUploadPhoto, updateValue, onSubmit } = renderEditor({
        onUploadPhoto: jest.fn().mockRejectedValue(new Error('500')),
      });

      pickFile();
      await waitFor(() => expect(screen.getByText(/not saved yet/)).toBeInTheDocument());
      clickOk();

      await waitFor(() =>
        expect(screen.getByText(/Could not save the photo/)).toBeInTheDocument());

      expect(onUploadPhoto).toHaveBeenCalled();
      // Neither of these may happen, or the file the specialist picked is lost.
      expect(updateValue).not.toHaveBeenCalled();
      expect(onSubmit).not.toHaveBeenCalled();
      expect(screen.getByText(/not saved yet/)).toBeInTheDocument();
    });

    it('reports a failed removal and stays open', async () => {
      const { onSubmit } = renderEditor({
        resourceData: {
          id: 'loc-1',
          position: { coordinates: [-74.0060, 40.7128] },
          LocationPhoto: SAVED,
        },
        onRemovePhoto: jest.fn().mockRejectedValue(new Error('500')),
      });

      fireEvent.click(screen.getByText('Remove photo'));
      clickOk();

      await waitFor(() =>
        expect(screen.getByText(/Could not remove the photo/)).toBeInTheDocument());
      expect(onSubmit).not.toHaveBeenCalled();
    });
  });

  it('leaves the photo alone when OK is pressed with nothing staged', async () => {
    const { onUploadPhoto, onRemovePhoto, onSubmit } = renderEditor({
      resourceData: {
        id: 'loc-1',
        position: { coordinates: [-74.0060, 40.7128] },
        LocationPhoto: SAVED,
      },
    });

    clickOk();

    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    expect(onUploadPhoto).not.toHaveBeenCalled();
    expect(onRemovePhoto).not.toHaveBeenCalled();
  });
});
