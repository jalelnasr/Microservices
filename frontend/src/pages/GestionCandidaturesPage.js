import React from 'react';
import {
  Alert,
  Chip,
  CircularProgress,
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { ManageAccounts } from '@mui/icons-material';
import { useQuery } from 'react-query';
import { candidatureApi } from '../services/api';

const GestionCandidaturesPage = () => {
  const { data: candidatures = [], isLoading, error } = useQuery(
    'gestion-candidatures',
    candidatureApi.getAllCandidatures,
    {
      select: (response) => response.data,
    }
  );

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 3 }}>
        <ManageAccounts sx={{ mr: 2, verticalAlign: 'middle' }} />
        Gestion des candidatures
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          Erreur lors du chargement des candidatures: {error.message}
        </Alert>
      )}

      {!error && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Offre</TableCell>
                <TableCell>Candidat</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Statut</TableCell>
                <TableCell>Date</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {candidatures.map((candidature) => (
                <TableRow key={candidature.id}>
                  <TableCell>{candidature.id}</TableCell>
                  <TableCell>#{candidature.offreId}</TableCell>
                  <TableCell>{candidature.nomCandidat}</TableCell>
                  <TableCell>{candidature.emailCandidat}</TableCell>
                  <TableCell>
                    <Chip label={candidature.statut} color="primary" variant="outlined" size="small" />
                  </TableCell>
                  <TableCell>
                    {candidature.dateCandidature
                      ? new Date(candidature.dateCandidature).toLocaleDateString('fr-FR')
                      : '-'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Container>
  );
};

export default GestionCandidaturesPage;
