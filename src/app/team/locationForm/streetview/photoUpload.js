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

// How far out the cropper may zoom: to where the whole photo fits inside the
// 5:3 frame. Zoom 1 is the photo covering the frame, so a photo already 5:3
// cannot zoom out at all, and the further its shape is from 5:3 the further it
// can. Organization photos are often portrait phone shots, and fitting all of
// one with bars beside it beats cutting off the name over the door.
export const minZoomFor = (imageWidth, imageHeight) => {
  const shape = imageWidth / imageHeight;
  return Math.min(1, shape / ASPECT, ASPECT / shape);
};

/**
 * The frame's region in the source image's own pixels, for a cropper whose
 * frame fills its box (`cropSize`, in screen pixels) with the photo covering it
 * at zoom 1. Zoomed out, the region reaches past the photo's edges: x or y go
 * negative and width or height exceed the photo, and renderCrop paints that
 * part black.
 *
 * react-easy-crop reports this itself, but clamped to the photo whenever it
 * also keeps the photo inside the frame, and that clamping is what makes it
 * useless once the photo is smaller than the frame.
 */
export const areaInPixels = ({
  crop, zoom, cropSize, imageWidth, imageHeight,
}) => {
  // On screen at zoom 1 the photo covers the box, so its width there is
  // whichever of these is larger.
  const coverWidth = Math.max(cropSize.width, cropSize.height * (imageWidth / imageHeight));
  // Source pixels per screen pixel.
  const scale = imageWidth / (coverWidth * zoom);
  const width = cropSize.width * scale;
  // `crop` is how far the photo's centre sits from the frame's, on screen.
  return {
    x: (imageWidth / 2) - (((cropSize.width / 2) + crop.x) * scale),
    y: (imageHeight / 2) - (((cropSize.height / 2) + crop.y) * scale),
    width,
    height: width / ASPECT,
  };
};

// Where the photo lands on the output canvas: the part of `area` that overlaps
// the photo, scaled by `scale`. Clipped here rather than left to drawImage,
// because browsers have disagreed about a source rectangle that runs off the
// image - some draw nothing at all.
//
// An edge that overshoots by under a source pixel is floating-point noise from
// a photo that exactly covers the frame. Taken literally it would draw a
// hairline of black down that edge, so it is pulled back flush.
export const placeImage = (area, imageWidth, imageHeight, scale) => {
  const flush = (start, size, limit) => {
    if (size > limit + 1) return start;
    if (start < 0 && start > -1) return 0;
    if (start + size > limit && start + size < limit + 1) return Math.max(0, limit - size);
    return start;
  };
  const x = flush(area.x, area.width, imageWidth);
  const y = flush(area.y, area.height, imageHeight);

  const left = Math.max(0, x);
  const top = Math.max(0, y);
  const right = Math.min(imageWidth, x + area.width);
  const bottom = Math.min(imageHeight, y + area.height);
  if (right <= left || bottom <= top) return null;

  return {
    source: {
      x: left, y: top, width: right - left, height: bottom - top,
    },
    target: {
      x: (left - x) * scale,
      y: (top - y) * scale,
      width: (right - left) * scale,
      height: (bottom - top) * scale,
    },
  };
};

// Width capped at OUTPUT_WIDTH, never upscaled: a crop smaller than that is
// kept at its own resolution rather than blown up and re-encoded. A zoomed-out
// crop is wider than the photo, bars included, so that is the width measured. The height
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
 * at most OUTPUT_WIDTH and encodes it. Wherever `area` runs past the photo the
 * output is black, so a photo of the wrong shape can still be shown whole.
 *
 * Resolves to { data, dataUrl, contentType, filename, byteSize, width, height }.
 * `data` is base64 with no prefix, which is the shape the API's PUT body
 * expects; `dataUrl` is the same bytes ready for an <img src>, so the staged
 * photo can be previewed before it is saved without encoding it twice.
 */
export const renderCrop = async (source, area, deps = browserDeps) => {
  const { image, filename } = source;
  const { width, height } = outputSize(area.width);
  const placed = placeImage(area, image.naturalWidth, image.naturalHeight, width / area.width);

  const canvas = deps.createCanvas();
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');
  // A single large downscale; without this Chrome uses its cheapest filter and
  // fine detail like signage comes out jagged.
  context.imageSmoothingQuality = 'high';
  // The bars beside a zoomed-out photo. Also what shows through a transparent
  // PNG, which is consistent with them and needed anyway: JPEG has no alpha.
  context.fillStyle = '#000';
  context.fillRect(0, 0, width, height);
  if (placed) {
    const { source: from, target: to } = placed;
    context.drawImage(
      image,
      from.x, from.y, from.width, from.height,
      to.x, to.y, to.width, to.height,
    );
  }

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
  loadSource, releaseSource, renderCrop, areaInPixels, placeImage, minZoomFor, outputSize,
};
