/* eslint-disable max-len */
import {
  parseStreetviewUrl, zoomFromFov, fovFromZoom, isShortStreetviewLink,
} from './utils';

// A real legacy URL: @-path plus an encoded thumbnail carrying panoid/yaw/pitch.
const PLACE_URL = 'https://www.google.com/maps/place/The+Fit+Faction/@40.7453108,-73.9925804,3a,75y,14.82h,88.07t/data=!3m7!1e1!3m5!1smyCPoMyIAezPN3iaT7KA_w!2e0!6shttps:%2F%2Fstreetviewpixels-pa.googleapis.com%2Fv1%2Fthumbnail%3Fcb_client%3Dmaps_sv.tactile%26w%3D900%26h%3D600%26pitch%3D1.932283034172798%26panoid%3DmyCPoMyIAezPN3iaT7KA_w%26yaw%3D14.81575811159139!7i16384!8i8192';

// The newer short shape: no encoded thumbnail, so no pitch= and no yaw= to read.
const SHORT_URL = 'https://www.google.com/maps/@40.694652,-73.9425529,3a,75y,348.82h,87t/data=!3m6!1e1!3m4!1svPnCYh8aDPKJ08AC1GqOjg!2e0!7i16384!8i8192';

const SHARE_URL = 'https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=40.694652,-73.9425529&pano=vPnCYh8aDPKJ08AC1GqOjg&heading=348.82&pitch=-5&fov=75';

