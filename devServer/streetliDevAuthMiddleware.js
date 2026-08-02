const https = require('https');

const DEV_STREETLI_AUTH_ROUTE = '/__dev/streetli-auth/relogin';
const REMOTE_STREETLI_AUTH_URL =
  'https://us-central1-streetli.cloudfunctions.net/scheduledPatchAuth';
const JSON_HEADERS = {
  'Cache-Control': 'no-store',
  'Content-Type': 'application/json; charset=utf-8',
};

function trimOptionalString(value) {
  return value == null ? '' : String(value).trim();
}

function readStreetliAdminToken() {
  return trimOptionalString(
    process.env.STREETLI_SCHEDULED_PATCH_ADMIN_TOKEN
      || process.env.STREETLIVES_SCHEDULED_PATCH_ADMIN_TOKEN,
  );
}

function isLoopbackAddress(value) {
  const normalized = trimOptionalString(value).replace(/^::ffff:/i, '');
  return normalized === '127.0.0.1' || normalized === '::1';
}

function writeJson(res, statusCode, payload) {
  res.statusCode = statusCode;
  Object.keys(JSON_HEADERS).forEach((key) => {
    res.setHeader(key, JSON_HEADERS[key]);
  });
  res.end(JSON.stringify(payload));
}

function parseJsonOrError(text) {
  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch (error) {
    return { error: text };
  }
}

function postJson(url, headers, body) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const requestBody = JSON.stringify(body);
    const request = https.request({
      protocol: parsedUrl.protocol,
      hostname: parsedUrl.hostname,
      port: parsedUrl.port || 443,
      path: parsedUrl.pathname + parsedUrl.search,
      method: 'POST',
      headers: Object.assign({}, headers, {
        'Content-Length': Buffer.byteLength(requestBody),
      }),
    }, (response) => {
      let responseBody = '';
      response.setEncoding('utf8');
      response.on('data', (chunk) => {
        responseBody += chunk;
      });
      response.on('end', () => {
        resolve({
          ok: response.statusCode >= 200 && response.statusCode < 300,
          status: response.statusCode,
          payload: parseJsonOrError(responseBody),
        });
      });
    });

    request.on('error', reject);
    request.write(requestBody);
    request.end();
  });
}

async function fetchStreetliDevReloginBundle() {
  const adminToken = readStreetliAdminToken();
  if (!adminToken) {
    return {
      status: 500,
      payload: {
        error:
          'Missing STREETLI_SCHEDULED_PATCH_ADMIN_TOKEN in the dev server environment.',
      },
    };
  }

  const response = await postJson(
    REMOTE_STREETLI_AUTH_URL,
    {
      'Content-Type': 'application/json',
      'X-Streetli-Admin-Token': adminToken,
    },
    { relogin: true },
  );

  if (!response.ok) {
    return {
      status: response.status || 502,
      payload: response.payload || { error: 'Streetli relogin failed.' },
    };
  }

  const tokens = response.payload && response.payload.tokens
    ? response.payload.tokens
    : {};
  const accessToken = trimOptionalString(tokens.accessToken) || null;
  const idToken = trimOptionalString(tokens.idToken) || null;

  if (!accessToken && !idToken) {
    return {
      status: 502,
      payload: {
        error: 'Streetli relogin succeeded but did not return usable tokens.',
      },
    };
  }

  return {
    status: 200,
    payload: {
      username: response.payload.username || null,
      email: response.payload.email || null,
      authType: 'cognito_jwt',
      tokens: {
        accessToken,
        idToken,
        accessTokenExpiresAt: tokens.accessTokenExpiresAt || null,
        idTokenExpiresAt: tokens.idTokenExpiresAt || null,
      },
    },
  };
}

function attachStreetliDevAuthMiddleware(middlewareApp) {
  if (
    !middlewareApp
    || typeof middlewareApp.use !== 'function'
    || middlewareApp.__streetliDevAuthAttached
  ) {
    return;
  }

  middlewareApp.use(async (req, res, next) => {
    let pathname = '';
    try {
      pathname = new URL(req.url || '/', 'http://localhost').pathname;
    } catch (error) {
      pathname = trimOptionalString(req.url).split('?')[0];
    }

    if (pathname !== DEV_STREETLI_AUTH_ROUTE) {
      if (typeof next === 'function') {
        next();
      }
      return;
    }

    const socket = req.socket || req.connection || {};
    if (!isLoopbackAddress(socket.remoteAddress)) {
      writeJson(res, 403, {
        error: 'This localhost-only auth bridge only accepts loopback requests.',
      });
      return;
    }

    if (req.method === 'OPTIONS') {
      res.statusCode = 204;
      Object.keys(JSON_HEADERS).forEach((key) => {
        res.setHeader(key, JSON_HEADERS[key]);
      });
      res.end('');
      return;
    }

    if (req.method !== 'GET' && req.method !== 'POST') {
      res.setHeader('Allow', 'GET, POST, OPTIONS');
      writeJson(res, 405, { error: 'Method not allowed.' });
      return;
    }

    try {
      const result = await fetchStreetliDevReloginBundle();
      writeJson(res, result.status, result.payload);
    } catch (error) {
      writeJson(res, 500, {
        error: error instanceof Error
          ? error.message
          : String(error || 'Streetli relogin failed.'),
      });
    }
  });

  middlewareApp.__streetliDevAuthAttached = true;
}

module.exports = {
  DEV_STREETLI_AUTH_ROUTE,
  attachStreetliDevAuthMiddleware,
  fetchStreetliDevReloginBundle,
};
