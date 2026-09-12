/* eslint-disable camelcase */

// Google Maps Street View URLs come in two shapes.
//
// A) A share link, which is also what YourPeer generates:
//      .../maps/@?api=1&map_action=pano&viewpoint=LAT,LNG&heading=H&pitch=P&fov=F&pano=ID
//
// B) A place/coordinate link, where the view lives in the path segment and the pano
//    details are buried in the `data=` blob:
//      .../@LAT,LNG,3a,75y,14.82h,88.07t/data=!3m7!1e1!3m5!1sPANO_ID!2e0!6s<encoded thumbnail>
//    The encoded thumbnail URL, when present, carries `panoid=`, `yaw=` and `pitch=`.

const MAX_PANO_ID_LENGTH = 128;

function safeDecodeURIComponent(value) {
  try {
    return decodeURIComponent(value);
  } catch (e) {
    return value;
  }
}

// A pano ID has to survive being put in a URL and stored in a STRING(128) column. An
// encoded space decodes to " ", which is truthy and would anchor the whole parse, so
// reject anything blank, whitespace-bearing or over-length rather than only over-length.
// Deliberately not a charset whitelist — refusing a pano Google considers valid would be
// a worse failure than accepting an odd-looking one.
function sanitizePanoId(panoId) {
  if (!panoId) return null;
  const trimmed = panoId.trim();
  if (!trimmed || /\s/.test(trimmed) || trimmed.length > MAX_PANO_ID_LENGTH) return null;
  return trimmed;
}

function finiteOrNull(value) {
  return Number.isFinite(value) ? value : null;
}

// "lat,lng", strictly. Number('') is 0, so splitting and mapping Number turns a truncated
// `viewpoint=40.7,` into the fabricated (40.7, 0) and a bare `viewpoint=,` into (0, 0) —
// both of which look perfectly valid downstream. Demand two non-empty numeric components.
function parseCoordPair(value) {
  const parts = String(value).split(',');
  if (parts.length !== 2) return null;

  const [latText, lngText] = parts.map(part => part.trim());
  if (!latText || !lngText) return null;

  const lat = Number(latText);
  const lng = Number(lngText);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;

  return { lat, lng };
}

// Google writes the camera angle two different ways. The `t` segment of an @-path is a
// *tilt*: 0 looks straight up, 90 is level, 180 straight down. The `pitch` parameter of a
// share link or thumbnail URL is Street View's own convention: 0 is level, +90 up, -90
// down. Checked against the 57 legacy URLs seeded in streetlives-api — 56 carry both, and
// `90 - t` equals the stated pitch in every one of them.
function pitchFromTilt(tilt) {
  return 90 - tilt;
}

function normalizeHeading(heading) {
  if (heading === null) return null;
  // Only wrap when it actually needs wrapping — the modulo introduces float drift that
  // would turn a clean 348.82 into 348.81999999999994.
  if (heading >= 0 && heading <= 360) return heading;
  return ((heading % 360) + 360) % 360;
}

function inRange(value, min, max) {
  return value === null || (value >= min && value <= max) ? value : null;
}

// An out-of-range field of view is a real view that sits outside what our schema stores,
// so clamping keeps the user's intent. Discarding it would silently fall back to the
// frontend default of 90, which is a much bigger change to the picture. fovFromZoom
// clamps the same way.
function clamp(value, min, max) {
  if (value === null) return null;
  return Math.min(max, Math.max(min, value));
}

// A share link is recognisable by its map_action/viewpoint, not just by carrying a pano —
// YourPeer's own buildStreetViewUrls omits `pano` whenever no historical image is pinned,
// and those URLs must not fall through to the @-path parser. Down there the only thing
// that would match is the query string's own `pitch=`, yielding a pitch and nothing else.
function isShareLink(parsedUrl) {
  return parsedUrl.searchParams.has('pano')
    || parsedUrl.searchParams.has('viewpoint')
    || parsedUrl.searchParams.get('map_action') === 'pano';
}

function parseShareLink(parsedUrl) {
  const result = {
    pano_id: parsedUrl.searchParams.get('pano'),
    lat: null,
    lng: null,
    heading: null,
    pitch: null,
    fov: null,
  };

  const viewpoint = parsedUrl.searchParams.get('viewpoint');
  const coords = viewpoint ? parseCoordPair(viewpoint) : null;
  if (coords) {
    result.lat = coords.lat;
    result.lng = coords.lng;
  }

  result.heading = finiteOrNull(parseFloat(parsedUrl.searchParams.get('heading')));
  // The API-side parser skips pitch here, so a URL we generated ourselves does not
  // round-trip through it. Read it.
  result.pitch = finiteOrNull(parseFloat(parsedUrl.searchParams.get('pitch')));

  const fov = parseFloat(parsedUrl.searchParams.get('fov'));
  result.fov = Number.isFinite(fov) ? Math.round(fov) : null;

  return result;
}

// Google marks a Street View @-segment with `3a`; a plain map link carries a zoom token
// like `15z` instead. Without this check an ordinary map URL parses as a Street View whose
// coordinates are simply wherever the map happened to be centred, quietly replacing a good
// override with the map centre and clearing the rest of the view.
function hasStreetViewMarker(decoded) {
  return /@[^/]*,3a[,/]/.test(decoded);
}

