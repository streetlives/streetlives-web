// Prepares an organization-provided photo for upload.
//
// Downscaling is required, not cosmetic. A photo straight off a phone is 3-8MB;
// base64 inflates it by a third, and the API caps a decoded image at 4MiB with
// Lambda's 6MB invoke payload behind that. Sending the original would fail for
// most real photos.
//
// This lives in its own module because jsdom has no canvas implementation and
// the test suite has no canvas mock, so component tests stub this out wholesale.

export const MAX_DIMENSION = 1600;
export const JPEG_QUALITY = 0.8;
export const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;

export const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
export const ACCEPT_ATTRIBUTE = ACCEPTED_TYPES.join(',');

export const TYPE_ERROR = 'That file is not a JPEG, PNG or WebP image.';
export const READ_ERROR = 'That file could not be read as an image.';
export const TOO_LARGE_ERROR =
  'That image is still too large after resizing. Try a smaller photo.';

const readAsDataUrl = file => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve(reader.result);
  reader.onerror = () => reject(new Error(READ_ERROR));
  reader.readAsDataURL(file);
});

const loadImage = dataUrl => new Promise((resolve, reject) => {
  const image = new Image();
  image.onload = () => resolve(image);
  image.onerror = () => reject(new Error(READ_ERROR));
  image.src = dataUrl;
});

// Longest edge to MAX_DIMENSION, preserving aspect ratio. Never upscales: a
// small photo stays exactly as it is rather than being blown up and re-encoded.
export const scaledSize = (width, height) => {
  const longest = Math.max(width, height);
  if (longest <= MAX_DIMENSION) return { width, height };

  const ratio = MAX_DIMENSION / longest;
  return {
    width: Math.max(1, Math.round(width * ratio)),
    height: Math.max(1, Math.round(height * ratio)),
  };
};

/**
 * Resolves to { data, dataUrl, contentType, filename, byteSize }. `data` is
 * base64 with no prefix, which is the shape the API's PUT body expects;
 * `dataUrl` is the same bytes ready for an <img src>, so the staged photo can
 * be previewed before it is saved without encoding it twice.
 */
export const readAndDownscale = async (file) => {
  if (!file || !ACCEPTED_TYPES.includes(file.type)) {
    throw new Error(TYPE_ERROR);
  }

  const dataUrl = await readAsDataUrl(file);
  const image = await loadImage(dataUrl);

  const { width, height } = scaledSize(image.naturalWidth, image.naturalHeight);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  canvas.getContext('2d').drawImage(image, 0, 0, width, height);

  // Always re-encode as JPEG: it is the one format where the quality setting
  // buys a real size reduction, and the API accepts it.
  const encoded = canvas.toDataURL('image/jpeg', JPEG_QUALITY);
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
    contentType: 'image/jpeg',
    filename: file.name,
    byteSize,
  };
};

export default { readAndDownscale, scaledSize };
