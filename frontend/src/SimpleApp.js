import React, { useState, useEffect } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Button, Container, Typography, Alert, Card, CardContent, Box } from '@mui/material';
import Keycloak from 'keycloak-js';
import { offreApi, setTokenGetter } from './services/api';

const theme = createTheme({
  palette: { primary: { main: '#1976d2' } }
});

let keycloakInstance = null;

function SimpleApp() {
  const [keycloak, setKeycloak] = useState(null);
  const [authenticated, setAuthenticated] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [offres, setOffres] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentView, setCurrentView] = useState('login');
  const [userInfo, setUserInfo] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!keycloakInstance) {
      keycloakInstance = new Keycloak({
        url: 'http://localhost:8180',
        realm: 'microservices-realm',
        clientId: 'frontend-client',
      });
    }
    
    setKeycloak(keycloakInstance);
    
    // Expose globally for debugging
    window.keycloakInstance = keycloakInstance;
    console.log('🌍 Keycloak exposed globally');
    
    const initAuth = async () => {
      try {
        console.log('🔐 Simple App - Initializing Keycloak...');
        const auth = await keycloakInstance.init({
          onLoad: 'check-sso',
          checkLoginIframe: false,
          pkceMethod: 'S256',
          enableLogging: true,
        });
        
        console.log('✅ Simple App - Authenticated:', auth);
        setAuthenticated(auth);
        setInitialized(true);
        
        if (auth) {
          setTokenGetter(() => keycloakInstance.token);
          setUserInfo({
            username: keycloakInstance.tokenParsed?.preferred_username,
            firstName: keycloakInstance.tokenParsed?.given_name,
            email: keycloakInstance.tokenParsed?.email,
          });
          setCurrentView('home');
        }
      } catch (error) {
        console.error('❌ Simple App - Keycloak failed:', error);
        setError('Erreur d\'authentification: ' + error.message);
        setInitialized(true);
      }
    };
    
    initAuth();
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (keycloak) {
      console.log('🔑 Simple App - Redirecting to login...');
      keycloak.login();
    }
  };

  const handleShowOffres = (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('📋 Switching to offres view');
    setCurrentView('offres');
    handleLoadOffres();
  };

  const handleBackToHome = (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('🏠 Switching to home view');
    setCurrentView('home');
  };

  const handleLoadOffres = async () => {
    if (!authenticated) return;
    
    console.log('🔑 Token available:', !!keycloak?.token);
    console.log('🎫 Token preview:', keycloak?.token?.substring(0, 50) + '...');
    
    setLoading(true);
    setError(null);
    try {
      console.log('📡 Simple App - Loading offres...');
      const response = await offreApi.getAllOffres();
      setOffres(response.data);
      console.log('✅ Simple App - Offres loaded:', response.data.length, 'items');
    } catch (error) {
      console.error('❌ Simple App - Failed to load offres:', error);
      setError('Erreur lors du chargement des offres: ' + error.message);
      setOffres([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = (e) => {
    e.preventDefault();
    e.stopPropagation();
    keycloak?.logout();
  };

  if (!initialized) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Container maxWidth="md" sx={{ mt: 4 }}>
          <Typography>Initialisation en cours...</Typography>
        </Container>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          🏢 Job Portal - Microservices
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Page de connexion */}
        {!authenticated && (
          <Card>
            <CardContent>
              <Alert severity="info" sx={{ mb: 2 }}>
                Vous devez vous connecter pour accéder aux offres d'emploi
              </Alert>
              <Button 
                variant="contained" 
                onClick={handleLogin}
                type="button"
                size="large"
              >
                Se connecter (Keycloak)
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Page d'accueil après connexion */}
        {authenticated && currentView === 'home' && (
          <div>
            <Card>
              <CardContent>
                <Alert severity="success" sx={{ mb: 2 }}>
                  ✅ Connecté en tant que : <strong>{userInfo?.firstName}</strong> ({userInfo?.username})
                </Alert>
                
                <Typography variant="h5" gutterBottom>
                  Que souhaitez-vous faire ?
                </Typography>
                
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 3 }}>
                  <Button 
                    variant="contained" 
                    onClick={handleShowOffres}
                    type="button"
                    size="large"
                  >
                    📋 Voir les offres d'emploi
                  </Button>
                  
                  <Button 
                    variant="outlined" 
                    onClick={handleLogout}
                    type="button"
                  >
                    Se déconnecter
                  </Button>
                </Box>
                
                <Alert severity="info">
                  <strong>🎯 Architecture Microservices Opérationnelle :</strong><br/>
                  ✅ Authentification Keycloak OAuth 2.0<br/>
                  ✅ API Gateway + Eureka Discovery<br/>
                  ✅ Base de données avec offres<br/>
                  ✅ Communication RabbitMQ
                </Alert>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Page des offres */}
        {authenticated && currentView === 'offres' && (
          <div>
            <Box sx={{ mb: 2, display: 'flex', gap: 2, alignItems: 'center' }}>
              <Button 
                variant="outlined" 
                onClick={handleBackToHome}
                type="button"
              >
                ← Retour
              </Button>
              
              <Typography variant="h5" component="div" sx={{ flexGrow: 1 }}>
                Offres d'emploi
              </Typography>
              
              <Button 
                variant="contained" 
                onClick={handleLoadOffres}
                disabled={loading}
                type="button"
              >
                {loading ? 'Chargement...' : 'Actualiser'}
              </Button>
              
              <Button 
                variant="outlined" 
                onClick={handleLogout}
                type="button"
              >
                Déconnexion
              </Button>
            </Box>
            
            {loading && (
              <Alert severity="info">
                Chargement des offres en cours...
              </Alert>
            )}
            
            {!loading && offres.length === 0 && (
              <Alert severity="warning">
                Aucune offre d'emploi trouvée. Cliquez sur "Actualiser" pour recharger.
              </Alert>
            )}
            
            {!loading && offres.length > 0 && (
              <div>
                <Alert severity="success" sx={{ mb: 2 }}>
                  {offres.length} offre(s) d'emploi trouvée(s)
                </Alert>
                
                {offres.map((offre, index) => (
                  <Card key={offre.id || index} sx={{ mb: 2 }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        {offre.titre}
                      </Typography>
                      <Typography color="text.secondary">
                        <strong>Entreprise:</strong> {offre.entreprise}
                      </Typography>
                      <Typography color="text.secondary">
                        <strong>Localisation:</strong> {offre.localisation}
                      </Typography>
                      {offre.salaire && (
                        <Typography color="text.secondary">
                          <strong>Salaire:</strong> {offre.salaire.toLocaleString()} €
                        </Typography>
                      )}
                      {offre.description && (
                        <Typography variant="body2" sx={{ mt: 1 }}>
                          {offre.description}
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </Container>
    </ThemeProvider>
  );
}

export default SimpleApp;