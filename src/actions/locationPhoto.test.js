import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import * as api from '../services/api';
import { uploadLocationPhoto, removeLocationPhoto, SET_LOCATION_PHOTO } from './index';
import reducer from '../reducers/locations';

jest.mock('../services/api');

const mockStore = configureMockStore([thunk]);

const PREPARED = {
  data: 'YmFzZTY0',
  contentType: 'image/jpeg',
  filename: 'storefront.jpg',
  byteSize: 1234,
};

const PHOTO = { url: 'https://cdn.example/a/b.jpg', content_type: 'image/jpeg' };

describe('location photo actions', () => {
  afterEach(() => jest.clearAllMocks());

  describe('uploadLocationPhoto', () => {
    it('sends only the fields the API accepts', async () => {
      api.putLocationPhoto.mockResolvedValue(PHOTO);
      const store = mockStore({ locations: {} });

      await store.dispatch(uploadLocationPhoto('loc-1', PREPARED));

      expect(api.putLocationPhoto).toHaveBeenCalledWith({
        id: 'loc-1',
        params: {
          contentType: 'image/jpeg',
          data: 'YmFzZTY0',
          filename: 'storefront.jpg',
        },
      });
    });

    it('stores what the server returned', async () => {
      api.putLocationPhoto.mockResolvedValue(PHOTO);
      const store = mockStore({ locations: {} });

      await store.dispatch(uploadLocationPhoto('loc-1', PREPARED));

      expect(store.getActions()).toEqual([
        { type: SET_LOCATION_PHOTO, payload: { id: 'loc-1', photo: PHOTO } },
      ]);
    });

    // Every other action here swallows failures into the global ErrorBar. This
    // one has to reject so the field can tell the specialist to pick again.
    it('rejects and stores nothing when the upload fails', async () => {
      api.putLocationPhoto.mockRejectedValue(new Error('boom'));
      const store = mockStore({ locations: {} });

      await expect(store.dispatch(uploadLocationPhoto('loc-1', PREPARED))).rejects.toThrow();
      expect(store.getActions()).toEqual([]);
    });
  });

  describe('removeLocationPhoto', () => {
    it('clears the photo', async () => {
      api.deleteLocationPhoto.mockResolvedValue({});
      const store = mockStore({ locations: {} });

      await store.dispatch(removeLocationPhoto('loc-1'));

      expect(store.getActions()).toEqual([
        { type: SET_LOCATION_PHOTO, payload: { id: 'loc-1', photo: null } },
      ]);
    });

    it('rejects and clears nothing when the delete fails', async () => {
      api.deleteLocationPhoto.mockRejectedValue(new Error('boom'));
      const store = mockStore({ locations: {} });

      await expect(store.dispatch(removeLocationPhoto('loc-1'))).rejects.toThrow();
      expect(store.getActions()).toEqual([]);
    });
  });

  describe('reducer', () => {
    const state = {
      'loc-1': {
        id: 'loc-1',
        name: 'A place',
        Streetview: { pano_id: 'abc' },
        EventRelatedInfos: [{ event: 'CLOSURE' }],
      },
    };

    it('merges the photo without disturbing the rest of the location', () => {
      const next = reducer(state, {
        type: SET_LOCATION_PHOTO,
        payload: { id: 'loc-1', photo: PHOTO },
      });

      expect(next['loc-1'].LocationPhoto).toEqual(PHOTO);
      expect(next['loc-1'].Streetview).toEqual({ pano_id: 'abc' });
      // OPTIMISTIC_UPDATE_LOCATION rewrites EventRelatedInfos on every dispatch,
      // which is why the photo does not travel through it.
      expect(next['loc-1'].EventRelatedInfos).toEqual([{ event: 'CLOSURE' }]);
    });

    it('clears the photo', () => {
      const withPhoto = reducer(state, {
        type: SET_LOCATION_PHOTO,
        payload: { id: 'loc-1', photo: PHOTO },
      });
      const next = reducer(withPhoto, {
        type: SET_LOCATION_PHOTO,
        payload: { id: 'loc-1', photo: null },
      });

      expect(next['loc-1'].LocationPhoto).toBeNull();
    });

    it('ignores a location it does not have', () => {
      const next = reducer(state, {
        type: SET_LOCATION_PHOTO,
        payload: { id: 'unknown', photo: PHOTO },
      });

      expect(next).toBe(state);
    });
  });
});
