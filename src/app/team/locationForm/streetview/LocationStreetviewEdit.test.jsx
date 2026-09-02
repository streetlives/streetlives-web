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

  beforeEach(() => {
    global.window.google = {
      maps: {
        StreetViewPanorama: jest.fn().mockImplementation(() => ({
          addListener: jest.fn(),
          setPano: jest.fn(),
          setPosition: jest.fn(),
          setPov: jest.fn(),
          getPov: jest.fn(() => ({ heading: 0, pitch: 0, zoom: 1 })),
          getPosition: jest.fn(() => null),
          getPano: jest.fn(() => null),
        })),
        StreetViewService: jest.fn().mockImplementation(() => ({
          getPanorama: jest.fn(),
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
    it('clears all fields on reset', async () => {
      const value = {
        pano_id: 'test-pano',
        lat: 40.7128,
        lng: -74.0060,
        heading: 45,
        pitch: 15,
        fov: 85,
      };
      renderComponent(value);
      const resetButton = screen.getByText('Reset to default');
      fireEvent.click(resetButton);
      expect(mockOnSubmit).not.toHaveBeenCalled();
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
