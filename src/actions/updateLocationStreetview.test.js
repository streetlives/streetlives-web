import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import * as api from '../services/api';
import { updateLocationStreetview, OPTIMISTIC_UPDATE_LOCATION } from './index';

jest.mock('../services/api');

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

describe('updateLocationStreetview action', () => {
  beforeEach(() => {
    api.updateLocation.mockResolvedValue({});
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('dispatches OPTIMISTIC_UPDATE_LOCATION with new data', () => {
    const store = mockStore({
      locations: {
        'loc-123': {
          id: 'loc-123',
          Streetview: null,
        },
      },
    });

    const streetviewData = { lat: 40.7128, lng: -74.0060, pano_id: null };
    store.dispatch(updateLocationStreetview('loc-123', streetviewData, 'section', 'field'));

    const actions = store.getActions();
    expect(actions[0].type).toBe(OPTIMISTIC_UPDATE_LOCATION);
    expect(actions[0].payload.params.Streetview).toEqual(streetviewData);
  });

  it('dispatches OPTIMISTIC_UPDATE_LOCATION even when clearing non-existent override', () => {
    const store = mockStore({
      locations: {
        'loc-123': {
          id: 'loc-123',
          Streetview: null,
        },
      },
    });

    const allNullData = {
      lat: null,
      lng: null,
      pano_id: null,
      heading: null,
      pitch: null,
      fov: null,
    };
    store.dispatch(updateLocationStreetview('loc-123', allNullData, 'section', 'field'));

    const actions = store.getActions();
    // Should have optimistic update dispatch
    expect(actions.length).toBeGreaterThan(0);
    expect(actions[0].type).toBe(OPTIMISTIC_UPDATE_LOCATION);
  });

  it('skips API call when clearing non-existent override', () => {
    const store = mockStore({
      locations: {
        'loc-123': {
          id: 'loc-123',
          Streetview: null,
        },
      },
    });

    const allNullData = {
      lat: null,
      lng: null,
      pano_id: null,
      heading: null,
      pitch: null,
      fov: null,
    };
    store.dispatch(updateLocationStreetview('loc-123', allNullData, 'section', 'field'));

    expect(api.updateLocation).not.toHaveBeenCalled();
  });

  it('makes API call when clearing an existing override', () => {
    api.updateLocation.mockResolvedValue({});

    const store = mockStore({
      locations: {
        'loc-123': {
          id: 'loc-123',
          Streetview: { pano_id: 'existing-pano', lat: 40.0, lng: -74.0 },
        },
      },
    });

    const allNullData = {
      lat: null,
      lng: null,
      pano_id: null,
      heading: null,
      pitch: null,
      fov: null,
    };
    store.dispatch(updateLocationStreetview('loc-123', allNullData, 'section', 'field'));

    expect(api.updateLocation).toHaveBeenCalledWith({
      id: 'loc-123',
      params: { streetview: null },
    });
  });

  it('makes API call with new data', () => {
    api.updateLocation.mockResolvedValue({});

    const store = mockStore({
      locations: {
        'loc-123': {
          id: 'loc-123',
          Streetview: null,
        },
      },
    });

    const streetviewData = { lat: 40.7128, lng: -74.0060, pano_id: null };
    store.dispatch(updateLocationStreetview('loc-123', streetviewData, 'section', 'field'));

    expect(api.updateLocation).toHaveBeenCalledWith({
      id: 'loc-123',
      params: { streetview: streetviewData },
    });
  });

  it('uses lowercase key in API call', () => {
    api.updateLocation.mockResolvedValue({});

    const store = mockStore({
      locations: {
        'loc-123': {
          id: 'loc-123',
          Streetview: null,
        },
      },
    });

    const streetviewData = { lat: 40.7128, lng: -74.0060 };
    store.dispatch(updateLocationStreetview('loc-123', streetviewData, 'section', 'field'));

    const callArgs = api.updateLocation.mock.calls[0][0];
    expect(callArgs.params).toHaveProperty('streetview');
    expect(callArgs.params).not.toHaveProperty('Streetview');
  });

  it('uses uppercase key in optimistic update', () => {
    const store = mockStore({
      locations: {
        'loc-123': {
          id: 'loc-123',
          Streetview: null,
        },
      },
    });

    const streetviewData = { lat: 40.7128, lng: -74.0060 };
    store.dispatch(updateLocationStreetview('loc-123', streetviewData, 'section', 'field'));

    const actions = store.getActions();
    const optimisticAction = actions.find(a => a.type === OPTIMISTIC_UPDATE_LOCATION);
    expect(optimisticAction.payload.params).toHaveProperty('Streetview');
    expect(optimisticAction.payload.params).not.toHaveProperty('streetview');
  });
});
