import {
  loadSource,
  releaseSource,
  renderCrop,
  clampArea,
  outputSize,
  ASPECT,
  OUTPUT_WIDTH,
  OUTPUT_QUALITY,
  MAX_UPLOAD_BYTES,
  TYPE_ERROR,
  READ_ERROR,
  TOO_LARGE_ERROR,
} from './photoUpload';
import { PREVIEW_WIDTH, PREVIEW_HEIGHT } from './utils';

// jsdom has no canvas implementation, so loadSource and renderCrop take their
// browser APIs as an injectable dependency. These tests supply fakes and assert
// on what the production code does with them: the region it cuts out, the size
// it scales to, the encoding it asks for, how it strips the data-URL prefix,
// and the size cap it enforces. The one thing left to the browser is the
// encoder itself.

const jpegFile = (name = 'storefront.jpg') => ({ name, type: 'image/jpeg' });

// Genuine base64 of n bytes, not a string built to match the implementation's
// own arithmetic - otherwise a wrong formula on both sides would agree and the
// byte-size tests would prove nothing.
const base64OfBytes = n => Buffer.alloc(n, 0x41).toString('base64');

const fakeDeps = ({
  naturalWidth = 4000,
  naturalHeight = 3000,
  encodedBytes = 200 * 1024,
  webp = true,
  loadFails = false,
} = {}) => {
  const calls = {
    drawImage: null, toDataURL: [], canvasSize: null, revoked: [], context: null,
  };

  const canvas = {
    width: 0,
    height: 0,
    getContext: () => {
      calls.context = {
        fillRect: () => {},
        drawImage: (...args) => { calls.drawImage = args; },
      };
      return calls.context;
    },
    toDataURL: (type, quality) => {
      calls.toDataURL.push([type, quality]);
      calls.canvasSize = { width: canvas.width, height: canvas.height };
      // What a browser does when asked for a type it cannot encode.
      const actual = type === 'image/webp' && !webp ? 'image/png' : type;
      return `data:${actual};base64,${base64OfBytes(encodedBytes)}`;
    },
  };

  return {
    calls,
    image: { naturalWidth, naturalHeight },
    deps: {
      createObjectUrl: () => 'blob:original',
      revokeObjectUrl: (url) => { calls.revoked.push(url); },
      loadImage: () => (loadFails
        ? Promise.reject(new Error(READ_ERROR))
        : Promise.resolve({ naturalWidth, naturalHeight })),
      createCanvas: () => canvas,
    },
  };
};

const sourceFor = (image, filename = 'storefront.jpg') => ({
  url: 'blob:original', image, filename,
});

it('crops to the same 5:3 frame every preview box uses', () => {
  expect(ASPECT).toBe(PREVIEW_WIDTH / PREVIEW_HEIGHT);
  expect(ASPECT).toBeCloseTo(5 / 3);
});

describe('outputSize', () => {
  it('scales a large crop down to the output width', () => {
    expect(outputSize(3000)).toEqual({ width: OUTPUT_WIDTH, height: 720 });
  });

  it('never upscales a small crop', () => {
    expect(outputSize(600)).toEqual({ width: 600, height: 360 });
  });

  it('takes the height from the aspect ratio, not the crop', () => {
    const { width, height } = outputSize(1001);
    expect(height).toBe(Math.round(width / ASPECT));
  });

  it('never rounds a dimension down to zero', () => {
    expect(outputSize(0.2)).toEqual({ width: 1, height: 1 });
  });
});

describe('clampArea', () => {
  it('leaves an area inside the image alone', () => {
    expect(clampArea({
      x: 10, y: 20, width: 500, height: 300,
    }, 1000, 1000))
      .toEqual({
        x: 10, y: 20, width: 500, height: 300,
      });
  });

  it('pulls an area that rounds past the right and bottom edges back inside', () => {
    expect(clampArea({
      x: 501, y: 701, width: 500, height: 300,
    }, 1000, 1000))
      .toEqual({
        x: 500, y: 700, width: 500, height: 300,
      });
  });

  it('pulls a negative offset back to the edge', () => {
    expect(clampArea({
      x: -1, y: -0.6, width: 500, height: 300,
    }, 1000, 1000))
      .toEqual({
        x: 0, y: 0, width: 500, height: 300,
      });
  });
});

describe('loadSource', () => {
  it('returns the decoded image under an object URL, with its filename', async () => {
    const { deps } = fakeDeps();

    const source = await loadSource(jpegFile('front-door.jpg'), deps);

    expect(source).toEqual({
      url: 'blob:original',
      image: { naturalWidth: 4000, naturalHeight: 3000 },
      filename: 'front-door.jpg',
    });
  });

  it.each([
    ['no file', null],
    ['an SVG', { name: 'a.svg', type: 'image/svg+xml' }],
    ['a PDF', { name: 'a.pdf', type: 'application/pdf' }],
    ['a file with no type', { name: 'a', type: '' }],
  ])('rejects %s before decoding anything', async (_label, file) => {
    const { deps } = fakeDeps();
    const createObjectUrl = jest.spyOn(deps, 'createObjectUrl');

    await expect(loadSource(file, deps)).rejects.toThrow(TYPE_ERROR);
    expect(createObjectUrl).not.toHaveBeenCalled();
  });

  it('rejects data that is not a decodable image, and releases its URL', async () => {
    const { deps, calls } = fakeDeps({ loadFails: true });

    await expect(loadSource(jpegFile(), deps)).rejects.toThrow(READ_ERROR);
    expect(calls.revoked).toEqual(['blob:original']);
  });

  it('releases a source through releaseSource', () => {
    const { deps, calls } = fakeDeps();

    releaseSource({ url: 'blob:original' }, deps);
    releaseSource(null, deps);

    expect(calls.revoked).toEqual(['blob:original']);
  });
});

