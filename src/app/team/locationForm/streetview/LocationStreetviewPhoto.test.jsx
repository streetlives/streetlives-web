import React from 'react';
import { act, render, screen, fireEvent, waitFor } from '@testing-library/react';
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

// A promise the test resolves by hand, so the window while a save is in flight
// can be inspected.
const deferred = () => {
  let resolve;
  let reject;
  const promise = new Promise((res, rej) => { resolve = res; reject = rej; });
  return { promise, resolve, reject };
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
  let instance;
  render(<LocationStreetviewEdit ref={(el) => { instance = el; }} {...props} />);
  return { ...props, getInstance: () => instance };
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

  // Pressing OK and then CANCEL before the upload resolved used to close the
  // editor and still commit afterwards, which contradicts what CANCEL promises.
  describe('while a photo save is in flight', () => {
    const stageAndSubmit = async (overrides) => {
      const rendered = renderEditor(overrides);
      pickFile();
      await waitFor(() => expect(screen.getByText(/not saved yet/)).toBeInTheDocument());
      clickOk();
      return rendered;
    };

    it('disables CANCEL, so the race cannot be started', async () => {
      const upload = deferred();
      await stageAndSubmit({ onUploadPhoto: jest.fn(() => upload.promise) });

      await waitFor(() => expect(screen.getByText('CANCEL')).toBeDisabled());
      expect(screen.getByText('SAVING…')).toBeDisabled();

      upload.resolve();
    });

    it('does not commit when cancel is requested before the save resolves', async () => {
      const upload = deferred();
      const {
        updateValue,
        onSubmit,
        onCancel,
        getInstance,
      } = await stageAndSubmit({ onUploadPhoto: jest.fn(() => upload.promise) });

      // Bypassing the disabled button on purpose: this proves the guard holds on
      // its own, rather than relying only on the control being unavailable.
      getInstance().onCancel();
      expect(onCancel).toHaveBeenCalled();

      upload.resolve();
      // Let the continuation run. The paired test below commits within the same
      // flush, which is what makes these negatives mean something.
      await act(async () => {});

      expect(updateValue).not.toHaveBeenCalled();
      expect(onSubmit).not.toHaveBeenCalled();
    });

    it('commits as usual when nobody cancels', async () => {
      const upload = deferred();
      const { updateValue, onSubmit } = await stageAndSubmit({
        onUploadPhoto: jest.fn(() => upload.promise),
      });

      upload.resolve();
      await act(async () => {});

      expect(updateValue).toHaveBeenCalled();
      expect(onSubmit).toHaveBeenCalled();
    });

    it('keeps the photo controls inert so nothing can be staged behind the save', async () => {
      const upload = deferred();
      await stageAndSubmit({ onUploadPhoto: jest.fn(() => upload.promise) });

      await waitFor(() => expect(screen.getByText(/Replace photo/).closest('button'))
        .toBeDisabled());
      expect(screen.getByText('Remove photo').closest('button')).toBeDisabled();

      upload.resolve();
    });

    it('re-enables CANCEL once a failed save has been reported', async () => {
      const upload = deferred();
      await stageAndSubmit({ onUploadPhoto: jest.fn(() => upload.promise) });

      upload.reject(new Error('500'));

      await waitFor(() =>
        expect(screen.getByText(/Could not save the photo/)).toBeInTheDocument());
      expect(screen.getByText('CANCEL')).not.toBeDisabled();
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