describe('parseStreetviewUrl', () => {
  describe('place/coordinate links', () => {
    it('extracts every field from a legacy URL with an encoded thumbnail', () => {
      expect(parseStreetviewUrl(PLACE_URL)).toEqual({
        // Current imagery, so the pano is deliberately not pinned — see the describe below.
        pano_id: null,
        lat: 40.7453108,
        lng: -73.9925804,
        heading: 14.81575811159139,
        pitch: 1.932283034172798,
        fov: 75,
      });
    });

    it('prefers the precise yaw over the rounded h path segment', () => {
      // h says 14.82, yaw says 14.8157…
      expect(parseStreetviewUrl(PLACE_URL).heading).toBe(14.81575811159139);
    });

    it('reads the pano ID from the !1s…!2e0 data blob when there is no thumbnail', () => {
      const historical = SHORT_URL.replace('!2e0!7i', '!2e0!5s20220801T000000!7i');
      expect(parseStreetviewUrl(historical).pano_id).toBe('vPnCYh8aDPKJ08AC1GqOjg');
    });
  });

  describe('pinning only deliberately historical imagery', () => {
    it('drops the pano ID when the URL points at current imagery', () => {
      // Saving this pano would freeze the override on today's picture. The coordinates
      // and POV resolve to the same image now and track future imagery afterwards.
      expect(parseStreetviewUrl(PLACE_URL).lat).toBe(40.7453108);
      expect(parseStreetviewUrl(PLACE_URL).pano_id).toBeNull();
    });

    it('keeps the pano ID when the URL names an older capture date', () => {
      const historical = PLACE_URL.replace('!2e0!6s', '!2e0!5s20240901T000000!6s');
      expect(parseStreetviewUrl(historical).pano_id).toBe('myCPoMyIAezPN3iaT7KA_w');
    });

    it('keeps the pano ID when there are no coordinates to fall back on', () => {
      // Nothing else could anchor this view, so dropping the pano would reject the URL.
      const url = 'https://www.google.com/maps/data=!3m4!1sAbCdEfGhIjKlMnOpQrStUv!2e0';
      expect(parseStreetviewUrl(url)).toEqual({
        pano_id: 'AbCdEfGhIjKlMnOpQrStUv',
        lat: null,
        lng: null,
        heading: null,
        pitch: null,
        fov: null,
      });
    });

    it('leaves share-link panos alone, since those come from our own records', () => {
      expect(parseStreetviewUrl(SHARE_URL).pano_id).toBe('vPnCYh8aDPKJ08AC1GqOjg');
    });
  });

  describe('pitch derived from the tilt segment', () => {
    it('converts tilt to pitch as 90 - t when no explicit pitch is present', () => {
      // 87t is very slightly above level.
      expect(parseStreetviewUrl(SHORT_URL).pitch).toBe(3);
    });

    it('treats a level 90t as pitch 0', () => {
      const url = SHORT_URL.replace(',87t/', ',90t/');
      expect(parseStreetviewUrl(url).pitch).toBe(0);
    });

    it('lets an explicit pitch win over the tilt segment', () => {
      // 88.07t would give 1.93; the thumbnail states the same, but make them disagree.
      const url = PLACE_URL.replace('pitch%3D1.932283034172798', 'pitch%3D-12');
      expect(parseStreetviewUrl(url).pitch).toBe(-12);
    });

    it('drops a tilt that converts to an out-of-range pitch', () => {
      // 200t -> -110, outside Street View's -90..90.
      const url = SHORT_URL.replace(',87t/', ',200t/');
      expect(parseStreetviewUrl(url).pitch).toBeNull();
    });
  });

  describe('share links', () => {
    it('parses the shape YourPeer itself generates, pitch included', () => {
      expect(parseStreetviewUrl(SHARE_URL)).toEqual({
        pano_id: 'vPnCYh8aDPKJ08AC1GqOjg',
        lat: 40.694652,
        lng: -73.9425529,
        heading: 348.82,
        pitch: -5,
        fov: 75,
      });
    });

    it('rounds a fractional fov to the whole number the API expects', () => {
      expect(parseStreetviewUrl(SHARE_URL.replace('fov=75', 'fov=79.6')).fov).toBe(80);
    });

    it('parses a share link with no pano at all, rather than falling through', () => {
      // buildStreetViewUrls omits `pano` whenever no historical image is pinned. Keying
      // the branch on `pano` alone sent these to the @-path parser, where the only thing
      // that matched was the query string's own pitch= — yielding a pitch and nothing
      // else, which is how a row ends up with a pitch and no location.
      const url = 'https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=40.7453108,-73.9925804&heading=180&pitch=0&fov=90';
      expect(parseStreetviewUrl(url)).toEqual({
        pano_id: null,
        lat: 40.7453108,
        lng: -73.9925804,
        heading: 180,
        pitch: 0,
        fov: 90,
      });
    });

    it('parses a share link that carries a pano but no viewpoint', () => {
      const url = 'https://www.google.com/maps/@?api=1&map_action=pano&pano=abc123';
      expect(parseStreetviewUrl(url)).toEqual({
        pano_id: 'abc123', lat: null, lng: null, heading: null, pitch: null, fov: null,
      });
    });
  });

  describe('normalization', () => {
    it('wraps a negative yaw into 0-360 instead of discarding it', () => {
      const url = PLACE_URL.replace('yaw%3D14.81575811159139', 'yaw%3D-30');
      expect(parseStreetviewUrl(url).heading).toBe(330);
    });

    it('wraps a heading above 360', () => {
      expect(parseStreetviewUrl(SHARE_URL.replace('heading=348.82', 'heading=390')).heading)
        .toBe(30);
    });

    it('clamps rather than discards an fov outside the 10-120 the API accepts', () => {
      // Discarding would fall back to the frontend default of 90 — a far bigger change to
      // the picture than clamping to the nearest value we can store.
      expect(parseStreetviewUrl(SHARE_URL.replace('fov=75', 'fov=180')).fov).toBe(120);
      const zoomedIn = 'https://www.google.com/maps/@40.694652,-73.9425529,3a,9y,348.82h,87t/';
      expect(parseStreetviewUrl(zoomedIn).fov).toBe(10);
    });

    it('drops a pano ID longer than the 128-character column', () => {
      const longId = 'a'.repeat(129);
      const url = `https://www.google.com/maps/@?api=1&map_action=pano&pano=${longId}&viewpoint=40.7,-73.9`;
      expect(parseStreetviewUrl(url).pano_id).toBeNull();
    });

    it('keeps a pano ID of exactly 128 characters', () => {
      const id = 'a'.repeat(128);
      const url = `https://www.google.com/maps/@?api=1&map_action=pano&pano=${id}`;
      expect(parseStreetviewUrl(url).pano_id).toBe(id);
    });
  });

  describe('unusable input returns null', () => {
    it.each([
      ['an empty string', ''],
      ['whitespace', '   '],
      ['a non-URL string', 'not a url at all'],
      ['null', null],
      ['undefined', undefined],
      ['a number', 42],
    ])('returns null for %s', (_label, input) => {
      expect(parseStreetviewUrl(input)).toBeNull();
    });

    it('returns null for a maps URL with no Street View data', () => {
      expect(parseStreetviewUrl('https://www.google.com/maps/search/pizza')).toBeNull();
    });

    it.each([
      ['a plain map link with a zoom token', 'https://www.google.com/maps/@40.7,-73.9,15z'],
      ['a place link with no Street View', 'https://www.google.com/maps/place/Foo/@40.7,-73.9,17z/data=!3m1!4b1'],
    ])('returns null for %s', (_label, url) => {
      // The coordinates in these are the map centre, not a chosen view. Accepting them
      // would silently replace a good override with wherever the map was panned to.
      expect(parseStreetviewUrl(url)).toBeNull();
    });

    it('still accepts a Street View path link that has only coordinates', () => {
      // The 3a marker is what separates this from the map links above.
      const url = 'https://www.google.com/maps/@40.694652,-73.9425529,3a,75y,348.82h,87t/';
      expect(parseStreetviewUrl(url).lat).toBe(40.694652);
    });

    it('returns null when coordinates are out of range and there is no pano ID', () => {
      const url = 'https://www.google.com/maps/@999.5,-73.9925804,3a,75y,14.82h,88.07t/data=x';
      expect(parseStreetviewUrl(url)).toBeNull();
    });

    it('returns null for a URL with only a heading and no anchor', () => {
      expect(parseStreetviewUrl('https://www.google.com/maps/@?api=1&heading=90')).toBeNull();
    });
  });

  it('tolerates a URL ending immediately after the tilt segment', () => {
    const url = 'https://www.google.com/maps/@40.694652,-73.9425529,3a,75y,348.82h,87t/';
    expect(parseStreetviewUrl(url)).toEqual({
      pano_id: null,
      lat: 40.694652,
      lng: -73.9425529,
      heading: 348.82,
      pitch: 3,
      fov: 75,
    });
  });
});

describe('zoomFromFov', () => {
  it('round-trips through fovFromZoom across the accepted range', () => {
    [10, 20, 45, 75, 90, 120].forEach((fov) => {
      expect(fovFromZoom(zoomFromFov(fov))).toBe(fov);
    });
  });
});

describe('isShortStreetviewLink', () => {
  it.each([
    'https://maps.app.goo.gl/abc123',
    'https://goo.gl/maps/abc123',
  ])('recognizes %s', (url) => {
    expect(isShortStreetviewLink(url)).toBe(true);
  });

  it('does not flag a full maps URL', () => {
    expect(isShortStreetviewLink(PLACE_URL)).toBe(false);
  });

  it.each([['a non-URL', 'nonsense'], ['null', null]])('returns false for %s', (_l, input) => {
    expect(isShortStreetviewLink(input)).toBe(false);
  });
});