describe('renderCrop', () => {
  describe('cropping and resizing', () => {
    it('draws exactly the framed region, scaled to the output size', async () => {
      const { deps, calls, image } = fakeDeps({ naturalWidth: 4000, naturalHeight: 3000 });

      await renderCrop(sourceFor(image), {
        x: 500, y: 400, width: 2500, height: 1500,
      }, deps);

      // drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight)
      expect(calls.drawImage.slice(1)).toEqual([500, 400, 2500, 1500, 0, 0, 1200, 720]);
      expect(calls.canvasSize).toEqual({ width: 1200, height: 720 });
    });

    it('keeps a small crop at its own resolution', async () => {
      const { deps, calls, image } = fakeDeps({ naturalWidth: 800, naturalHeight: 600 });

      const result = await renderCrop(sourceFor(image), {
        x: 0, y: 60, width: 800, height: 480,
      }, deps);

      expect(calls.canvasSize).toEqual({ width: 800, height: 480 });
      expect(result).toMatchObject({ width: 800, height: 480 });
    });

    it('asks for high-quality smoothing on the downscale', async () => {
      const { deps, calls, image } = fakeDeps();

      await renderCrop(sourceFor(image), {
        x: 0, y: 0, width: 4000, height: 2400,
      }, deps);

      expect(calls.context.imageSmoothingQuality).toBe('high');
    });
  });

  describe('encoding', () => {
    it('encodes as WebP when the browser can', async () => {
      const { deps, calls, image } = fakeDeps();

      const result = await renderCrop(sourceFor(image), {
        x: 0, y: 0, width: 4000, height: 2400,
      }, deps);

      expect(calls.toDataURL).toEqual([['image/webp', OUTPUT_QUALITY]]);
      expect(result.contentType).toBe('image/webp');
      expect(result.filename).toBe('storefront.webp');
    });

    // A browser without a WebP encoder silently returns a PNG, which would be
    // several times larger than the photo it replaced.
    it('falls back to JPEG when the browser cannot encode WebP', async () => {
      const { deps, calls, image } = fakeDeps({ webp: false });

      const result = await renderCrop(sourceFor(image), {
        x: 0, y: 0, width: 4000, height: 2400,
      }, deps);

      expect(calls.toDataURL[1]).toEqual(['image/jpeg', OUTPUT_QUALITY]);
      expect(result.contentType).toBe('image/jpeg');
      expect(result.dataUrl.startsWith('data:image/jpeg;base64,')).toBe(true);
      expect(result.filename).toBe('storefront.jpg');
    });

    // The API's PUT body wants bare base64; the preview wants a data URL. Both
    // come from one encode rather than encoding twice.
    it('returns bare base64 for the API and a data URL for the preview', async () => {
      const { deps, image } = fakeDeps();

      const result = await renderCrop(sourceFor(image), {
        x: 0, y: 0, width: 4000, height: 2400,
      }, deps);

      expect(result.data.startsWith('data:')).toBe(false);
      expect(result.dataUrl).toBe(`data:image/webp;base64,${result.data}`);
    });

    it.each([
      ['front-door.PNG', 'front-door.webp'],
      ['no-extension', 'no-extension.webp'],
      ['', 'photo.webp'],
    ])('renames %s to match what was encoded', async (filename, expected) => {
      const { deps, image } = fakeDeps();

      const result = await renderCrop(sourceFor(image, filename), {
        x: 0, y: 0, width: 4000, height: 2400,
      }, deps);

      expect(result.filename).toBe(expected);
    });
  });

  describe('the size cap', () => {
    const crop = {
      x: 0, y: 0, width: 4000, height: 2400,
    };

    // Every padding case: n % 3 of 0, 1 and 2 produce '', '=' and '=='.
    it.each([1, 2, 3, 150 * 1024, 561641])(
      'reports %i bytes back from its base64',
      async (bytes) => {
        const { deps, image } = fakeDeps({ encodedBytes: bytes });

        const result = await renderCrop(sourceFor(image), crop, deps);

        expect(result.byteSize).toBe(bytes);
      },
    );

    it('accepts an image exactly at the limit', async () => {
      const { deps, image } = fakeDeps({ encodedBytes: MAX_UPLOAD_BYTES });

      await expect(renderCrop(sourceFor(image), crop, deps)).resolves.toBeTruthy();
    });

    // The API rejects anything over this, and Lambda's 6MB invoke payload sits
    // behind that, so catching it here is what turns a 400 into a clear message.
    it('rejects an image still over the limit after resizing', async () => {
      const { deps, image } = fakeDeps({ encodedBytes: MAX_UPLOAD_BYTES + 1024 });

      await expect(renderCrop(sourceFor(image), crop, deps)).rejects.toThrow(TOO_LARGE_ERROR);
    });
  });
});
