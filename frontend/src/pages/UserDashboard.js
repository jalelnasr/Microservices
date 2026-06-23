import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Tabs,
  Tab,
  Paper,
} from '@mui/material';
import { Person, Work, Description } from '@mui/icons-material';
import OffresPage from './OffresPage';
import MyCandidatures from '../components/User/MyCandidatures';

function TabPanel({ children, value, index }) {
  return (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

const UserDashboard = () => {
  const [currentTab, setCurrentTab] = useState(0);

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Person sx={{ fontSize: 40, mr: 2, color: 'info.main' }} />
        <Typography variant="h4" component="h1">
          Candidat - Offres & Mes Candidatures
        </Typography>
      </Box>

      <Paper sx={{ width: '100%', mb: 3 }}>
        <Tabs
          value={currentTab}
          onChange={(e, newValue) => setCurrentTab(newValue)}
          variant="fullWidth"
        >
          <Tab icon={<Work />} label="Offres Disponibles" />
          <Tab icon={<Description />} label="Mes Candidatures" />
        </Tabs>
      </Paper>

      <TabPanel value={currentTab} index={0}>
        <OffresPage />
      </TabPanel>

      <TabPanel value={currentTab} index={1}>
        <MyCandidatures />
      </TabPanel>
    </Container>
  );
};

export default UserDashboard;
