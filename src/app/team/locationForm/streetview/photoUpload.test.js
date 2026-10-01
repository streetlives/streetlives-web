import {
  readAndDownscale,
  scaledSize,
  MAX_DIMENSION,
  MAX_UPLOAD_BYTES,
  JPEG_QUALITY,
  TYPE_ERROR,
  READ_ERROR,
  TOO_LARGE_ERROR,
} from './photoUpload';

// jsdom has no canvas implementation, so readAndDownscale takes its three
// browser APIs as an injectable dependency. These tests supply fakes and assert
// on what the production code does with them: the dimensions it resizes to, the
// encoding it asks for, how it strips the data-URL prefix, and the size cap it
// enforces. The one thing left to the browser is the JPEG encoder itself.

const jpegFile = (name = 'storefront.jpg') => ({ name, type: 'image/jpeg' });

// Genuine base64 of n bytes, not a string built to match the implementation's
// own arithmetic - otherwise a wrong formula on both sides would agree and the
// byte-size tests would prove nothing.
const base64OfBytes = n => Buffer.alloc(n, 0x41).toString('base64');

const fakeDeps = ({
  naturalWidth = 4000,
  naturalHeight = 3000,
  encodedBytes = 200 * 1024,
  readFails = false,
  loadFails = false,
} = {}) => {
  const calls = { drawImage: null, toDataURL: null, canvasSize: null };
  const dataUrl = `data:image/jpeg;base64,${base64OfBytes(encodedBytes)}`;

  const canvas = {
    width: 0,
    height: 0,
    getContext: () => ({
      drawImage: (...args) => { calls.drawImage = args; },
    }),
    toDataURL: (...args) => {
      calls.toDataURL = args;
      calls.canvasSize = { width: canvas.width, height: canvas.height };
      return dataUrl;
    },
  };

  return {
    calls,
    deps: {
      readAsDataUrl: () => (readFails
        ? Promise.reject(new Error(READ_ERROR))
        : Promise.resolve('data:image/jpeg;base64,original')),
      loadImage: () => (loadFails
        ? Promise.reject(new Error(READ_ERROR))
        : Promise.resolve({ naturalWidth, naturalHeight })),
      createCanvas: () => canvas,
    },
  };
};

describe('scaledSize', () => {
  it('leaves an image smaller than the limit alone', () => {
    expect(scaledSize(800, 600)).toEqual({ width: 800, height: 600 });
  });

  it('does not upscale an image exactly at the limit', () => {
    expect(scaledSize(MAX_DIMENSION, 900)).toEqual({ width: MAX_DIMENSION, height: 900 });
  });

  it('scales a landscape photo by its longest edge', () => {
    expect(scaledSize(4000, 3000)).toEqual({ width: 1600, height: 1200 });
  });

  it('scales a portrait photo by its longest edge', () => {
    expect(scaledSize(3000, 4000)).toEqual({ width: 1200, height: 1600 });
  });

  it('preserves the aspect ratio of an extreme panorama', () => {
    expect(scaledSize(8000, 1000)).toEqual({ width: 1600, height: 200 });
  });

  it('never rounds a dimension down to zero', () => {
    expect(scaledSize(16000, 1).height).toBeGreaterThanOrEqual(1);
  });
});

describe('readAndDownscale', () => {
  describe('resizing', () => {
    it('draws the image at the scaled size', async () => {
      const { deps, calls } = fakeDeps({ naturalWidth: 4000, naturalHeight: 3000 });

      await readAndDownscale(jpegFile(), deps);

      // drawImage(image, dx, dy, dWidth, dHeight)
      expect(calls.drawImage.slice(1)).toEqual([0, 0, 1600, 1200]);
    });

    it('sizes the canvas to match, so the output is not padded or cropped', async () => {
      const { deps, calls } = fakeDeps({ naturalWidth: 3000, naturalHeight: 4000 });

      await readAndDownscale(jpegFile(), deps);

      expect(calls.canvasSize).toEqual({ width: 1200, height: 1600 });
    });

    it('leaves a small photo at its original size', async () => {
      const { deps, calls } = fakeDeps({ naturalWidth: 800, naturalHeight: 600 });

      await readAndDownscale(jpegFile(), deps);

      expect(calls.drawImage.slice(1)).toEqual([0, 0, 800, 600]);
      expect(calls.canvasSize).toEqual({ width: 800, height: 600 });
    });
  });

  describe('encoding', () => {
    it('re-encodes as JPEG at the configured quality', async () => {
      const { deps, calls } = fakeDeps();

      const result = await readAndDownscale(jpegFile(), deps);

      expect(calls.toDataURL).toEqual(['image/jpeg', JPEG_QUALITY]);
      expect(result.contentType).toBe('image/jpeg');
    });

    // The API's PUT body wants bare base64; the preview wants a data URL. Both
    // come from one encode rather than encoding twice.
    it('returns bare base64 for the API and a data URL for the preview', async () => {
      const { deps } = fakeDeps();

      const result = await readAndDownscale(jpegFile(), deps);

      expect(result.data.startsWith('data:')).toBe(false);
      expect(result.dataUrl).toBe(`data:image/jpeg;base64,${result.data}`);
    });

    it('carries the original filename through', async () => {
      const { deps } = fakeDeps();

      const result = await readAndDownscale(jpegFile('front-door.jpg'), deps);

      expect(result.filename).toBe('front-door.jpg');
    });
  });

  describe('the size cap', () => {
    // Every padding case: n % 3 of 0, 1 and 2 produce '', '=' and '=='.
    it.each([1, 2, 3, 150 * 1024, 561641])(
      'reports %i bytes back from its base64',
      async (bytes) => {
        const { deps } = fakeDeps({ encodedBytes: bytes });

        const result = await readAndDownscale(jpegFile(), deps);

        expect(result.byteSize).toBe(bytes);
      },
    );

    it('accepts an image exactly at the limit', async () => {
      const { deps } = fakeDeps({ encodedBytes: MAX_UPLOAD_BYTES });

      await expect(readAndDownscale(jpegFile(), deps)).resolves.toBeTruthy();
    });

    // The API rejects anything over this, and Lambda's 6MB invoke payload sits
    // behind that, so catching it here is what turns a 400 into a clear message.
    it('rejects an image still over the limit after resizing', async () => {
      const { deps } = fakeDeps({ encodedBytes: MAX_UPLOAD_BYTES + 1024 });

      await expect(readAndDownscale(jpegFile(), deps)).rejects.toThrow(TOO_LARGE_ERROR);
    });
  });

  describe('rejected input', () => {
    it.each([
      ['no file', null],
      ['an SVG', { name: 'a.svg', type: 'image/svg+xml' }],
      ['a PDF', { name: 'a.pdf', type: 'application/pdf' }],
      ['a file with no type', { name: 'a', type: '' }],
    ])('rejects %s before touching the canvas', async (_label, file) => {
      const { deps, calls } = fakeDeps();

      await expect(readAndDownscale(file, deps)).rejects.toThrow(TYPE_ERROR);
      expect(calls.drawImage).toBeNull();
    });

    it('rejects a file that cannot be read', async () => {
      const { deps } = fakeDeps({ readFails: true });

      await expect(readAndDownscale(jpegFile(), deps)).rejects.toThrow(READ_ERROR);
    });

    it('rejects data that is not a decodable image', async () => {
      const { deps } = fakeDeps({ loadFails: true });

      await expect(readAndDownscale(jpegFile(), deps)).rejects.toThrow(READ_ERROR);
    });
  });
});
