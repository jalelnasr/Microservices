import React from 'react';
import { Container, Typography } from '@mui/material';
import { Assignment } from '@mui/icons-material';
import MyCandidatures from '../components/User/MyCandidatures';

const MesCandidaturesPage = () => {
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 3 }}>
        <Assignment sx={{ mr: 2, verticalAlign: 'middle' }} />
        Mes candidatures
      </Typography>
      <MyCandidatures />
    </Container>
  );
};

export default MesCandidaturesPage;
