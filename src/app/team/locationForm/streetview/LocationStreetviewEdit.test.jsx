import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LocationStreetviewEdit from './LocationStreetviewEdit';

// Bypass the real script-loading gate so the wrapped panorama picker mounts immediately.
jest.mock('react-google-maps', () => ({
  ...jest.requireActual('react-google-maps'),
  withScriptjs: Component => props => <Component {...props} />,
}));

describe('LocationStreetviewEdit validation', () => {
  const mockUpdateValue = jest.fn();
  const mockOnSubmit = jest.fn();
  const mockOnCancel = jest.fn();

  const renderComponent = (value = null) => {
    return render(
      <LocationStreetviewEdit
        value={value}
        resourceData={{ position: { coordinates: [-74.0060, 40.7128] } }}
        updateValue={mockUpdateValue}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
        id="test-id"
        metaDataSection="streetview"
        fieldName="streetview"
      />,
    );
  };

  // Populated on mount so tests can fire panorama events and drive the pano service.
  let listeners;
  let panoramaMock;
  let panoramaResult;

  beforeEach(() => {
    listeners = {};
    panoramaResult = null;
    panoramaMock = {
      addListener: jest.fn((event, handler) => { listeners[event] = handler; }),
      setPano: jest.fn(),
      setPosition: jest.fn(),
      setPov: jest.fn(),
      getPov: jest.fn(() => ({ heading: 0, pitch: 0, zoom: 1 })),
      getPosition: jest.fn(() => null),
      getPano: jest.fn(() => null),
    };

    global.window.google = {
      maps: {
        StreetViewPanorama: jest.fn().mockImplementation(() => panoramaMock),
        StreetViewService: jest.fn().mockImplementation(() => ({
          getPanorama: jest.fn((req, cb) => {
            if (panoramaResult) cb(panoramaResult, 'OK');
          }),
        })),
        LatLng: jest.fn((lat, lng) => ({ lat, lng })),
        StreetViewStatus: { OK: 'OK' },
      },
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
    delete global.window.google;
  });

  describe('field-level validation', () => {
    it('accepts valid latitude', async () => {
      renderComponent();
      const latInput = screen.getByLabelText(/Latitude/);
      await userEvent.type(latInput, '40.7128');
      const lngInput = screen.getByLabelText(/Longitude/);
      await userEvent.type(lngInput, '-74.0060');
      fireEvent.click(screen.getByText('OK'));
      expect(screen.queryByText(/Must be between -90 and 90/)).not.toBeInTheDocument();
    });

    it('rejects latitude outside range', async () => {
      renderComponent();
      const latInput = screen.getByLabelText(/Latitude/);
      await userEvent.type(latInput, '91');
      fireEvent.click(screen.getByText('OK'));
      await waitFor(() => {
        expect(screen.getByText(/Must be between -90 and 90/)).toBeInTheDocument();
      });
    });

    it('accepts valid longitude', async () => {
      renderComponent();
      const lngInput = screen.getByLabelText(/Longitude/);
      await userEvent.type(lngInput, '-74.0060');
      const latInput = screen.getByLabelText(/Latitude/);
      await userEvent.type(latInput, '40.7128');
      fireEvent.click(screen.getByText('OK'));
      expect(screen.queryByText(/Must be between -180 and 180/)).not.toBeInTheDocument();
    });

    it('rejects longitude outside range', async () => {
      renderComponent();
      const lngInput = screen.getByLabelText(/Longitude/);
      await userEvent.type(lngInput, '181');
      fireEvent.click(screen.getByText('OK'));
      await waitFor(() => {
        expect(screen.getByText(/Must be between -180 and 180/)).toBeInTheDocument();
      });
    });

    it('accepts valid heading 0-360', async () => {
      renderComponent();
      const headingInput = screen.getByLabelText(/Heading/);
      await userEvent.type(headingInput, '180');
      fireEvent.click(screen.getByText('OK'));
      expect(screen.queryByText(/Must be between 0 and 360/)).not.toBeInTheDocument();
    });

    it('rejects pitch outside -90 to 90', async () => {
      renderComponent();
      const pitchInput = screen.getByLabelText(/Pitch/);
      await userEvent.type(pitchInput, '91');
      fireEvent.click(screen.getByText('OK'));
      await waitFor(() => {
        expect(screen.getByText(/Must be between -90 and 90/)).toBeInTheDocument();
      });
    });

    it('rejects non-integer FOV', async () => {
      renderComponent();
      const fovInput = screen.getByLabelText(/FOV/);
      await userEvent.type(fovInput, '75.5');
      fireEvent.click(screen.getByText('OK'));
      await waitFor(() => {
        expect(screen.getByText(/Must be a whole number between 10 and 120/)).toBeInTheDocument();
      });
    });

    it('rejects FOV outside 10-120', async () => {
      renderComponent();
      const fovInput = screen.getByLabelText(/FOV/);
      await userEvent.type(fovInput, '9');
      fireEvent.click(screen.getByText('OK'));
      await waitFor(() => {
        expect(screen.getByText(/Must be a whole number between 10 and 120/)).toBeInTheDocument();
      });
    });

    it('rejects pano_id over 128 characters', async () => {
      renderComponent();
      const panoInput = screen.getByLabelText(/Pano ID/);
      const longPano = 'x'.repeat(129);
      await userEvent.type(panoInput, longPano);
      fireEvent.click(screen.getByText('OK'));
      await waitFor(() => {
        expect(screen.getByText(/Must be 128 characters or fewer/)).toBeInTheDocument();
      });
    });
  });

  describe('cross-field validation', () => {
    it('requires both lat and lng together', async () => {
      renderComponent();
      const latInput = screen.getByLabelText(/Latitude/);
      await userEvent.type(latInput, '40.7128');
      fireEvent.click(screen.getByText('OK'));
      await waitFor(() => {
        expect(screen.getByText(/Required when latitude is provided/)).toBeInTheDocument();
      });
    });

    it('requires lat when lng provided', async () => {
      renderComponent();
      const lngInput = screen.getByLabelText(/Longitude/);
      await userEvent.type(lngInput, '-74.0060');
      fireEvent.click(screen.getByText('OK'));
      await waitFor(() => {
        expect(screen.getByText(/Required when longitude is provided/)).toBeInTheDocument();
      });
    });

    it('requires panoId or lat+lng when heading provided alone', async () => {
      renderComponent();
      const headingInput = screen.getByLabelText(/Heading/);
      await userEvent.type(headingInput, '45');
      fireEvent.click(screen.getByText('OK'));
      await waitFor(() => {
        expect(screen.getByText(/A Pano ID or both latitude and longitude are required/)).toBeInTheDocument();
      });
    });

    it('allows valid lat+lng pair without panoId', async () => {
      renderComponent();
      const latInput = screen.getByLabelText(/Latitude/);
      const lngInput = screen.getByLabelText(/Longitude/);
      await userEvent.type(latInput, '40.7128');
      await userEvent.type(lngInput, '-74.0060');
      fireEvent.click(screen.getByText('OK'));
      await waitFor(() => {
        expect(mockUpdateValue).toHaveBeenCalled();
      });
    });

    it('allows panoId alone without coordinates', async () => {
      renderComponent();
      const panoInput = screen.getByLabelText(/Pano ID/);
      await userEvent.type(panoInput, 'valid-pano-id');
      fireEvent.click(screen.getByText('OK'));
      await waitFor(() => {
        expect(mockUpdateValue).toHaveBeenCalled();
      });
    });

    it('treats whitespace-only panoId as empty', async () => {
      renderComponent();
      const latInput = screen.getByLabelText(/Latitude/);
      const lngInput = screen.getByLabelText(/Longitude/);
      const panoInput = screen.getByLabelText(/Pano ID/);
      await userEvent.type(latInput, '40.7128');
      await userEvent.type(lngInput, '-74.0060');
      await userEvent.type(panoInput, '   ');
      fireEvent.click(screen.getByText('OK'));
      await waitFor(() => {
        expect(mockUpdateValue).toHaveBeenCalledWith(
          expect.objectContaining({ pano_id: null }),
          expect.anything(),
          expect.anything(),
          expect.anything(),
        );
      });
    });
  });

  describe('form submission', () => {
    it('saves coordinates correctly', async () => {
      renderComponent();
      const latInput = screen.getByLabelText(/Latitude/);
      const lngInput = screen.getByLabelText(/Longitude/);
      await userEvent.type(latInput, '40.7128');
      await userEvent.type(lngInput, '-74.0060');
      fireEvent.click(screen.getByText('OK'));
      await waitFor(() => {
        expect(mockUpdateValue).toHaveBeenCalledWith(
          expect.objectContaining({
            lat: 40.7128,
            lng: -74.0060,
          }),
          expect.anything(),
          expect.anything(),
          expect.anything(),
        );
      });
    });

    it('persists null for empty fields', async () => {
      renderComponent();
      fireEvent.click(screen.getByText('OK'));
      await waitFor(() => {
        expect(mockUpdateValue).toHaveBeenCalledWith(
          expect.objectContaining({
            pano_id: null,
            lat: null,
            lng: null,
            heading: null,
            pitch: null,
            fov: null,
          }),
          expect.anything(),
          expect.anything(),
          expect.anything(),
        );
      });
    });

    it('calls onSubmit callback after updateValue', async () => {
      renderComponent();
      const latInput = screen.getByLabelText(/Latitude/);
      const lngInput = screen.getByLabelText(/Longitude/);
      await userEvent.type(latInput, '40.7128');
      await userEvent.type(lngInput, '-74.0060');
      fireEvent.click(screen.getByText('OK'));
      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalled();
      });
    });
  });

  describe('reset behavior', () => {
    // renderComponent passes the location at [-74.0060, 40.7128] (lng, lat); the override
    // below sits somewhere else entirely, so the two are easy to tell apart.
    const overrideElsewhere = {
      pano_id: 'test-pano',
      lat: 35.6762,
      lng: 139.6503,
      heading: 45,
      pitch: 15,
      fov: 85,
    };

    it('clears all fields on reset', () => {
      renderComponent(overrideElsewhere);

      fireEvent.click(screen.getByText('Reset to default'));

      expect(screen.getByLabelText(/Latitude/).value).toBe('');
      expect(screen.getByLabelText(/Longitude/).value).toBe('');
      expect(screen.getByLabelText(/Heading/).value).toBe('');
      expect(screen.getByLabelText(/Pitch/).value).toBe('');
      expect(screen.getByLabelText(/FOV/).value).toBe('');
      expect(screen.getByLabelText(/Pano ID/).value).toBe('');
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it("moves the panorama to the location's own coordinates, not the override", () => {
      renderComponent(overrideElsewhere);

      fireEvent.click(screen.getByText('Reset to default'));

      expect(panoramaMock.setPosition).toHaveBeenCalledWith({ lat: 40.7128, lng: -74.0060 });
    });

    it('does not re-pin the saved pano on reset', () => {
      renderComponent(overrideElsewhere);

      fireEvent.click(screen.getByText('Reset to default'));

      expect(panoramaMock.setPano).not.toHaveBeenCalled();
    });

    it('restores the default point of view', () => {
      renderComponent(overrideElsewhere);

      fireEvent.click(screen.getByText('Reset to default'));

      expect(panoramaMock.setPov).toHaveBeenCalledWith({ heading: 0, pitch: 0, zoom: 1 });
    });

    it('captures the reset location after resetting', () => {
      panoramaResult = {
        time: [
          { pano: 'home-2020', date: new Date('2020-06-01') },
          { pano: 'home-2024', date: new Date('2024-06-01') },
        ],
      };
      renderComponent(overrideElsewhere);

      fireEvent.click(screen.getByText('Reset to default'));

      // The panorama settles on the location's latest imagery, so no pin is needed.
      panoramaMock.getPosition = jest.fn(() => ({ lat: () => 40.7128, lng: () => -74.0060 }));
      panoramaMock.getPano = jest.fn(() => 'home-2024');
      listeners.pano_changed();
      listeners.position_changed();

      fireEvent.click(screen.getByText('Capture current view'));

      expect(screen.getByLabelText(/Latitude/).value).toBe('40.7128');
      expect(screen.getByLabelText(/Longitude/).value).toBe('-74.006');
      expect(screen.getByLabelText(/Pano ID/).value).toBe('');
    });
  });

  describe('capture: pano ID only pinned for non-latest imagery', () => {
    // Two capture dates at the same spot, so the year picker renders. 2023 is the latest.
    const twoYears = {
      time: [
        { pano: 'pano-2019', date: new Date('2019-06-01') },
        { pano: 'pano-2023', date: new Date('2023-06-01') },
      ],
    };

    // Mimic the panorama moving to a given pano, as Google does on load, on a year
    // change, and when the user walks.
    const showPano = (panoId) => {
      panoramaMock.getPano = jest.fn(() => panoId);
      listeners.pano_changed();
    };

    const panoIdField = () => screen.getByLabelText(/Pano ID/);

    it('leaves Pano ID empty when the latest image is showing', () => {
      panoramaResult = twoYears;
      renderComponent();
      showPano('pano-2023');

      fireEvent.click(screen.getByText('Capture current view'));

      expect(panoIdField().value).toBe('');
    });

    it('fills Pano ID after the user picks an older year', () => {
      panoramaResult = twoYears;
      renderComponent();

      fireEvent.change(screen.getByRole('combobox'), { target: { value: 'pano-2019' } });
      fireEvent.click(screen.getByText('Capture current view'));

      expect(panoIdField().value).toBe('pano-2019');
    });

    it('leaves Pano ID empty when the user picks the latest year', () => {
      panoramaResult = twoYears;
      renderComponent();

      fireEvent.change(screen.getByRole('combobox'), { target: { value: 'pano-2023' } });
      fireEvent.click(screen.getByText('Capture current view'));

      expect(panoIdField().value).toBe('');
    });

    it('keeps an existing pin while its older image is still showing', () => {
      panoramaResult = twoYears;
      renderComponent({ pano_id: 'pano-2019', lat: 40.7128, lng: -74.0060 });

      fireEvent.click(screen.getByText('Capture current view'));

      expect(panoIdField().value).toBe('pano-2019');
    });

    it('clears a stale pin once the user walks to the latest image elsewhere', () => {
      panoramaResult = twoYears;
      renderComponent({ pano_id: 'pano-2019', lat: 40.7128, lng: -74.0060 });

      // Walk to a new spot whose newest capture is what gets shown.
      panoramaResult = {
        time: [
          { pano: 'other-2020', date: new Date('2020-06-01') },
          { pano: 'other-2024', date: new Date('2024-06-01') },
        ],
      };
      panoramaMock.getPosition = jest.fn(() => ({ lat: () => 41, lng: () => -75 }));
      showPano('other-2024');
      listeners.position_changed();

      fireEvent.click(screen.getByText('Capture current view'));

      expect(panoIdField().value).toBe('');
    });

    it('pins the new pano when an older image is showing after walking', () => {
      panoramaResult = twoYears;
      renderComponent();

      panoramaResult = {
        time: [
          { pano: 'other-2020', date: new Date('2020-06-01') },
          { pano: 'other-2024', date: new Date('2024-06-01') },
        ],
      };
      panoramaMock.getPosition = jest.fn(() => ({ lat: () => 41, lng: () => -75 }));
      showPano('other-2020');
      listeners.position_changed();

      fireEvent.click(screen.getByText('Capture current view'));

      expect(panoIdField().value).toBe('other-2020');
    });

    it('leaves Pano ID empty when the spot has only one capture date', () => {
      panoramaResult = { time: [{ pano: 'only-pano', date: new Date('2023-06-01') }] };
      renderComponent();
      showPano('only-pano');

      fireEvent.click(screen.getByText('Capture current view'));

      expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
      expect(panoIdField().value).toBe('');
    });

    it('clears the pano ID on reset', () => {
      panoramaResult = twoYears;
      renderComponent({ pano_id: 'pano-2019', lat: 40.7128, lng: -74.0060 });

      fireEvent.click(screen.getByText('Reset to default'));

      expect(panoIdField().value).toBe('');
    });
  });

  describe('initialization', () => {
    it('loads existing override values', () => {
      const value = {
        pano_id: 'existing-pano',
        lat: 35.6762,
        lng: 139.6503,
        heading: 90,
        pitch: 20,
        fov: 75,
      };
      renderComponent(value);
      expect(screen.getByDisplayValue('35.6762')).toBeInTheDocument();
      expect(screen.getByDisplayValue('139.6503')).toBeInTheDocument();
      expect(screen.getByDisplayValue('90')).toBeInTheDocument();
      expect(screen.getByDisplayValue('20')).toBeInTheDocument();
      expect(screen.getByDisplayValue('75')).toBeInTheDocument();
      expect(screen.getByDisplayValue('existing-pano')).toBeInTheDocument();
    });

    it('starts with empty fields when no value', () => {
      renderComponent();
      expect(screen.getByLabelText(/Latitude/).value).toBe('');
      expect(screen.getByLabelText(/Longitude/).value).toBe('');
      expect(screen.getByLabelText(/Heading/).value).toBe('');
      expect(screen.getByLabelText(/Pitch/).value).toBe('');
      expect(screen.getByLabelText(/FOV/).value).toBe('');
      expect(screen.getByLabelText(/Pano ID/).value).toBe('');
    });
  });
});
