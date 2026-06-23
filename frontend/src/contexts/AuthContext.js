import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import Keycloak from 'keycloak-js';
import { setTokenGetter } from '../services/api';

const AuthContext = createContext(null);

let keycloakInstance = null;

const getKeycloakInstance = () => {
  if (!keycloakInstance) {
    keycloakInstance = new Keycloak({
      url: process.env.REACT_APP_KEYCLOAK_URL || 'http://localhost:8180',
      realm: process.env.REACT_APP_KEYCLOAK_REALM || 'microservices-realm',
      clientId: process.env.REACT_APP_KEYCLOAK_CLIENT_ID || 'frontend-client',
    });
  }
  return keycloakInstance;
};

export const AuthProvider = ({ children }) => {
  const [keycloak] = useState(() => getKeycloakInstance());
  const [authenticated, setAuthenticated] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const initKeycloak = async () => {
      try {
        console.log('🔐 Initializing Keycloak ONCE...');
        
        // Try to get existing authentication first
        const auth = await keycloak.init({
          onLoad: 'check-sso',
          checkLoginIframe: false,
          pkceMethod: 'S256',
          enableLogging: true,
        });

        if (!isMounted) return;

        console.log('✅ Keycloak initialized - authenticated:', auth);
        console.log('🎫 Token exists:', !!keycloak.token);
        
        // FORCE authentication to true and bypass the redirect loop
        if (keycloak.token) {
          setAuthenticated(true);
          setUserInfo({
            username: keycloak.tokenParsed?.preferred_username || 'demo-user',
            firstName: keycloak.tokenParsed?.given_name || 'Demo',
            lastName: keycloak.tokenParsed?.family_name || 'User',
            email: keycloak.tokenParsed?.email || 'demo@example.com',
            roles: keycloak.tokenParsed?.realm_access?.roles || ['USER'],
          });
          setTokenGetter(() => keycloak.token);
          console.log('👤 User authenticated with token');
        } else {
          // No token but still set as initialized
          setAuthenticated(false);
          console.log('❌ No token - user needs to login');
        }
        
        setInitialized(true);

        // Clean up URL hash fragment from Keycloak redirect
        if (window.location.hash) {
          console.log('🧹 Cleaning up Keycloak hash fragment');
          window.history.replaceState(null, '', window.location.pathname);
        }

        // Token refresh only if authenticated
        if (auth && keycloak.token) {
          setInterval(() => {
            keycloak.updateToken(70).then((refreshed) => {
              if (refreshed) {
                console.log('🔄 Token refreshed');
                setTokenGetter(() => keycloak.token);
              }
            }).catch(() => {
              console.error('❌ Failed to refresh token');
              setAuthenticated(false);
            });
          }, 60000);
        }
      } catch (error) {
        console.error('❌ Keycloak initialization failed:', error);
        if (isMounted) {
          setInitialized(true);
          setAuthenticated(false);
        }
      }
    };

    initKeycloak();

    return () => {
      isMounted = false;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const login = useCallback(() => {
    console.log('🔑 Redirecting to login...');
    keycloak.login();
  }, [keycloak]);

  const logout = useCallback(() => {
    console.log('🚪 Logging out...');
    keycloak.logout();
  }, [keycloak]);

  const getToken = useCallback(() => {
    return keycloak.token;
  }, [keycloak]);

  const hasRole = useCallback((role) => {
    return userInfo?.roles?.includes(role) || false;
  }, [userInfo]);

  const value = {
    keycloak,
    authenticated,
    initialized,
    userInfo,
    login,
    logout,
    getToken,
    hasRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
