import React, { useState } from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Button,
  Select,
  MenuItem,
  IconButton,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Delete } from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { candidatureApi } from '../../services/api';
import { toast } from 'react-toastify';
import { format } from 'date-fns';

const CandidaturesManagement = () => {
  const queryClient = useQueryClient();

  const { data: candidatures, isLoading, error } = useQuery(
    'admin-candidatures',
    candidatureApi.getAllCandidatures,
    { select: (response) => response.data }
  );

  const updateStatutMutation = useMutation(
    ({ id, statut }) => candidatureApi.updateStatut(id, statut),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('admin-candidatures');
        toast.success('Statut mis à jour');
      },
      onError: () => toast.error('Erreur lors de la mise à jour'),
    }
  );

  const deleteMutation = useMutation(candidatureApi.deleteCandidature, {
    onSuccess: () => {
      queryClient.invalidateQueries('admin-candidatures');
      toast.success('Candidature supprimee');
    },
    onError: () => toast.error('Erreur lors de la suppression'),
  });

  const getStatutColor = (statut) => {
    switch (statut) {
      case 'EN_ATTENTE': return 'warning';
      case 'ACCEPTE': return 'success';
      case 'REFUSE': return 'error';
      case 'EN_COURS': return 'info';
      default: return 'default';
    }
  };

  if (isLoading) return <CircularProgress />;
  if (error) return <Alert severity="error">Erreur: {error.message}</Alert>;

  return (
    <Box>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Offre ID</TableCell>
              <TableCell>Candidat</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Téléphone</TableCell>
              <TableCell>Date Candidature</TableCell>
              <TableCell>Statut</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {candidatures?.map((candidature) => (
              <TableRow key={candidature.id}>
                <TableCell>{candidature.id}</TableCell>
                <TableCell>{candidature.offreId}</TableCell>
                <TableCell>
                  {candidature.nomCandidat}
                </TableCell>
                <TableCell>{candidature.emailCandidat}</TableCell>
                <TableCell>{candidature.telephone || '-'}</TableCell>
                <TableCell>
                  {format(new Date(candidature.dateCandidature), 'dd/MM/yyyy HH:mm')}
                </TableCell>
                <TableCell>
                  <Chip
                    label={candidature.statut}
                    color={getStatutColor(candidature.statut)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Select
                    size="small"
                    value={candidature.statut}
                    onChange={(e) =>
                      updateStatutMutation.mutate({
                        id: candidature.id,
                        statut: e.target.value,
                      })
                    }
                  >
                    <MenuItem value="EN_ATTENTE">EN_ATTENTE</MenuItem>
                    <MenuItem value="EN_COURS">EN_COURS</MenuItem>
                    <MenuItem value="ACCEPTE">ACCEPTE</MenuItem>
                    <MenuItem value="REFUSE">REFUSE</MenuItem>
                  </Select>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => {
                      if (window.confirm('Supprimer cette candidature ?')) {
                        deleteMutation.mutate(candidature.id);
                      }
                    }}
                  >
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default CandidaturesManagement;
