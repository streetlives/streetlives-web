const DEV_AUTH_QUERY_PARAM = 'devStreetliAuth';
const DEV_AUTH_ENDPOINT = '/__dev/streetli-auth/relogin';
const DEV_AUTH_ENABLED_STORAGE_KEY = 'streetlives:streetliDevAuthEnabled';
const DEV_AUTH_SESSION_STORAGE_KEY = 'streetlives:streetliDevAuthSession';
const EXPIRY_SKEW_MS = 60 * 1000;

function isBrowser() {
  return typeof window !== 'undefined' && !!window.location;
}

function getSessionStorage() {
  if (!isBrowser()) {
    return null;
  }

  try {
    return window.sessionStorage;
  } catch (error) {
    return null;
  }
}

function readQueryParam() {
  if (!isBrowser()) {
    return null;
  }

  if (typeof URLSearchParams !== 'undefined') {
    return new URLSearchParams(window.location.search).get(DEV_AUTH_QUERY_PARAM);
  }

  const match = window.location.search.match(new RegExp(`[?&]${DEV_AUTH_QUERY_PARAM}=([^&]*)`));
  return match ? decodeURIComponent(match[1].replace(/\+/g, ' ')) : null;
}

function isLocalDevHost() {
  if (!isBrowser()) {
    return false;
  }

  const { hostname } = window.location;
  return (
    hostname === 'localhost'
    || hostname === '127.0.0.1'
    || hostname === '::1'
    || hostname === '[::1]'
    || /\.localhost$/i.test(hostname)
  );
}

function clearLocalDevStreetliSession() {
  const storage = getSessionStorage();
  if (!storage) {
    return;
  }

  storage.removeItem(DEV_AUTH_ENABLED_STORAGE_KEY);
  storage.removeItem(DEV_AUTH_SESSION_STORAGE_KEY);
}

export function shouldUseLocalDevStreetliAuth() {
  if (!isBrowser() || !isLocalDevHost()) {
    return false;
  }

  const storage = getSessionStorage();
  const queryFlag = readQueryParam();

  if (queryFlag === '0' || queryFlag === 'false') {
    clearLocalDevStreetliSession();
    return false;
  }

  if (queryFlag === '1' || queryFlag === 'true') {
    if (storage) {
      storage.setItem(DEV_AUTH_ENABLED_STORAGE_KEY, '1');
    }
    return true;
  }

  return !!storage && storage.getItem(DEV_AUTH_ENABLED_STORAGE_KEY) === '1';
}

function normalizeExpiryMs(value) {
  if (value == null || value === '') {
    return null;
  }

  const numericValue = Number(value);
  if (Number.isFinite(numericValue)) {
    return numericValue < 1000000000000 ? numericValue * 1000 : numericValue;
  }

  const parsedValue = Date.parse(value);
  return Number.isFinite(parsedValue) ? parsedValue : null;
}

function isFreshSession(session) {
  if (!session) {
    return false;
  }

  const expiresAt = normalizeExpiryMs(session.idTokenExpiresAt || session.accessTokenExpiresAt);
  return !expiresAt || expiresAt > Date.now() + EXPIRY_SKEW_MS;
}

function normalizeSession(payload) {
  const tokens = payload && payload.tokens ? payload.tokens : {};
  return {
    username: payload && payload.username ? payload.username : null,
    email: payload && payload.email ? payload.email : null,
    authType: payload && payload.authType ? payload.authType : 'cognito_jwt',
    accessToken: tokens.accessToken || null,
    idToken: tokens.idToken || null,
    accessTokenExpiresAt: tokens.accessTokenExpiresAt || null,
    idTokenExpiresAt: tokens.idTokenExpiresAt || null,
  };
}

function readCachedSession() {
  const storage = getSessionStorage();
  if (!storage) {
    return null;
  }

  try {
    const session = JSON.parse(storage.getItem(DEV_AUTH_SESSION_STORAGE_KEY) || 'null');
    return isFreshSession(session) ? session : null;
  } catch (error) {
    storage.removeItem(DEV_AUTH_SESSION_STORAGE_KEY);
    return null;
  }
}

function writeCachedSession(session) {
  const storage = getSessionStorage();
  if (!storage || !session) {
    return;
  }

  storage.setItem(DEV_AUTH_SESSION_STORAGE_KEY, JSON.stringify(session));
}

function readJsonResponse(response) {
  return response.text().then((text) => {
    if (!text) {
      return null;
    }

    try {
      return JSON.parse(text);
    } catch (error) {
      return { error: text };
    }
  });
}

export function ensureLocalDevStreetliSession() {
  if (!shouldUseLocalDevStreetliAuth()) {
    return Promise.resolve(null);
  }

  const cachedSession = readCachedSession();
  if (cachedSession) {
    return Promise.resolve(cachedSession);
  }

  return fetch(DEV_AUTH_ENDPOINT, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
    },
    credentials: 'same-origin',
  })
    .then(response => readJsonResponse(response).then(payload => ({
      ok: response.ok,
      status: response.status,
      payload,
    })))
    .then((result) => {
      if (!result.ok) {
        const errorPayload = result.payload || {};
        throw new Error(errorPayload.error
            || `Streetli dev auth failed with HTTP ${result.status}.`);
      }

      const session = normalizeSession(result.payload);
      if (!session.idToken && !session.accessToken) {
        throw new Error('Streetli dev auth returned no usable token.');
      }

      writeCachedSession(session);
      return session;
    });
}

function decodeJwtPayload(jwt) {
  if (!jwt || typeof jwt !== 'string') {
    return {};
  }

  const parts = jwt.split('.');
  if (parts.length < 2 || typeof window.atob !== 'function') {
    return {};
  }

  const normalizedPayload = parts[1].replace(/-/g, '+').replace(/_/g, '/');
  const paddingLength = (4 - (normalizedPayload.length % 4)) % 4;
  const paddedPayload = normalizedPayload + new Array(paddingLength + 1).join('=');

  try {
    return JSON.parse(window.atob(paddedPayload));
  } catch (error) {
    return {};
  }
}

export function makeLocalDevStreetliIdToken(session) {
  if (!session || !session.idToken) {
    return null;
  }

  return {
    getJwtToken: () => session.idToken,
    payload: decodeJwtPayload(session.idToken),
  };
}

export function getLocalDevStreetliIdToken() {
  return ensureLocalDevStreetliSession()
    .then(session => makeLocalDevStreetliIdToken(session));
}
