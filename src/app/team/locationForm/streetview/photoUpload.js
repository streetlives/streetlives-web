// Prepares an organization-provided photo for upload: the specialist frames it
// in the cropper, and this cuts out exactly that frame, shrinks it and
// re-encodes it.
//
// Cropping here rather than leaving it to `object-fit: cover` on each site is
// what makes the cropper an honest preview. The stored image already is the
// 5:3 frame YourPeer and this app both display, so neither has anything left
// to trim.
//
// Shrinking is required, not cosmetic. A photo straight off a phone is 3-8MB;
// base64 inflates it by a third, and the API caps a decoded image at 4MiB with
// Lambda's 6MB invoke payload behind that. It also keeps S3 and every page view
// small: the largest box either site draws this in is well under OUTPUT_WIDTH.
//
// This lives in its own module because jsdom has no canvas implementation and
// the test suite has no canvas mock, so component tests stub this out wholesale.

import { PREVIEW_WIDTH, PREVIEW_HEIGHT } from './utils';

// The frame every preview of this photo uses. Same constants, so the crop and
// the boxes it is shown in cannot drift apart.
export const ASPECT = PREVIEW_WIDTH / PREVIEW_HEIGHT;

// Twice PREVIEW_WIDTH, so a high-density screen still gets a sharp image, and
// above the ~850px YourPeer's side panel reaches on a 2560px-wide monitor.
export const OUTPUT_WIDTH = 1200;
export const OUTPUT_QUALITY = 0.75;
export const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;

export const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
export const ACCEPT_ATTRIBUTE = ACCEPTED_TYPES.join(',');

export const TYPE_ERROR = 'That file is not a JPEG, PNG or WebP image.';
export const READ_ERROR = 'That file could not be read as an image.';
export const TOO_LARGE_ERROR =
  'That image is still too large after resizing. Try a smaller photo.';

const loadImage = url => new Promise((resolve, reject) => {
  const image = new Image();
  image.onload = () => resolve(image);
  image.onerror = () => reject(new Error(READ_ERROR));
  image.src = url;
});

// The browser APIs this needs, gathered in one place so tests can supply their
// own. jsdom has no canvas implementation at all, so without this seam the
// cropping, encoding and size-enforcement logic below could only ever be
// exercised by hand in a real browser.
export const browserDeps = {
  // An object URL rather than a data URL: the original can be several
  // megabytes, and the cropper only needs to display it, not hold it as text.
  createObjectUrl: file => URL.createObjectURL(file),
  revokeObjectUrl: url => URL.revokeObjectURL(url),
  loadImage,
  createCanvas: () => document.createElement('canvas'),
};

/**
 * Validates and decodes a picked file for the cropper. Resolves to
 * { url, image, filename }; `url` is an object URL the caller must hand back to
 * releaseSource once it is done with it.
 */
export const loadSource = async (file, deps = browserDeps) => {
  if (!file || !ACCEPTED_TYPES.includes(file.type)) {
    throw new Error(TYPE_ERROR);
  }

  const url = deps.createObjectUrl(file);
  try {
    const image = await deps.loadImage(url);
    return { url, image, filename: file.name };
  } catch (err) {
    deps.revokeObjectUrl(url);
    throw err;
  }
};

export const releaseSource = (source, deps = browserDeps) => {
  if (source && source.url) deps.revokeObjectUrl(source.url);
};

// The cropper reports its area in the source image's pixels, rounded, so it
// can sit a pixel past an edge. Pull it back inside rather than letting
// drawImage sample transparent pixels outside the image into a hairline border.
export const clampArea = (area, imageWidth, imageHeight) => {
  const width = Math.max(1, Math.min(Math.round(area.width), imageWidth));
  const height = Math.max(1, Math.min(Math.round(area.height), imageHeight));
  return {
    x: Math.min(Math.max(0, Math.round(area.x)), imageWidth - width),
    y: Math.min(Math.max(0, Math.round(area.y)), imageHeight - height),
    width,
    height,
  };
};

// Width capped at OUTPUT_WIDTH, never upscaled: a crop smaller than that is
// kept at its own resolution rather than blown up and re-encoded. The height
// comes from ASPECT rather than the crop, so the output is exactly 5:3 even
// when the cropper's rounding is not.
export const outputSize = (cropWidth) => {
  const width = Math.max(1, Math.round(Math.min(cropWidth, OUTPUT_WIDTH)));
  return { width, height: Math.max(1, Math.round(width / ASPECT)) };
};

const EXTENSIONS = { 'image/webp': 'webp', 'image/jpeg': 'jpg' };

const renameFor = (filename, contentType) => {
  const base = (filename || 'photo').replace(/\.[^./\\]+$/, '');
  return `${base}.${EXTENSIONS[contentType]}`;
};

// WebP is usually 25-35% smaller than JPEG at the same visual quality, so it is
// tried first. A browser that cannot encode it hands back a PNG instead of
// failing, which is how that case is recognised; JPEG is the fallback there.
const encode = (canvas) => {
  const webp = canvas.toDataURL('image/webp', OUTPUT_QUALITY);
  if (webp.startsWith('data:image/webp')) return { encoded: webp, contentType: 'image/webp' };
  return {
    encoded: canvas.toDataURL('image/jpeg', OUTPUT_QUALITY),
    contentType: 'image/jpeg',
  };
};

/**
 * Cuts `area` (in the source image's own pixels) out of `source`, scales it to
 * at most OUTPUT_WIDTH and encodes it.
 *
 * Resolves to { data, dataUrl, contentType, filename, byteSize, width, height }.
 * `data` is base64 with no prefix, which is the shape the API's PUT body
 * expects; `dataUrl` is the same bytes ready for an <img src>, so the staged
 * photo can be previewed before it is saved without encoding it twice.
 */
export const renderCrop = async (source, area, deps = browserDeps) => {
  const { image, filename } = source;
  const crop = clampArea(area, image.naturalWidth, image.naturalHeight);
  const { width, height } = outputSize(crop.width);

  const canvas = deps.createCanvas();
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');
  // A single large downscale; without this Chrome uses its cheapest filter and
  // fine detail like signage comes out jagged.
  context.imageSmoothingQuality = 'high';
  // A transparent PNG would otherwise go black wherever it falls back to JPEG.
  context.fillStyle = '#fff';
  context.fillRect(0, 0, width, height);
  context.drawImage(image, crop.x, crop.y, crop.width, crop.height, 0, 0, width, height);

  const { encoded, contentType } = encode(canvas);
  const data = encoded.slice(encoded.indexOf(',') + 1);

  // base64 is 4 characters per 3 bytes, minus any padding.
  const padding = (data.endsWith('==') && 2) || (data.endsWith('=') && 1) || 0;
  const byteSize = ((data.length * 3) / 4) - padding;

  if (byteSize > MAX_UPLOAD_BYTES) {
    throw new Error(TOO_LARGE_ERROR);
  }

  return {
    data,
    dataUrl: encoded,
    contentType,
    filename: renameFor(filename, contentType),
    byteSize,
    width,
    height,
  };
};

export default {
  loadSource, releaseSource, renderCrop, clampArea, outputSize,
};
