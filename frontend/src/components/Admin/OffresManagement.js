import React, { useState } from 'react';
import {
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Add, Edit, Delete, Visibility } from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { offreApi } from '../../services/api';
import { toast } from 'react-toastify';
import { format } from 'date-fns';

const OffresManagement = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedOffre, setSelectedOffre] = useState(null);
  const [formData, setFormData] = useState({
    titre: '',
    description: '',
    entreprise: '',
    localisation: '',
    salaire: '',
    typeContrat: 'CDI',
    statut: 'ACTIVE',
  });

  const queryClient = useQueryClient();

  const { data: offres, isLoading, error } = useQuery(
    'admin-offres',
    offreApi.getAllOffres,
    { select: (response) => response.data }
  );

  const createMutation = useMutation(offreApi.createOffre, {
    onSuccess: () => {
      queryClient.invalidateQueries('admin-offres');
      toast.success('Offre créée avec succès');
      handleCloseDialog();
    },
    onError: () => toast.error('Erreur lors de la création'),
  });

  const updateMutation = useMutation(
    ({ id, data }) => offreApi.updateOffre(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('admin-offres');
        toast.success('Offre mise à jour avec succès');
        handleCloseDialog();
      },
      onError: () => toast.error('Erreur lors de la mise à jour'),
    }
  );

  const deleteMutation = useMutation(offreApi.deleteOffre, {
    onSuccess: () => {
      queryClient.invalidateQueries('admin-offres');
      toast.success('Offre supprimée avec succès');
    },
    onError: () => toast.error('Erreur lors de la suppression'),
  });

  const handleOpenDialog = (offre = null) => {
    if (offre) {
      setSelectedOffre(offre);
      setFormData(offre);
    } else {
      setSelectedOffre(null);
      setFormData({
        titre: '',
        description: '',
        entreprise: '',
        localisation: '',
        salaire: '',
        typeContrat: 'CDI',
        statut: 'ACTIVE',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedOffre(null);
  };

  const handleSubmit = () => {
    if (selectedOffre) {
      updateMutation.mutate({ id: selectedOffre.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDelete = (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette offre ?')) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) return <CircularProgress />;
  if (error) return <Alert severity="error">Erreur: {error.message}</Alert>;

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between' }}>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
        >
          Créer une Offre
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Titre</TableCell>
              <TableCell>Entreprise</TableCell>
              <TableCell>Localisation</TableCell>
              <TableCell>Contrat</TableCell>
              <TableCell>Statut</TableCell>
              <TableCell>Date Publication</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {offres?.map((offre) => (
              <TableRow key={offre.id}>
                <TableCell>{offre.id}</TableCell>
                <TableCell>{offre.titre}</TableCell>
                <TableCell>{offre.entreprise}</TableCell>
                <TableCell>{offre.localisation}</TableCell>
                <TableCell>{offre.typeContrat}</TableCell>
                <TableCell>
                  <Chip
                    label={offre.statut}
                    color={offre.statut === 'ACTIVE' ? 'success' : 'default'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {format(new Date(offre.datePublication), 'dd/MM/yyyy')}
                </TableCell>
                <TableCell>
                  <IconButton
                    size="small"
                    onClick={() => handleOpenDialog(offre)}
                  >
                    <Edit />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleDelete(offre.id)}
                  >
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Create/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedOffre ? 'Modifier l\'offre' : 'Créer une offre'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="Titre"
              fullWidth
              value={formData.titre}
              onChange={(e) => setFormData({ ...formData, titre: e.target.value })}
            />
            <TextField
              label="Description"
              fullWidth
              multiline
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
            <TextField
              label="Entreprise"
              fullWidth
              value={formData.entreprise}
              onChange={(e) => setFormData({ ...formData, entreprise: e.target.value })}
            />
            <TextField
              label="Localisation"
              fullWidth
              value={formData.localisation}
              onChange={(e) => setFormData({ ...formData, localisation: e.target.value })}
            />
            <TextField
              label="Salaire"
              type="number"
              fullWidth
              value={formData.salaire}
              onChange={(e) => setFormData({ ...formData, salaire: e.target.value })}
            />
            <TextField
              label="Type de Contrat"
              select
              fullWidth
              value={formData.typeContrat}
              onChange={(e) => setFormData({ ...formData, typeContrat: e.target.value })}
            >
              <MenuItem value="CDI">CDI</MenuItem>
              <MenuItem value="CDD">CDD</MenuItem>
              <MenuItem value="FREELANCE">FREELANCE</MenuItem>
              <MenuItem value="STAGE">STAGE</MenuItem>
            </TextField>
            <TextField
              label="Statut"
              select
              fullWidth
              value={formData.statut}
              onChange={(e) => setFormData({ ...formData, statut: e.target.value })}
            >
              <MenuItem value="ACTIVE">ACTIVE</MenuItem>
              <MenuItem value="INACTIVE">INACTIVE</MenuItem>
              <MenuItem value="CLOSED">CLOSED</MenuItem>
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Annuler</Button>
          <Button onClick={handleSubmit} variant="contained">
            {selectedOffre ? 'Mettre à jour' : 'Créer'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default OffresManagement;
