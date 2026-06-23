const axios = require('axios');
const jwt = require('jsonwebtoken');

const realm = process.env.KEYCLOAK_REALM || 'microservices-realm';
const keycloakUrls = [
  process.env.KEYCLOAK_URL || 'http://keycloak:8180',
  'http://keycloak:8180',
  'http://localhost:8180'
];

let jwksCache = null;
let jwksCacheExpiresAt = 0;

const certToPem = (cert) => {
  const wrapped = cert.match(/.{1,64}/g).join('\n');
  return `-----BEGIN CERTIFICATE-----\n${wrapped}\n-----END CERTIFICATE-----`;
};

const fetchJwks = async () => {
  if (jwksCache && Date.now() < jwksCacheExpiresAt) {
    return jwksCache;
  }

  let lastError = null;

  for (const keycloakUrl of keycloakUrls) {
    try {
      const certsUrl = `${keycloakUrl}/realms/${realm}/protocol/openid-connect/certs`;
      const response = await axios.get(certsUrl, { timeout: 5000 });
      jwksCache = response.data.keys || [];
      jwksCacheExpiresAt = Date.now() + 10 * 60 * 1000;
      return jwksCache;
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError || new Error('Unable to fetch Keycloak certificates');
};

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Access token required' });
    }

    const token = authHeader.substring(7);
    const decodedHeader = jwt.decode(token, { complete: true });

    if (!decodedHeader?.header?.kid) {
      return res.status(401).json({ error: 'Invalid token header' });
    }

    const keys = await fetchJwks();
    const signingKey = keys.find((key) => key.kid === decodedHeader.header.kid);

    if (!signingKey?.x5c?.[0]) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    req.user = jwt.verify(token, certToPem(signingKey.x5c[0]), {
      algorithms: ['RS256']
    });
    req.token = token;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error.message);
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

module.exports = authMiddleware;
