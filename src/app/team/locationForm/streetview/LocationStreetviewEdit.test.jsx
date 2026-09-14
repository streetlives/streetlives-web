import React from 'react';
import { act, render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LocationStreetviewEdit from './LocationStreetviewEdit';

// Bypass the real script-loading gate so the wrapped panorama picker mounts immediately.
// The real withScriptjs renders a placeholder until the Maps script loads. Default to
// "already loaded"; the slow-script test flips this to exercise the other mount order.
let mockScriptLoaded = true;

jest.mock('react-google-maps', () => ({
  ...jest.requireActual('react-google-maps'),
  withScriptjs: Component => props => (
    mockScriptLoaded ? <Component {...props} /> : <div>loading</div>
  ),
}));

describe('LocationStreetviewEdit validation', () => {
  const mockUpdateValue = jest.fn();
  const mockOnSubmit = jest.fn();
  const mockOnCancel = jest.fn();

  const renderCollapsed = (value = null) => {
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

  // The heading/pitch/FOV/pano-ID fields are collapsed by default now. Existing tests are
  // all about those fields, so the shared helper expands them; tests that care about the
  // collapsed state call renderComponent.collapsed instead.
  const renderComponent = (value = null) => {
    const result = renderCollapsed(value);
    const toggle = screen.queryByText('Show advanced fields');
    // A value with a pano_id mounts already expanded, so the button reads "Hide ...".
    if (toggle) fireEvent.click(toggle);
    return result;
  };

  // There is no capture button any more: the fields follow the panorama once the
  // specialist has handled it. A mouse press on the container is that signal, and the
  // panorama event is the move itself.
  const moveView = () => {
    fireEvent.mouseDown(screen.getByTestId('streetview-panorama'));
    listeners.pov_changed();
  };

  // Let the capture debounce elapse, so a test can tell a capture that ran from one that
  // deliberately did not.
  const settle = () => act(async () => {
    await new Promise(resolve => setTimeout(resolve, 300));
  });

  // Populated on mount so tests can fire panorama events and drive the pano service.
  let listeners;
  let panoramaMock;
  let panoramaResult;
  // Every getPanorama call, so a test can answer them in whatever order it likes.
  let panoRequests;
  // Set by tests that answer the requests themselves.
  let deferPanoResponses;

  beforeEach(() => {
    mockScriptLoaded = true;
    listeners = {};
    panoramaResult = null;
    panoRequests = [];
    deferPanoResponses = false;
    panoramaMock = {
      addListener: jest.fn((event, handler) => { listeners[event] = handler; }),
      setPano: jest.fn(),
      setPosition: jest.fn(),
      setPov: jest.fn(),
      setZoom: jest.fn(),
      // The real StreetViewPov has only heading and pitch; zoom is its own property.
      getPov: jest.fn(() => ({ heading: 0, pitch: 0 })),
      getZoom: jest.fn(() => 1),
      getPosition: jest.fn(() => null),
      getPano: jest.fn(() => null),
    };

    global.window.google = {
      maps: {
        StreetViewPanorama: jest.fn().mockImplementation(() => panoramaMock),
        StreetViewService: jest.fn().mockImplementation(() => ({
          getPanorama: jest.fn((req, cb) => {
            panoRequests.push({ req, cb });
            if (!deferPanoResponses && panoramaResult) cb(panoramaResult, 'OK');
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

      expect(panoramaMock.setPov).toHaveBeenCalledWith({ heading: 0, pitch: 0 });
      // Zoom is reset through its own setter, not smuggled through the pov.
      expect(panoramaMock.setZoom).toHaveBeenCalledWith(1);
    });

    // Google walks the panorama to the default position after a reset, firing the same
    // events a specialist's drag would.
    const settleOnDefault = () => {
      panoramaResult = {
        time: [
          { pano: 'home-2020', date: new Date('2020-06-01') },
          { pano: 'home-2024', date: new Date('2024-06-01') },
        ],
      };
      panoramaMock.getPosition = jest.fn(() => ({ lat: () => 40.7128, lng: () => -74.0060 }));
      panoramaMock.getPano = jest.fn(() => 'home-2024');
      listeners.pano_changed();
      listeners.position_changed();
    };

    it('still follows the view after resetting an already-default panorama', async () => {
      renderComponent(overrideElsewhere);
      // The panorama is loaded and settled on the image at the default location.
      panoramaMock.getPano = jest.fn(() => 'already-here');
      panoramaMock.getPosition = jest.fn(() => ({ lat: () => 40.7128, lng: () => -74.0060 }));
      listeners.pano_changed();
      listeners.position_changed();

      // Reset moves it nowhere, so no event arrives to say what it is showing.
      fireEvent.click(screen.getByText('Reset to default'));
      moveView();
      await settle();

      expect(screen.getByLabelText(/Latitude/).value).toBe('40.7128');
      expect(screen.getByLabelText(/Longitude/).value).toBe('-74.006');
    });

    it('leaves the fields empty while the panorama settles', async () => {
      renderComponent(overrideElsewhere);

      fireEvent.click(screen.getByText('Reset to default'));
      settleOnDefault();
      await settle();

      // The panorama moving itself is not the specialist asking for an override, so the
      // fields reset just cleared stay cleared.
      expect(screen.getByLabelText(/Latitude/).value).toBe('');
      expect(screen.getByLabelText(/Longitude/).value).toBe('');
    });

    it('takes the reset location once the specialist moves the view again', async () => {
      renderComponent(overrideElsewhere);

      fireEvent.click(screen.getByText('Reset to default'));
      settleOnDefault();
      moveView();
      await settle();

      expect(screen.getByLabelText(/Latitude/).value).toBe('40.7128');
      expect(screen.getByLabelText(/Longitude/).value).toBe('-74.006');
      // The location's latest imagery is showing, so no pin is needed.
      expect(screen.getByLabelText(/Pano ID/).value).toBe('');
    });
  });

  describe('capture: the fields follow the panorama', () => {
    const atSpot = { lat: () => 41, lng: () => -75 };

    it('has no capture button to press', () => {
      renderComponent();

      expect(screen.queryByText('Capture current view')).not.toBeInTheDocument();
      expect(screen.getByText('Reset to default')).toBeInTheDocument();
    });

    it('fills the fields once the specialist moves the view', async () => {
      renderComponent();
      panoramaMock.getPosition = jest.fn(() => atSpot);
      panoramaMock.getPov = jest.fn(() => ({ heading: 200, pitch: 5 }));

      moveView();
      await settle();

      expect(screen.getByLabelText(/Latitude/).value).toBe('41');
      expect(screen.getByLabelText(/Longitude/).value).toBe('-75');
      expect(screen.getByLabelText(/Heading/).value).toBe('200');
      expect(screen.getByLabelText(/Pitch/).value).toBe('5');
    });

    it('takes the view as soon as a drag ends, without waiting', () => {
      renderComponent();
      panoramaMock.getPosition = jest.fn(() => atSpot);
      panoramaMock.getPov = jest.fn(() => ({ heading: 120, pitch: 0 }));

      const panorama = screen.getByTestId('streetview-panorama');
      fireEvent.mouseDown(panorama);
      listeners.pov_changed();
      fireEvent.mouseUp(panorama);

      // No settle(): letting go and pressing OK straight away must keep the adjustment.
      expect(screen.getByLabelText(/Heading/).value).toBe('120');
    });

    it('saves the view when OK is pressed before the capture settles', async () => {
      renderComponent();
      panoramaMock.getPosition = jest.fn(() => atSpot);
      panoramaMock.getPov = jest.fn(() => ({ heading: 200, pitch: 5 }));

      // A wheel zoom, an arrow key, or a drag released off the panorama leaves the
      // capture pending; OK pressed inside that quarter-second must still save the view.
      moveView();
      fireEvent.click(screen.getByText('OK'));

      await waitFor(() => expect(mockUpdateValue).toHaveBeenCalled());
      expect(mockUpdateValue).toHaveBeenCalledWith(
        expect.objectContaining({ lat: 41, lng: -75, heading: 200 }),
        expect.anything(),
        expect.anything(),
        expect.anything(),
      );
    });

    it('ignores a year list that arrives after a newer one', async () => {
      deferPanoResponses = true;
      renderComponent();

      // Walk to a new spot. Its request is issued second but answered first.
      panoramaMock.getPosition = jest.fn(() => atSpot);
      panoramaMock.getPano = jest.fn(() => 'here-2020');
      listeners.pano_changed();
      listeners.position_changed();

      const [stale, fresh] = panoRequests;
      fresh.cb({
        time: [
          { pano: 'here-2020', date: new Date('2020-06-01') },
          { pano: 'here-2024', date: new Date('2024-06-01') },
        ],
      }, 'OK');
      // The spot we left, answering late. Its newest image happens to be the pano now on
      // screen, so letting it through would drop the pin the current spot needs.
      stale.cb({
        time: [
          { pano: 'gone-2019', date: new Date('2019-06-01') },
          { pano: 'here-2020', date: new Date('2020-06-01') },
        ],
      }, 'OK');

      moveView();
      await settle();

      expect(screen.getByLabelText(/Pano ID/).value).toBe('here-2020');
    });

    it('does not let a late year list overwrite a manual edit', async () => {
      deferPanoResponses = true;
      renderComponent();
      panoramaMock.getPosition = jest.fn(() => atSpot);

      moveView();
      await settle();
      // The specialist corrects a coordinate by hand after moving the view.
      fireEvent.change(screen.getByLabelText(/Latitude/), { target: { value: '40.5' } });

      // The year list for that move comes back afterwards and schedules its own capture.
      panoRequests[panoRequests.length - 1].cb({
        time: [
          { pano: 'here-2020', date: new Date('2020-06-01') },
          { pano: 'here-2024', date: new Date('2024-06-01') },
        ],
      }, 'OK');
      await settle();

      expect(screen.getByLabelText(/Latitude/).value).toBe('40.5');
    });

    it('pins nothing while the year list for a new spot is still coming', async () => {
      panoramaResult = {
        time: [
          { pano: 'there-2019', date: new Date('2019-06-01') },
          { pano: 'there-2023', date: new Date('2023-06-01') },
        ],
      };
      renderComponent();

      // Walk somewhere else and save before its year list arrives. The list we hold
      // describes the spot we left, and against it this pano looks historical — pinning
      // it would freeze the override on what may be the newest image here.
      deferPanoResponses = true;
      panoramaMock.getPosition = jest.fn(() => atSpot);
      panoramaMock.getPano = jest.fn(() => 'here-2024');
      listeners.pano_changed();
      listeners.position_changed();

      moveView();
      await settle();

      expect(screen.getByLabelText(/Pano ID/).value).toBe('');
      expect(screen.getByLabelText(/Latitude/).value).toBe('41');
    });

    it('keeps a picked year even before its list comes back', async () => {
      panoramaResult = {
        time: [
          { pano: 'pano-2019', date: new Date('2019-06-01') },
          { pano: 'pano-2023', date: new Date('2023-06-01') },
        ],
      };
      renderComponent();
      panoramaMock.getPosition = jest.fn(() => atSpot);

      // Historical images sit at slightly different coordinates, so picking a year can
      // itself start a new request. The choice was explicit and must survive it.
      deferPanoResponses = true;
      fireEvent.change(screen.getByRole('combobox'), { target: { value: 'pano-2019' } });
      panoramaMock.getPano = jest.fn(() => 'pano-2019');
      listeners.pano_changed();
      listeners.position_changed();
      await settle();

      expect(screen.getByLabelText(/Pano ID/).value).toBe('pano-2019');
    });

    describe('picking a year while the image is still switching', () => {
      const years = {
        time: [
          { pano: 'pano-2019', date: new Date('2019-06-01') },
          { pano: 'pano-2023', date: new Date('2023-06-01') },
        ],
      };

      // setPano only starts the switch; until pano_changed reports it, the panorama still
      // answers with the image on its way out.
      const finishSwitch = (panoId) => {
        panoramaMock.getPosition = jest.fn(() => atSpot);
        panoramaMock.getPano = jest.fn(() => panoId);
        listeners.pano_changed();
        listeners.position_changed();
      };

    it('refuses to save while the picked image is still switching', async () => {
        panoramaResult = years;
        renderComponent();

        fireEvent.change(screen.getByRole('combobox'), { target: { value: 'pano-2019' } });
        fireEvent.click(screen.getByText('OK'));

        // Saving here would store the outgoing image's coordinates under the incoming
        // image's pin, so it says so instead.
        expect(mockUpdateValue).not.toHaveBeenCalled();
        expect(screen.getByText(/still loading/)).toBeInTheDocument();

        finishSwitch('pano-2019');
        await settle();
        fireEvent.click(screen.getByText('OK'));

        await waitFor(() => expect(mockUpdateValue).toHaveBeenCalled());
        expect(mockUpdateValue).toHaveBeenCalledWith(
          expect.objectContaining({ pano_id: 'pano-2019', lat: 41, lng: -75 }),
          expect.anything(),
          expect.anything(),
          expect.anything(),
        );
      });

      it('refuses to save the old coordinates when the latest year is picked', async () => {
        panoramaResult = years;
        // An override pinned to the historical image, whose coordinates are in the fields.
        renderComponent({ pano_id: 'pano-2019', lat: 35.6762, lng: 139.6503 });
        panoramaMock.getPano = jest.fn(() => 'pano-2019');

        // Picking the latest year clears the pin, which would leave the historical
        // image's coordinates standing alone and point the override somewhere else.
        fireEvent.change(screen.getByRole('combobox'), { target: { value: 'pano-2023' } });
        fireEvent.click(screen.getByText('OK'));

        expect(mockUpdateValue).not.toHaveBeenCalled();
        // Untouched: the fields still describe the image that is actually on screen.
        expect(screen.getByLabelText(/Pano ID/).value).toBe('pano-2019');

        finishSwitch('pano-2023');
        await settle();
        fireEvent.click(screen.getByText('OK'));

        await waitFor(() => expect(mockUpdateValue).toHaveBeenCalled());
        // The latest image's own coordinates, and no pin, so it tracks future captures.
        expect(mockUpdateValue).toHaveBeenCalledWith(
          expect.objectContaining({ pano_id: null, lat: 41, lng: -75 }),
          expect.anything(),
          expect.anything(),
          expect.anything(),
        );
      });

      it('does not take the outgoing image\u2019s coordinates for the new pin', async () => {
        panoramaResult = years;
        renderComponent();
        // Where the panorama still is: the image being replaced.
        panoramaMock.getPosition = jest.fn(() => ({ lat: () => 10, lng: () => 20 }));

        fireEvent.change(screen.getByRole('combobox'), { target: { value: 'pano-2019' } });
        listeners.pov_changed();
        await settle();

        // Neither half of the outgoing image reaches the fields.
        expect(screen.getByLabelText(/Pano ID/).value).toBe('');
        expect(screen.getByLabelText(/Latitude/).value).toBe('');

        // Once the switch lands, the chosen image's own position is what gets recorded.
        finishSwitch('pano-2019');
        await settle();

        expect(screen.getByLabelText(/Latitude/).value).toBe('41');
        expect(screen.getByLabelText(/Pano ID/).value).toBe('pano-2019');
      });

      it('keeps refusing until the picked image reports its position', async () => {
        panoramaResult = years;
        // An override on the historical image, so its coordinates are what OK would save.
        renderComponent({ pano_id: 'pano-2019', lat: 35.6762, lng: 139.6503 });

        fireEvent.change(screen.getByRole('combobox'), { target: { value: 'pano-2023' } });
        // The id changes first; the position still belongs to the image on its way out.
        panoramaMock.getPano = jest.fn(() => 'pano-2023');
        panoramaMock.getPosition = jest.fn(() => ({ lat: () => 35.6762, lng: () => 139.6503 }));
        listeners.pano_changed();
        fireEvent.click(screen.getByText('OK'));

        expect(mockUpdateValue).not.toHaveBeenCalled();
        expect(screen.getByText(/still loading/)).toBeInTheDocument();

        // Now the position lands, and with it a view worth saving.
        panoramaMock.getPosition = jest.fn(() => atSpot);
        listeners.position_changed();
        await settle();
        fireEvent.click(screen.getByText('OK'));

        await waitFor(() => expect(mockUpdateValue).toHaveBeenCalled());
        expect(mockUpdateValue).toHaveBeenCalledWith(
          expect.objectContaining({ pano_id: null, lat: 41, lng: -75 }),
          expect.anything(),
          expect.anything(),
          expect.anything(),
        );
      });

      // Two images can sit close enough together that position_changed never fires, so
      // the wait gives up rather than block saving for good. What it does then depends on
      // whether the picked image is the one on screen.
      const waitOutTheSwitch = (panoId) => {
        jest.useFakeTimers();
        try {
          fireEvent.change(screen.getByRole('combobox'), { target: { value: panoId } });
          act(() => {
            jest.advanceTimersByTime(5000);
            jest.advanceTimersByTime(300);
          });
        } finally {
          jest.useRealTimers();
        }
      };

      it('writes off a switch whose position never arrives', async () => {
        panoramaResult = years;
        // An override on the historical image; those are the coordinates in the fields.
        renderComponent({ pano_id: 'pano-2019', lat: 35.6762, lng: 139.6503 });
        // The id says the newest image is up, but the position is still the old one — and
        // nothing here can tell a position that will not change from one that is late.
        panoramaMock.getPano = jest.fn(() => 'pano-2023');
        panoramaMock.getPosition = jest.fn(() => ({ lat: () => 35.6762, lng: () => 139.6503 }));

        waitOutTheSwitch('pano-2023');

        // The screen now shows one image while the fields describe another, and the form
        // says which one saving would store rather than leave that to be discovered.
        expect(screen.getByText(/never finished loading/)).toBeInTheDocument();

        // Giving up on the wait only unblocks saving. The panorama is no more readable
        // than it was, so a later turn of the view still captures nothing from it.
        listeners.pov_changed();
        await settle();
        expect(screen.getByLabelText(/Pano ID/).value).toBe('pano-2019');
        expect(screen.getByLabelText(/Latitude/).value).toBe('35.6762');

        fireEvent.click(screen.getByText('OK'));

        await waitFor(() => expect(mockUpdateValue).toHaveBeenCalled());
        // What saves is the last image that did settle, coordinates and pin together.
        expect(mockUpdateValue).toHaveBeenCalledWith(
          expect.objectContaining({ pano_id: 'pano-2019', lat: 35.6762, lng: 139.6503 }),
          expect.anything(),
          expect.anything(),
          expect.anything(),
        );
      });

      it('reads the panorama again once its late position turns up', async () => {
        panoramaResult = years;
        renderComponent({ pano_id: 'pano-2019', lat: 35.6762, lng: 139.6503 });
        panoramaMock.getPano = jest.fn(() => 'pano-2023');
        panoramaMock.getPosition = jest.fn(() => ({ lat: () => 35.6762, lng: () => 139.6503 }));

        waitOutTheSwitch('pano-2023');

        expect(screen.getByText(/never finished loading/)).toBeInTheDocument();

        // The position finally arrives, long after anyone stopped waiting for it.
        panoramaMock.getPosition = jest.fn(() => atSpot);
        listeners.position_changed();
        await settle();

        expect(screen.getByLabelText(/Latitude/).value).toBe('41');
        expect(screen.getByLabelText(/Pano ID/).value).toBe('');
        // Screen and fields agree again, so there is nothing left to warn about.
        expect(screen.queryByText(/never finished loading/)).not.toBeInTheDocument();
      });

      it('puts the year back when the picked image never arrives', async () => {
        panoramaResult = years;
        renderComponent();
        panoramaMock.getPosition = jest.fn(() => atSpot);
        // Still showing the newest image: the pick never took.
        panoramaMock.getPano = jest.fn(() => 'pano-2023');

        waitOutTheSwitch('pano-2019');

        // The dropdown goes back to what is on screen, nothing is pinned from a pick that
        // did not happen, and saving is allowed again.
        expect(screen.getByRole('combobox').value).toBe('pano-2023');
        expect(screen.getByLabelText(/Pano ID/).value).toBe('');
        fireEvent.click(screen.getByText('OK'));

        await waitFor(() => expect(mockUpdateValue).toHaveBeenCalled());
        expect(screen.queryByText(/still loading/)).not.toBeInTheDocument();
      });

      it('refuses to save a walk before its position lands', async () => {
        panoramaResult = years;
        renderComponent();
        panoramaMock.getPosition = jest.fn(() => atSpot);
        moveView();
        await settle();

        // Clicking an arrow changes the pano first; the coordinates and the year list for
        // where we have arrived both come later.
        panoramaMock.getPano = jest.fn(() => 'walked-2024');
        listeners.pano_changed();
        fireEvent.click(screen.getByText('OK'));

        expect(mockUpdateValue).not.toHaveBeenCalled();
        expect(screen.getByText(/still loading/)).toBeInTheDocument();

        panoramaResult = {
          time: [
            { pano: 'walked-2020', date: new Date('2020-06-01') },
            { pano: 'walked-2024', date: new Date('2024-06-01') },
          ],
        };
        panoramaMock.getPosition = jest.fn(() => ({ lat: () => 42, lng: () => -76 }));
        listeners.position_changed();
        await settle();
        fireEvent.click(screen.getByText('OK'));

        await waitFor(() => expect(mockUpdateValue).toHaveBeenCalled());
        // Where we actually are, and the newest image there, so no pin.
        expect(mockUpdateValue).toHaveBeenCalledWith(
          expect.objectContaining({ pano_id: null, lat: 42, lng: -76 }),
          expect.anything(),
          expect.anything(),
          expect.anything(),
        );
      });

      it('does not wait for news it already has, whichever order it comes in', async () => {
        panoramaResult = years;
        renderComponent();
        moveView();
        await settle();

        // The position can land before the id it belongs to. Waiting for a position
        // already in hand would block saving until the wait timed out.
        panoramaMock.getPosition = jest.fn(() => atSpot);
        panoramaMock.getPano = jest.fn(() => 'walked-2024');
        listeners.position_changed();
        listeners.pano_changed();
        await settle();

        expect(screen.getByLabelText(/Latitude/).value).toBe('41');
        fireEvent.click(screen.getByText('OK'));

        await waitFor(() => expect(mockUpdateValue).toHaveBeenCalled());
        expect(screen.queryByText(/still loading/)).not.toBeInTheDocument();
      });

      it('leaves the newest year unpinned even before its list arrives', async () => {
        panoramaResult = years;
        renderComponent();

        fireEvent.change(screen.getByRole('combobox'), { target: { value: 'pano-2023' } });

        // The switch lands and asks for the year list of where it settled; the answer is
        // still out. Nothing here may put back the pin the choice just cleared.
        deferPanoResponses = true;
        panoramaMock.getPosition = jest.fn(() => atSpot);
        panoramaMock.getPano = jest.fn(() => 'pano-2023');
        listeners.pano_changed();
        listeners.position_changed();
        await settle();

        expect(screen.getByLabelText(/Pano ID/).value).toBe('');
        expect(screen.getByLabelText(/Latitude/).value).toBe('41');
      });

      it('lets a pasted link retire a year switch that never landed', async () => {
        panoramaResult = years;
        renderComponent();

        fireEvent.change(screen.getByRole('combobox'), { target: { value: 'pano-2019' } });
        // The specialist gives up on it and pastes a link instead. A link with only
        // coordinates never fires pano_changed, so nothing else would end that wait and
        // OK would go on refusing to save.
        fireEvent.change(screen.getByLabelText(/Street View URL/), {
          target: { value: 'https://www.google.com/maps/@40.694652,-73.9425529,3a,75y,348.82h,87t/' },
        });
        fireEvent.click(screen.getByText('OK'));

        await waitFor(() => expect(mockUpdateValue).toHaveBeenCalled());
        expect(screen.queryByText(/still loading/)).not.toBeInTheDocument();
      });

      it('pins nothing when the year picked is the latest', async () => {
        panoramaResult = years;
        renderComponent();

        fireEvent.change(screen.getByRole('combobox'), { target: { value: 'pano-2023' } });

        expect(screen.getByLabelText(/Pano ID/).value).toBe('');
      });
    });

    it('keeps the fields empty while the panorama loads on its own', async () => {
      renderComponent();
      panoramaMock.getPosition = jest.fn(() => atSpot);

      // Google fires these as the panorama comes up, before anyone has touched it.
      // Capturing them would turn simply opening the editor into an override.
      listeners.position_changed();
      listeners.pov_changed();
      await settle();

      expect(screen.getByLabelText(/Latitude/).value).toBe('');
      expect(screen.getByLabelText(/Longitude/).value).toBe('');
      expect(mockUpdateValue).not.toHaveBeenCalled();
    });

    it('records only the view a drag settles on', async () => {
      renderComponent();
      panoramaMock.getPosition = jest.fn(() => atSpot);

      // Every frame of a drag fires pov_changed; only the last one should reach the form.
      fireEvent.mouseDown(screen.getByTestId('streetview-panorama'));
      panoramaMock.getPov = jest.fn(() => ({ heading: 10, pitch: 0 }));
      listeners.pov_changed();
      panoramaMock.getPov = jest.fn(() => ({ heading: 90, pitch: 0 }));
      listeners.pov_changed();
      await settle();

      expect(screen.getByLabelText(/Heading/).value).toBe('90');
    });

    it('treats picking a capture year as handling the panorama', async () => {
      panoramaResult = {
        time: [
          { pano: 'pano-2019', date: new Date('2019-06-01') },
          { pano: 'pano-2023', date: new Date('2023-06-01') },
        ],
      };
      renderComponent();
      panoramaMock.getPosition = jest.fn(() => atSpot);

      fireEvent.change(screen.getByRole('combobox'), { target: { value: 'pano-2019' } });
      // Nothing is written from the click itself: the fields take the picked image once
      // it has settled and can be read as one view.
      expect(screen.getByLabelText(/Pano ID/).value).toBe('');

      panoramaMock.getPano = jest.fn(() => 'pano-2019');
      listeners.pano_changed();
      listeners.position_changed();
      await settle();

      expect(screen.getByLabelText(/Pano ID/).value).toBe('pano-2019');
      expect(screen.getByLabelText(/Latitude/).value).toBe('41');
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
      // The position lands with it; until it does, the panorama is mid-transition and
      // nothing may be read from it.
      listeners.position_changed();
    };

    const panoIdField = () => screen.getByLabelText(/Pano ID/);

    it('leaves Pano ID empty when the latest image is showing', async () => {
      panoramaResult = twoYears;
      renderComponent();
      showPano('pano-2023');

      moveView();
      await settle();

      expect(panoIdField().value).toBe('');
    });

    it('fills Pano ID after the user picks an older year', async () => {
      panoramaResult = twoYears;
      renderComponent();

      fireEvent.change(screen.getByRole('combobox'), { target: { value: 'pano-2019' } });
      showPano('pano-2019');
      listeners.position_changed();
      await settle();

      expect(panoIdField().value).toBe('pano-2019');
    });

    it('leaves Pano ID empty when the user picks the latest year', async () => {
      panoramaResult = twoYears;
      renderComponent();

      fireEvent.change(screen.getByRole('combobox'), { target: { value: 'pano-2023' } });
      moveView();
      await settle();

      expect(panoIdField().value).toBe('');
    });

    it('keeps an existing pin while its older image is still showing', async () => {
      panoramaResult = twoYears;
      renderComponent({ pano_id: 'pano-2019', lat: 40.7128, lng: -74.0060 });

      moveView();
      await settle();

      expect(panoIdField().value).toBe('pano-2019');
    });

    it('clears a stale pin once the user walks to the latest image elsewhere', async () => {
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

      moveView();
      await settle();

      expect(panoIdField().value).toBe('');
    });

    it('pins the new pano when an older image is showing after walking', async () => {
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

      moveView();
      await settle();

      expect(panoIdField().value).toBe('other-2020');
    });

    it('leaves Pano ID empty when the spot has only one capture date', async () => {
      panoramaResult = { time: [{ pano: 'only-pano', date: new Date('2023-06-01') }] };
      renderComponent();
      showPano('only-pano');

      moveView();
      await settle();

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

  describe('pasting a Street View URL', () => {
    // A real legacy URL: @-path plus an encoded thumbnail carrying panoid/yaw/pitch.
    // eslint-disable-next-line max-len
    const PANO_URL = 'https://www.google.com/maps/place/The+Fit+Faction/@40.7453108,-73.9925804,3a,75y,14.82h,88.07t/data=!3m7!1e1!3m5!1smyCPoMyIAezPN3iaT7KA_w!2e0!6shttps:%2F%2Fstreetviewpixels-pa.googleapis.com%2Fv1%2Fthumbnail%3Fcb_client%3Dmaps_sv.tactile%26w%3D900%26h%3D600%26pitch%3D1.932283034172798%26panoid%3DmyCPoMyIAezPN3iaT7KA_w%26yaw%3D14.81575811159139!7i16384!8i8192';
    // eslint-disable-next-line max-len
    const COORDS_ONLY_URL = 'https://www.google.com/maps/@40.694652,-73.9425529,3a,75y,348.82h,87t/';
    // The !5s token is how Google marks a deliberately chosen older capture date. Only
    // those keep their pano ID; current imagery is anchored by coordinates instead.
    const HISTORICAL_URL = PANO_URL.replace('!2e0!6s', '!2e0!5s20240901T000000!6s');

    const urlField = () => screen.getByLabelText(/Street View URL/);
    const pasteUrl = url => fireEvent.change(urlField(), { target: { value: url } });

    it('populates every field from a pasted URL', () => {
      renderComponent();
      pasteUrl(PANO_URL);

      expect(screen.getByLabelText(/Latitude/).value).toBe('40.7453108');
      expect(screen.getByLabelText(/Longitude/).value).toBe('-73.9925804');
      expect(screen.getByLabelText(/Heading/).value).toBe('14.81575811159139');
      expect(screen.getByLabelText(/Pitch/).value).toBe('1.932283034172798');
      expect(screen.getByLabelText(/FOV/).value).toBe('75');
      // Current imagery, so no pano is pinned — the override tracks future captures.
      expect(screen.getByLabelText(/Pano ID/).value).toBe('');
    });

    it('pins the pano only when the URL names an older capture date', () => {
      renderComponent();
      pasteUrl(HISTORICAL_URL);

      expect(screen.getByLabelText(/Pano ID/).value).toBe('myCPoMyIAezPN3iaT7KA_w');
    });

    it('derives pitch from the tilt segment when the URL has no explicit pitch', () => {
      renderComponent();
      pasteUrl(COORDS_ONLY_URL);

      // 87t is 3 degrees above level.
      expect(screen.getByLabelText(/Pitch/).value).toBe('3');
    });

    it('points the panorama at a pasted pano, without also moving its position', () => {
      renderComponent();
      pasteUrl(HISTORICAL_URL);

      expect(panoramaMock.setPano).toHaveBeenCalledWith('myCPoMyIAezPN3iaT7KA_w');
      // Setting a position afterwards would snap off the pinned image.
      expect(panoramaMock.setPosition).not.toHaveBeenCalled();
    });

    it('moves the panorama by position when the URL has no pano', () => {
      renderComponent();
      pasteUrl(COORDS_ONLY_URL);

      expect(panoramaMock.setPosition)
        .toHaveBeenCalledWith({ lat: 40.694652, lng: -73.9425529 });
      expect(panoramaMock.setPano).not.toHaveBeenCalled();
    });

    it('applies the pasted point of view', () => {
      renderComponent();
      pasteUrl(PANO_URL);

      const [pov] = panoramaMock.setPov.mock.calls[0];
      expect(pov.heading).toBe(14.81575811159139);
      expect(pov.pitch).toBe(1.932283034172798);
      // Zoom is set separately — StreetViewPov would ignore it.
      const [zoom] = panoramaMock.setZoom.mock.calls[0];
      expect(zoom).toBeCloseTo(Math.log2(180 / 75), 5);
    });

    it('captures the widest view from a fully zoomed-out panorama', async () => {
      renderComponent();
      panoramaMock.getPosition = jest.fn(() => ({ lat: () => 41, lng: () => -75 }));
      panoramaMock.getZoom = jest.fn(() => 0);
      moveView();
      await settle();

      expect(screen.getByLabelText(/FOV/).value).toBe('120');
    });

    it('captures the real field of view rather than a fixed 90', async () => {
      renderComponent();
      panoramaMock.getPosition = jest.fn(() => ({ lat: () => 41, lng: () => -75 }));
      panoramaMock.getZoom = jest.fn(() => 2);
      moveView();
      await settle();

      // getPov() has no zoom, so reading it from there always produced 90.
      expect(screen.getByLabelText(/FOV/).value).toBe('45');
    });

    it('re-applies when the same URL is pasted again', () => {
      renderComponent();
      pasteUrl(HISTORICAL_URL);
      // Somebody walks away from the pasted view, then pastes the same link to get back.
      pasteUrl('');
      pasteUrl(HISTORICAL_URL);

      expect(panoramaMock.setPano).toHaveBeenCalledTimes(2);
    });

    it('applies a URL pasted before the Maps script finished loading', () => {
      // The picker's first render is the one carrying the target, so componentDidUpdate
      // never sees a change and the paste would otherwise be silently dropped.
      mockScriptLoaded = false;
      renderComponent();
      pasteUrl(HISTORICAL_URL);
      expect(panoramaMock.setPano).not.toHaveBeenCalled();

      mockScriptLoaded = true;
      // Any re-render now mounts the picker for the first time.
      fireEvent.click(screen.getByText('Hide advanced fields'));

      expect(panoramaMock.setPano).toHaveBeenCalledWith('myCPoMyIAezPN3iaT7KA_w');
    });

    it('still captures the refined view after a paste', async () => {
      renderComponent();
      pasteUrl(COORDS_ONLY_URL);

      // The specialist walks down the street from where the URL landed.
      panoramaMock.getPosition = jest.fn(() => ({ lat: () => 41, lng: () => -75 }));
      panoramaMock.getPov = jest.fn(() => ({ heading: 200, pitch: 5, zoom: 1 }));
      moveView();
      await settle();

      expect(screen.getByLabelText(/Latitude/).value).toBe('41');
      expect(screen.getByLabelText(/Longitude/).value).toBe('-75');
      expect(screen.getByLabelText(/Heading/).value).toBe('200');
    });

    // The parser promises that anything it accepts also satisfies the form's own
    // validate(), so a paste can never be followed by an unexplained refusal to save.
    describe('anything the parser accepts also saves', () => {
      const share = params => `https://www.google.com/maps/@?api=1&map_action=pano&${params}`;

      it.each([
        ['a current-imagery URL', PANO_URL],
        ['a historical URL', HISTORICAL_URL],
        ['a coordinates-only URL', COORDS_ONLY_URL],
        ['a share link', share('viewpoint=40.74,-73.99&heading=180&pitch=0&fov=90')],
        ['an out-of-range latitude beside a pano',
          share('pano=abc1234567&viewpoint=999,-73.99')],
        ['an out-of-range longitude beside a pano',
          share('pano=abc1234567&viewpoint=40.74,-999')],
        ['an out-of-range fov', share('viewpoint=40.7,-73.9&fov=400')],
        ['a wrapped negative heading', share('viewpoint=40.7,-73.9&heading=-30')],
      ])('saves after pasting %s', (_label, url) => {
        renderComponent();
        pasteUrl(url);
        fireEvent.click(screen.getByText('OK'));

        expect(mockUpdateValue).toHaveBeenCalled();
        expect(screen.queryByText(/Required when/)).not.toBeInTheDocument();
        expect(screen.queryByText(/Must be between/)).not.toBeInTheDocument();
        expect(screen.queryByText(/A Pano ID or both latitude/)).not.toBeInTheDocument();
      });
    });

    it('clears the URL box on reset', () => {
      renderComponent();
      pasteUrl(PANO_URL);
      fireEvent.click(screen.getByText('Reset to default'));

      expect(urlField().value).toBe('');
      expect(screen.getByLabelText(/Latitude/).value).toBe('');
    });
  });

  describe('a URL that cannot be read', () => {
    const urlField = () => screen.getByLabelText(/Street View URL/);

    it('reports it on blur, without touching what is already entered', async () => {
      renderComponent();
      await userEvent.type(screen.getByLabelText(/Latitude/), '40.7128');

      fireEvent.change(urlField(), { target: { value: 'https://example.com/nope' } });
      fireEvent.blur(urlField());

      await waitFor(() => expect(screen.getByText(/Couldn’t find a Street View/))
        .toBeInTheDocument());
      expect(screen.getByLabelText(/Latitude/).value).toBe('40.7128');
    });

    it('rejects an ordinary map link and keeps the existing view intact', async () => {
      renderComponent({
        pano_id: 'kept-pano', lat: 40.7453108, lng: -73.9925804, heading: 15, pitch: 2, fov: 75,
      });

      // A map link, not a Street View one: these coordinates are just the map centre.
      fireEvent.change(urlField(), {
        target: { value: 'https://www.google.com/maps/@40.1,-73.1,15z' },
      });
      fireEvent.blur(urlField());

      await waitFor(() => expect(screen.getByText(/Couldn’t find a Street View/))
        .toBeInTheDocument());
      expect(screen.getByLabelText(/Latitude/).value).toBe('40.7453108');
      expect(screen.getByLabelText(/Longitude/).value).toBe('-73.9925804');
      expect(screen.getByLabelText(/Pano ID/).value).toBe('kept-pano');
      expect(screen.getByLabelText(/FOV/).value).toBe('75');
      expect(panoramaMock.setPosition).not.toHaveBeenCalled();
    });

    it('rejects a truncated share link instead of fabricating a coordinate', async () => {
      renderComponent({
        pano_id: 'kept-pano', lat: 40.7453108, lng: -73.9925804, heading: 15, pitch: 2, fov: 75,
      });

      // Number('') is 0, so this used to be accepted as longitude 0.
      fireEvent.change(urlField(), {
        target: { value: 'https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=40.7,' },
      });
      fireEvent.blur(urlField());

      await waitFor(() => expect(screen.getByText(/Couldn’t find a Street View/))
        .toBeInTheDocument());
      expect(screen.getByLabelText(/Latitude/).value).toBe('40.7453108');
      expect(screen.getByLabelText(/Longitude/).value).toBe('-73.9925804');
      expect(screen.getByLabelText(/Pano ID/).value).toBe('kept-pano');
      expect(panoramaMock.setPosition).not.toHaveBeenCalled();
    });

    it('says nothing while a URL is still being typed', () => {
      renderComponent();
      fireEvent.change(urlField(), { target: { value: 'https://www.google.com/ma' } });

      expect(screen.queryByText(/Couldn’t find a Street View/)).not.toBeInTheDocument();
    });

    it('gives short share links their own explanation', async () => {
      renderComponent();
      fireEvent.change(urlField(), { target: { value: 'https://maps.app.goo.gl/abc123' } });
      fireEvent.blur(urlField());

      await waitFor(() => expect(screen.getByText(/Short share links/)).toBeInTheDocument());
    });

    it('clears the error once a readable URL is pasted', async () => {
      renderComponent();
      fireEvent.change(urlField(), { target: { value: 'nonsense' } });
      fireEvent.blur(urlField());
      await waitFor(() => expect(screen.getByText(/Couldn’t find a Street View/))
        .toBeInTheDocument());

      fireEvent.change(urlField(), {
        target: { value: 'https://www.google.com/maps/@40.694652,-73.9425529,3a,75y,348.82h,87t/' },
      });

      expect(screen.queryByText(/Couldn’t find a Street View/)).not.toBeInTheDocument();
    });
  });

  describe('advanced fields', () => {
    it('are collapsed by default', () => {
      renderCollapsed();

      expect(screen.queryByLabelText(/Heading/)).not.toBeInTheDocument();
      expect(screen.queryByLabelText(/Pano ID/)).not.toBeInTheDocument();
      // The fields a specialist actually needs stay put.
      expect(screen.getByLabelText(/Latitude/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Street View URL/)).toBeInTheDocument();
    });

    it('appear when the toggle is clicked', () => {
      renderCollapsed();
      fireEvent.click(screen.getByText('Show advanced fields'));

      expect(screen.getByLabelText(/Heading/)).toBeInTheDocument();
      expect(screen.getByText('Hide advanced fields')).toBeInTheDocument();
    });

    it('start expanded when a pinned historical image is already saved', () => {
      renderCollapsed({
        pano_id: 'pinned-pano', lat: 40.7, lng: -73.9, heading: 10, pitch: 0, fov: 90,
      });

      expect(screen.getByLabelText(/Pano ID/).value).toBe('pinned-pano');
    });

    it('stay collapsed for a record with no pinned image', () => {
      renderCollapsed({
        pano_id: null, lat: 40.7, lng: -73.9, heading: 10, pitch: 0, fov: 90,
      });

      expect(screen.queryByLabelText(/Pano ID/)).not.toBeInTheDocument();
    });

    it('expand on submit so a hidden field’s error is not invisible', async () => {
      renderComponent();
      await userEvent.type(screen.getByLabelText(/FOV/), '500');
      fireEvent.click(screen.getByText('Hide advanced fields'));
      expect(screen.queryByLabelText(/FOV/)).not.toBeInTheDocument();

      fireEvent.click(screen.getByText('OK'));

      await waitFor(() => expect(screen.getByLabelText(/FOV/)).toBeInTheDocument());
      expect(screen.getByText('Must be a whole number between 10 and 120')).toBeInTheDocument();
      expect(mockUpdateValue).not.toHaveBeenCalled();
    });
  });
});
