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
// The original is kept too, as `source`, so the crop can be adjusted after the
// photo is saved: without it the stored crop is all that is left, and whatever
// it cut off is gone. It is shrunk and re-encoded once, when picked, and those
// exact bytes are what is stored and later fetched back, so adjusting a crop
// never re-encodes it again. Re-encoding also strips the camera's metadata,
// GPS position included, from a file that ends up on a public CDN.
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
// The API holds the photo and its original to this together, since they share
// one request and Lambda's payload limit bounds the request.
export const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;

// The original is kept big enough to re-crop from - several times what one
// crop of it needs - and no bigger, since it shares the upload's budget.
export const SOURCE_MAX_EDGE = 2400;
export const SOURCE_QUALITY = 0.85;

export const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
export const ACCEPT_ATTRIBUTE = ACCEPTED_TYPES.join(',');

export const TYPE_ERROR = 'That file is not a JPEG, PNG or WebP image.';
export const READ_ERROR = 'That file could not be read as an image.';
export const TOO_LARGE_ERROR =
  'That image is still too large after resizing. Try a smaller photo.';
export const FETCH_ERROR = 'Could not load the saved photo to adjust it. Please try again.';

// Bare base64 and its byte count, from a data URL.
const splitDataUrl = (dataUrl) => {
  const data = dataUrl.slice(dataUrl.indexOf(',') + 1);
  // base64 is 4 characters per 3 bytes, minus any padding.
  const padding = (data.endsWith('==') && 2) || (data.endsWith('=') && 1) || 0;
  return { data, byteSize: ((data.length * 3) / 4) - padding };
};

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
  // `no-store` because the preview has very likely already put this image in
  // the HTTP cache from a plain <img>, which sends no Origin. A copy cached
  // without CORS headers fails a CORS request, and the objects are immutable
  // with a year-long max-age, so that copy would never age out.
  fetchBlob: async (url) => {
    const response = await fetch(url, { mode: 'cors', cache: 'no-store' });
    if (!response.ok) throw new Error(FETCH_ERROR);
    return response.blob();
  },
  readAsDataUrl: blob => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error(FETCH_ERROR));
    reader.readAsDataURL(blob);
  }),
};

// WebP is usually 25-35% smaller than JPEG at the same visual quality, so it is
// tried first. A browser that cannot encode it hands back a PNG instead of
// failing, which is how that case is recognised; JPEG is the fallback there.
const encode = (canvas, quality = OUTPUT_QUALITY) => {
  const webp = canvas.toDataURL('image/webp', quality);
  if (webp.startsWith('data:image/webp')) return { encoded: webp, contentType: 'image/webp' };
  return {
    encoded: canvas.toDataURL('image/jpeg', quality),
    contentType: 'image/jpeg',
  };
};

// The original's size once shrunk: its long edge capped at SOURCE_MAX_EDGE,
// never upscaled.
export const sourceSize = (imageWidth, imageHeight) => {
  const scale = Math.min(1, SOURCE_MAX_EDGE / Math.max(imageWidth, imageHeight));
  return {
    width: Math.max(1, Math.round(imageWidth * scale)),
    height: Math.max(1, Math.round(imageHeight * scale)),
  };
};

/**
 * Validates and decodes a picked file for the cropper, shrinking it to the
 * original that will be kept. Resolves to { url, image, filename, data,
 * contentType }: `image` is the shrunk original under `url`, and `data` is its
 * bare base64 for the API. Hand it back to releaseSource once done with it.
 */
export const loadSource = async (file, deps = browserDeps) => {
  if (!file || !ACCEPTED_TYPES.includes(file.type)) {
    throw new Error(TYPE_ERROR);
  }

  // An object URL rather than a data URL: the file can be several megabytes,
  // and it only needs decoding, not holding as text.
  const fileUrl = deps.createObjectUrl(file);
  let picked;
  try {
    picked = await deps.loadImage(fileUrl);
  } finally {
    // The shrunk copy replaces it, so it is done with either way.
    deps.revokeObjectUrl(fileUrl);
  }

  const { width, height } = sourceSize(picked.naturalWidth, picked.naturalHeight);
  const canvas = deps.createCanvas();
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');
  context.imageSmoothingQuality = 'high';
  // What shows through a transparent PNG, matching renderCrop.
  context.fillStyle = '#000';
  context.fillRect(0, 0, width, height);
  context.drawImage(picked, 0, 0, width, height);

  const { encoded, contentType } = encode(canvas, SOURCE_QUALITY);
  const image = await deps.loadImage(encoded);
  return {
    url: encoded,
    image,
    filename: file.name,
    data: splitDataUrl(encoded).data,
    contentType,
  };
};

/**
 * Fetches an original kept by the API, or for a photo saved before originals
 * were kept the photo itself, for the cropper. Same shape as loadSource, and
 * `data` is the bytes exactly as stored: re-cropping must not re-encode them.
 *
 * Needs CORS on the photo CDN. The image is decoded from an object URL of the
 * fetched bytes, which is same-origin, so drawing it never taints the canvas.
 */
export const loadRemoteSource = async (url, filename, deps = browserDeps) => {
  let blob;
  try {
    blob = await deps.fetchBlob(url);
  } catch (err) {
    throw new Error(FETCH_ERROR);
  }
  if (!ACCEPTED_TYPES.includes(blob.type)) throw new Error(READ_ERROR);

  const dataUrl = await deps.readAsDataUrl(blob);
  const objectUrl = deps.createObjectUrl(blob);
  try {
    const image = await deps.loadImage(objectUrl);
    return {
      url: objectUrl,
      image,
      filename,
      data: splitDataUrl(dataUrl).data,
      contentType: blob.type,
    };
  } catch (err) {
    deps.revokeObjectUrl(objectUrl);
    throw err;
  }
};

// A picked file's original is held as a data URL, which has nothing to revoke.
export const releaseSource = (source, deps = browserDeps) => {
  if (source && source.url && source.url.startsWith('blob:')) deps.revokeObjectUrl(source.url);
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

/**
 * Cuts `area` (in the source image's own pixels) out of `source`, scales it to
 * at most OUTPUT_WIDTH and encodes it. Wherever `area` runs past the photo the
 * output is black, so a photo of the wrong shape can still be shown whole.
 *
 * Resolves to { data, dataUrl, contentType, filename, byteSize, width, height,
 * source }. `data` is base64 with no prefix, which is the shape the API's PUT
 * body expects; `dataUrl` is the same bytes ready for an <img src>, so the
 * staged photo can be previewed before it is saved without encoding it twice.
 *
 * `source` is the original to keep, { contentType, data }, or null when there
 * is none or it would not fit in the upload beside the crop. Leaving it out
 * still saves the crop; only adjusting it later is lost.
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
  const { data, byteSize } = splitDataUrl(encoded);

  if (byteSize > MAX_UPLOAD_BYTES) {
    throw new Error(TOO_LARGE_ERROR);
  }

  const original = source.data
    ? { contentType: source.contentType, data: source.data }
    : null;
  const fits = original
    && byteSize + splitDataUrl(`,${original.data}`).byteSize <= MAX_UPLOAD_BYTES;

  return {
    data,
    dataUrl: encoded,
    contentType,
    filename: renameFor(filename, contentType),
    byteSize,
    width,
    height,
    source: fits ? original : null,
  };
};

export default {
  loadSource,
  loadRemoteSource,
  releaseSource,
  renderCrop,
  areaInPixels,
  placeImage,
  minZoomFor,
  outputSize,
  sourceSize,
};
