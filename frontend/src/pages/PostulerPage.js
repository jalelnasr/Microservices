import React, { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Container,
  Paper,
  TextField,
  Typography,
} from '@mui/material';
import { Send } from '@mui/icons-material';
import { useMutation } from 'react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { candidatureApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const PostulerPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { userInfo } = useAuth();
  const [form, setForm] = useState({
    nomCandidat: `${userInfo?.firstName || ''} ${userInfo?.lastName || ''}`.trim(),
    emailCandidat: userInfo?.email || '',
    telephone: '',
    cvUrl: '',
    lettreMotivation: '',
  });

  const mutation = useMutation(
    () => candidatureApi.createCandidature({
      offreId: Number(id),
      userId: userInfo?.username || userInfo?.email || 'unknown-user',
      ...form,
    }),
    {
      onSuccess: () => navigate('/mes-candidatures'),
    }
  );

  const handleChange = (event) => {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Postuler a l'offre #{id}
        </Typography>

        {mutation.error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            Erreur lors de l'envoi de la candidature: {mutation.error.message}
          </Alert>
        )}

        <Box component="form" sx={{ display: 'grid', gap: 2 }}>
          <TextField
            label="Nom complet"
            name="nomCandidat"
            value={form.nomCandidat}
            onChange={handleChange}
            required
          />
          <TextField
            label="Email"
            name="emailCandidat"
            type="email"
            value={form.emailCandidat}
            onChange={handleChange}
            required
          />
          <TextField
            label="Telephone"
            name="telephone"
            value={form.telephone}
            onChange={handleChange}
          />
          <TextField
            label="Lien CV"
            name="cvUrl"
            value={form.cvUrl}
            onChange={handleChange}
          />
          <TextField
            label="Lettre de motivation"
            name="lettreMotivation"
            value={form.lettreMotivation}
            onChange={handleChange}
            multiline
            rows={5}
          />
          <Button
            variant="contained"
            startIcon={<Send />}
            onClick={() => mutation.mutate()}
            disabled={mutation.isLoading || !form.nomCandidat || !form.emailCandidat}
          >
            Envoyer ma candidature
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default PostulerPage;
