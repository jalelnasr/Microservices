import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Tabs,
  Tab,
  Paper,
} from '@mui/material';
import { BusinessCenter, Description } from '@mui/icons-material';
import RecruiterOffres from '../components/Recruiter/RecruiterOffres';
import RecruiterCandidatures from '../components/Recruiter/RecruiterCandidatures';

function TabPanel({ children, value, index }) {
  return (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

const RecruiterDashboard = () => {
  const [currentTab, setCurrentTab] = useState(0);

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <BusinessCenter sx={{ fontSize: 40, mr: 2, color: 'secondary.main' }} />
        <Typography variant="h4" component="h1">
          Recruteur - Mes Offres & Candidatures
        </Typography>
      </Box>

      <Paper sx={{ width: '100%', mb: 3 }}>
        <Tabs
          value={currentTab}
          onChange={(e, newValue) => setCurrentTab(newValue)}
          variant="fullWidth"
        >
          <Tab label="Mes Offres" />
          <Tab label="Candidatures Reçues" />
        </Tabs>
      </Paper>

      <TabPanel value={currentTab} index={0}>
        <RecruiterOffres />
      </TabPanel>

      <TabPanel value={currentTab} index={1}>
        <RecruiterCandidatures />
      </TabPanel>
    </Container>
  );
};

export default RecruiterDashboard;
