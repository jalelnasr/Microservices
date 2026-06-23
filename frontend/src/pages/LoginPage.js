import React from 'react';
import {
  Container,
  Paper,
  Typography,
  Button,
  Box,
  Card,
  CardContent,
  Alert,
} from '@mui/material';
import { Login as LoginIcon } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const { login, authenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogin = () => {
    login();
  };

  const handleGoToOffres = (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('📍 Navigating to /offres from LoginPage');
    navigate('/offres');
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Bienvenue sur Job Portal
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Architecture Microservices - Projet Universitaire
          </Typography>
        </Box>

        {authenticated && (
          <Alert severity="success" sx={{ mb: 3 }}>
            Vous êtes déjà connecté !
            <Button 
              variant="contained" 
              size="small" 
              type="button"
              onClick={handleGoToOffres}
              sx={{ ml: 2 }}
            >
              Voir les offres
            </Button>
          </Alert>
        )}

        {!authenticated && (
          <>
            <Card variant="outlined" sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Comptes de démonstration :
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Recruteur:</strong> recruiter1 / recruiter1pass
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Utilisateur 1:</strong> user1 / user1pass
                </Typography>
                <Typography variant="body2">
                  <strong>Administrateur:</strong> admin / adminpass
                </Typography>
              </CardContent>
            </Card>

            <Box sx={{ textAlign: 'center' }}>
              <Button
                variant="contained"
                size="large"
                type="button"
                startIcon={<LoginIcon />}
                onClick={handleLogin}
                sx={{ minWidth: 200 }}
              >
                Se connecter avec Keycloak
              </Button>
            </Box>
          </>
        )}

        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Sécurisé par Keycloak - OAuth 2.0 / OpenID Connect
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default LoginPage;