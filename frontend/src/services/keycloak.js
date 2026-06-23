import Keycloak from 'keycloak-js';

const keycloakConfig = {
  url: process.env.REACT_APP_KEYCLOAK_URL || 'http://localhost:8180',
  realm: process.env.REACT_APP_KEYCLOAK_REALM || 'microservices-realm',
  clientId: process.env.REACT_APP_KEYCLOAK_CLIENT_ID || 'frontend-client',
};

const keycloak = new Keycloak(keycloakConfig);

let keycloakInitPromise = null;

export const initKeycloak = async () => {
  // Return existing promise if already initializing/initialized
  if (keycloakInitPromise) {
    console.log('Returning existing Keycloak initialization');
    return keycloakInitPromise;
  }
  
  keycloakInitPromise = (async () => {
    try {
      const authenticated = await keycloak.init({
        checkLoginIframe: false,
        pkceMethod: 'S256',
        enableLogging: true,
        
        // Use adapter to persist token in sessionStorage
        adapter: 'default',
        
        // Restore token from storage if exists
        token: sessionStorage.getItem('kc_token'),
        refreshToken: sessionStorage.getItem('kc_refreshToken'),
        idToken: sessionStorage.getItem('kc_idToken'),
      });

      console.log('Keycloak init result - authenticated:', authenticated);
      console.log('Keycloak token:', keycloak.token ? 'exists' : 'null');

      if (authenticated) {
        console.log('User authenticated - saving tokens');
        
        // Save tokens to sessionStorage
        sessionStorage.setItem('kc_token', keycloak.token);
        sessionStorage.setItem('kc_refreshToken', keycloak.refreshToken);
        sessionStorage.setItem('kc_idToken', keycloak.idToken);
        
        console.log('User info:', keycloak.tokenParsed);
        
        // Set up token refresh
        setInterval(() => {
          keycloak.updateToken(70).then((refreshed) => {
            if (refreshed) {
              console.log('Token refreshed - updating storage');
              sessionStorage.setItem('kc_token', keycloak.token);
              sessionStorage.setItem('kc_refreshToken', keycloak.refreshToken);
              sessionStorage.setItem('kc_idToken', keycloak.idToken);
            }
          }).catch(() => {
            console.log('Failed to refresh token');
          });
        }, 60000);
      } else {
        console.log('User not authenticated - use login button');
      }

      return authenticated;
    } catch (error) {
      console.error('Failed to initialize Keycloak:', error);
      keycloakInitPromise = null; // Reset on error to allow retry
      return false;
    }
  })();
  
  return keycloakInitPromise;
};

export const login = () => {
  keycloak.login();
};

export const logout = () => {
  // Clear sessionStorage
  sessionStorage.removeItem('kc_token');
  sessionStorage.removeItem('kc_refreshToken');
  sessionStorage.removeItem('kc_idToken');
  
  keycloak.logout();
};

export const getToken = () => {
  return keycloak.token;
};

export const getUserInfo = () => {
  return {
    username: keycloak.tokenParsed?.preferred_username,
    email: keycloak.tokenParsed?.email,
    firstName: keycloak.tokenParsed?.given_name,
    lastName: keycloak.tokenParsed?.family_name,
    roles: keycloak.tokenParsed?.realm_access?.roles || [],
  };
};

export const hasRole = (role) => {
  const roles = keycloak.tokenParsed?.realm_access?.roles || [];
  return roles.includes(role);
};

export const isAuthenticated = () => {
  // Check both Keycloak state and sessionStorage
  const hasStoredToken = !!sessionStorage.getItem('kc_token');
  const keycloakAuth = keycloak.authenticated;
  
  console.log('isAuthenticated check - keycloak:', keycloakAuth, 'storage:', hasStoredToken);
  
  return keycloakAuth || hasStoredToken;
};

export default keycloak;