import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  TextField,
  Box,
  Chip,
  InputAdornment,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Search, Work, LocationOn, Euro, Business } from '@mui/icons-material';
import { useQuery } from 'react-query';
import { offreApi } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const OffresPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredOffres, setFilteredOffres] = useState([]);
  const navigate = useNavigate();

  const { data: offres, isLoading, error } = useQuery(
    'offres',
    offreApi.getAllOffres,
    {
      select: (response) => response.data,
      onSuccess: (data) => setFilteredOffres(data),
    }
  );

  useEffect(() => {
    if (offres) {
      if (searchTerm) {
        const filtered = offres.filter(offre =>
          offre.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
          offre.entreprise.toLowerCase().includes(searchTerm.toLowerCase()) ||
          offre.localisation.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredOffres(filtered);
      } else {
        setFilteredOffres(offres);
      }
    }
  }, [searchTerm, offres]);

  const getContractTypeColor = (type) => {
    switch (type) {
      case 'CDI': return 'success';
      case 'CDD': return 'warning';
      case 'FREELANCE': return 'info';
      case 'STAGE': return 'secondary';
      default: return 'default';
    }
  };

  const handlePostuler = (offre) => {
    navigate(`/postuler/${offre.id}`);
  };

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error">
          Erreur lors du chargement des offres: {error.message}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 4 }}>
        <Work sx={{ mr: 2, verticalAlign: 'middle' }} />
        Offres d'emploi disponibles
      </Typography>

      {/* Search Bar */}
      <Box sx={{ mb: 4 }}>
        <TextField
          fullWidth
          placeholder="Rechercher par titre, entreprise ou localisation..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
          sx={{ mb: 2 }}
        />
      </Box>

      {/* Results Count */}
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        {filteredOffres.length} offre{filteredOffres.length > 1 ? 's' : ''} trouvée{filteredOffres.length > 1 ? 's' : ''}
      </Typography>

      {/* Offres Grid */}
      <Grid container spacing={3}>
        {filteredOffres.map((offre) => (
          <Grid item xs={12} md={6} lg={4} key={offre.id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h6" component="h2" gutterBottom>
                  {offre.titre}
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Business sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                  <Typography variant="body2" color="text.secondary">
                    {offre.entreprise}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <LocationOn sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                  <Typography variant="body2" color="text.secondary">
                    {offre.localisation}
                  </Typography>
                </Box>

                {offre.salaire && (
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Euro sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      {offre.salaire.toLocaleString()} € / an
                    </Typography>
                  </Box>
                )}

                <Box sx={{ mb: 2 }}>
                  <Chip
                    label={offre.typeContrat}
                    color={getContractTypeColor(offre.typeContrat)}
                    size="small"
                    sx={{ mr: 1 }}
                  />
                  <Chip
                    label={offre.statut}
                    color={offre.statut === 'ACTIVE' ? 'success' : 'default'}
                    variant="outlined"
                    size="small"
                  />
                </Box>

                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {offre.description?.substring(0, 150)}
                  {offre.description?.length > 150 ? '...' : ''}
                </Typography>

                <Typography variant="caption" color="text.secondary">
                  Publié le {format(new Date(offre.datePublication), 'dd MMMM yyyy', { locale: fr })}
                </Typography>
              </CardContent>

              <CardActions>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={() => handlePostuler(offre)}
                  disabled={offre.statut !== 'ACTIVE'}
                >
                  Postuler
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {filteredOffres.length === 0 && !isLoading && (
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Typography variant="h6" color="text.secondary">
            Aucune offre d'emploi trouvée
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Essayez de modifier vos critères de recherche
          </Typography>
        </Box>
      )}
    </Container>
  );
};

export default OffresPage;