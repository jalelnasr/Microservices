import React, { useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  CardActions,
  Typography,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Delete, Edit } from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { candidatureApi } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const MyCandidatures = () => {
  const { userInfo } = useAuth();
  const queryClient = useQueryClient();
  const [selectedCandidature, setSelectedCandidature] = useState(null);
  const [formData, setFormData] = useState({
    nomCandidat: '',
    emailCandidat: '',
    telephone: '',
    cvUrl: '',
    lettreMotivation: '',
  });

  const { data: candidatures, isLoading, error } = useQuery(
    ['my-candidatures', userInfo?.username],
    () => candidatureApi.getCandidaturesByUserId(userInfo?.username),
    {
      select: (response) => response.data,
      enabled: !!userInfo?.username,
    }
  );

  const updateMutation = useMutation(
    ({ id, data }) => candidatureApi.updateCandidature(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['my-candidatures', userInfo?.username]);
        toast.success('Candidature mise a jour');
        setSelectedCandidature(null);
      },
      onError: () => toast.error('Erreur lors de la modification'),
    }
  );

  const deleteMutation = useMutation(candidatureApi.deleteCandidature, {
    onSuccess: () => {
      queryClient.invalidateQueries(['my-candidatures', userInfo?.username]);
      toast.success('Candidature supprimee');
    },
    onError: () => toast.error('Erreur lors de la suppression'),
  });

  const handleEdit = (candidature) => {
    setSelectedCandidature(candidature);
    setFormData({
      nomCandidat: candidature.nomCandidat || '',
      emailCandidat: candidature.emailCandidat || '',
      telephone: candidature.telephone || '',
      cvUrl: candidature.cvUrl || '',
      lettreMotivation: candidature.lettreMotivation || '',
    });
  };

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

  if (!candidatures || candidatures.length === 0) {
    return (
      <Alert severity="info">
        Vous n'avez pas encore postulé à d'offres
      </Alert>
    );
  }

  return (
    <Box>
      <Grid container spacing={3}>
        {candidatures.map((candidature) => (
          <Grid item xs={12} md={6} key={candidature.id}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="h6">Offre #{candidature.offreId}</Typography>
                  <Chip
                    label={candidature.statut}
                    color={getStatutColor(candidature.statut)}
                    size="small"
                  />
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Candidature envoyée le{' '}
                  {format(new Date(candidature.dateCandidature), 'dd MMMM yyyy', { locale: fr })}
                </Typography>
                {candidature.message && (
                  <Typography variant="body2" sx={{ mt: 2 }}>
                    Message: {candidature.message}
                  </Typography>
                )}
                {candidature.lettreMotivation && (
                  <Typography variant="body2" sx={{ mt: 2 }}>
                    Lettre: {candidature.lettreMotivation}
                  </Typography>
                )}
              </CardContent>
              <CardActions>
                <Button
                  size="small"
                  startIcon={<Edit />}
                  onClick={() => handleEdit(candidature)}
                >
                  Modifier
                </Button>
                <Button
                  size="small"
                  color="error"
                  startIcon={<Delete />}
                  onClick={() => {
                    if (window.confirm('Supprimer cette candidature ?')) {
                      deleteMutation.mutate(candidature.id);
                    }
                  }}
                >
                  Supprimer
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={Boolean(selectedCandidature)} onClose={() => setSelectedCandidature(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Modifier ma candidature</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'grid', gap: 2, mt: 2 }}>
            <TextField
              label="Nom complet"
              value={formData.nomCandidat}
              onChange={(e) => setFormData({ ...formData, nomCandidat: e.target.value })}
            />
            <TextField
              label="Email"
              type="email"
              value={formData.emailCandidat}
              onChange={(e) => setFormData({ ...formData, emailCandidat: e.target.value })}
            />
            <TextField
              label="Telephone"
              value={formData.telephone}
              onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
            />
            <TextField
              label="Lien CV"
              value={formData.cvUrl}
              onChange={(e) => setFormData({ ...formData, cvUrl: e.target.value })}
            />
            <TextField
              label="Lettre de motivation"
              multiline
              rows={4}
              value={formData.lettreMotivation}
              onChange={(e) => setFormData({ ...formData, lettreMotivation: e.target.value })}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedCandidature(null)}>Annuler</Button>
          <Button
            variant="contained"
            onClick={() => updateMutation.mutate({ id: selectedCandidature.id, data: formData })}
          >
            Enregistrer
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MyCandidatures;
