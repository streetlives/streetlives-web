import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import * as api from '../services/api';
import {
  uploadLocationPhoto, removeLocationPhoto, loadLocationPhotoSource, SET_LOCATION_PHOTO,
} from './index';
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

    it('sends the original and its framing when there is one', async () => {
      api.putLocationPhoto.mockResolvedValue(PHOTO);
      const store = mockStore({ locations: {} });
      const source = { contentType: 'image/webp', data: 'b3JpZ2luYWw=' };
      const crop = { x: 0.1, y: -0.2, zoom: 1.5 };

      await store.dispatch(uploadLocationPhoto('loc-1', {
        ...PREPARED, dataUrl: 'data:…', source, crop,
      }));

      expect(api.putLocationPhoto).toHaveBeenCalledWith({
        id: 'loc-1',
        params: {
          contentType: 'image/jpeg',
          data: 'YmFzZTY0',
          filename: 'storefront.jpg',
          source,
          crop,
        },
      });
    });

    // An original too big to fit beside the crop comes back from renderCrop as
    // null, and must not reach the API as `source: null`.
    it('sends no original when it was dropped', async () => {
      api.putLocationPhoto.mockResolvedValue(PHOTO);
      const store = mockStore({ locations: {} });

      await store.dispatch(uploadLocationPhoto('loc-1', { ...PREPARED, source: null }));

      expect(api.putLocationPhoto.mock.calls[0][0].params).not.toHaveProperty('source');
      expect(api.putLocationPhoto.mock.calls[0][0].params).not.toHaveProperty('crop');
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

  describe('loadLocationPhotoSource', () => {
    it('resolves to what the API answers and stores nothing', async () => {
      const answer = { source_url: 'https://cdn.example/a/original.webp', crop: null };
      api.getLocationPhotoSource.mockResolvedValue(answer);
      const store = mockStore({ locations: {} });

      await expect(store.dispatch(loadLocationPhotoSource('loc-1'))).resolves.toEqual(answer);
      expect(api.getLocationPhotoSource).toHaveBeenCalledWith({ id: 'loc-1' });
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