// Google adds a !5s<timestamp> token once you deliberately pick an older capture date.
// Its absence means the link points at current imagery, and storing that pano would
// freeze the override on today's picture instead of following whatever Google publishes
// next — the same reasoning as the picker's getPanoIdToPin(). Coordinates plus a point of
// view resolve to that very image today and keep tracking it afterwards.
const HISTORICAL_CAPTURE = /!5s\d{8}T\d{6}/;

function parsePlaceLink(url) {
  const result = {
    pano_id: null, lat: null, lng: null, heading: null, pitch: null, fov: null,
  };
  const decoded = safeDecodeURIComponent(url);

  const coordMatch = decoded.match(/@(-?\d+\.?\d*),(-?\d+\.?\d*),/);
  if (coordMatch) {
    result.lat = parseFloat(coordMatch[1]);
    result.lng = parseFloat(coordMatch[2]);
  }

  // Terminated by `,` or `/` — an @-segment can end right after the value.
  const fovMatch = decoded.match(/@[^/]*?,(\d+\.?\d*)y[,/]/);
  if (fovMatch) {
    result.fov = Math.round(parseFloat(fovMatch[1]));
  }

  const panoIdMatch = decoded.match(/panoid=([^&!]+)/) || decoded.match(/!1s([^!]+)!2e0/);
  if (panoIdMatch) {
    const [, panoId] = panoIdMatch;
    result.pano_id = panoId;
  }

  // `yaw` from the thumbnail URL is more precise than the rounded `h` path segment.
  const yawMatch = decoded.match(/yaw=(-?\d+\.?\d*)/);
  const headingMatch = decoded.match(/@[^/]*?,(-?\d+\.?\d*)h[,/]/);
  if (yawMatch) {
    result.heading = parseFloat(yawMatch[1]);
  } else if (headingMatch) {
    result.heading = parseFloat(headingMatch[1]);
  }

  // An explicit pitch wins; the tilt segment is the fallback for short URLs that carry no
  // encoded thumbnail, which are exactly the ones the API-side parser leaves pitchless.
  const pitchMatch = decoded.match(/pitch=(-?\d+\.?\d*)/);
  const tiltMatch = decoded.match(/@[^/]*?,(-?\d+\.?\d*)t[,/]/);
  if (pitchMatch) {
    result.pitch = parseFloat(pitchMatch[1]);
  } else if (tiltMatch) {
    result.pitch = pitchFromTilt(parseFloat(tiltMatch[1]));
  }

  // Coordinates alone are not evidence of a Street View. A pano ID is; so is the 3a
  // marker. With neither, drop everything so the caller reports an unreadable link rather
  // than overwriting good values with a map centre.
  if (!result.pano_id && !hasStreetViewMarker(decoded)) {
    return {
      pano_id: null, lat: null, lng: null, heading: null, pitch: null, fov: null,
    };
  }

  // Only pin a pano the user actually went looking for. Needs coordinates to fall back on.
  const hasCoords = result.lat !== null && result.lng !== null;
  if (result.pano_id && hasCoords && !HISTORICAL_CAPTURE.test(decoded)) {
    result.pano_id = null;
  }

  return result;
}

/**
 * Pull the structured Street View fields out of a Google Maps URL.
 *
 * Returns null when the string is not a URL, or when it contains no usable Street View
 * anchor — a pano ID, or both coordinates. Callers rely on that to tell "this URL is no
 * good" apart from "parsed fine, but some fields were absent", so a bad paste can report
 * an error without overwriting what the user already had.
 */
export function parseStreetviewUrl(url) {
  if (typeof url !== 'string' || !url.trim()) return null;

  let parsedUrl;
  try {
    parsedUrl = new URL(url.trim());
  } catch (e) {
    return null;
  }

  const result = isShareLink(parsedUrl)
    ? parseShareLink(parsedUrl)
    : parsePlaceLink(url.trim());

  result.heading = inRange(normalizeHeading(result.heading), 0, 360);
  result.pitch = inRange(result.pitch, -90, 90);
  result.fov = clamp(result.fov, 10, 120);
  result.lat = inRange(result.lat, -90, 90);
  result.lng = inRange(result.lng, -180, 180);
  result.pano_id = sanitizePanoId(result.pano_id);

  const hasAnchor = !!result.pano_id || (result.lat !== null && result.lng !== null);
  return hasAnchor ? result : null;
}

// Google's panorama exposes zoom; we store a field of view. These two are inverses, and
// live together so the round trip can be tested.
export const fovFromZoom = zoom => (
  Math.min(120, Math.max(10, Math.round(180 / (2 ** (zoom || 1)))))
);

export function zoomFromFov(fov) {
  return Math.log2(180 / (fov || 90));
}

// Short share links (the Share button's output) carry no coordinates at all and can't be
// resolved from the browser, so they get their own message rather than the generic one.
const SHORT_LINK_HOSTS = ['maps.app.goo.gl', 'goo.gl', 'g.co'];

export function isShortStreetviewLink(url) {
  if (typeof url !== 'string') return false;
  try {
    return SHORT_LINK_HOSTS.includes(new URL(url.trim()).hostname);
  } catch (e) {
    return false;
  }
}
