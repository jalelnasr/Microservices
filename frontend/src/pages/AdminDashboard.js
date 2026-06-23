import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Tabs,
  Tab,
  Button,
  Paper,
} from '@mui/material';
import { AdminPanelSettings, Work, Description } from '@mui/icons-material';
import OffresManagement from '../components/Admin/OffresManagement';
import CandidaturesManagement from '../components/Admin/CandidaturesManagement';

function TabPanel({ children, value, index }) {
  return (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

const AdminDashboard = () => {
  const [currentTab, setCurrentTab] = useState(0);

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <AdminPanelSettings sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
        <Typography variant="h4" component="h1">
          Administration - Dashboard Complet
        </Typography>
      </Box>

      <Paper sx={{ width: '100%', mb: 3 }}>
        <Tabs
          value={currentTab}
          onChange={(e, newValue) => setCurrentTab(newValue)}
          variant="fullWidth"
        >
          <Tab icon={<Work />} label="Gestion des Offres" />
          <Tab icon={<Description />} label="Gestion des Candidatures" />
        </Tabs>
      </Paper>

      <TabPanel value={currentTab} index={0}>
        <OffresManagement />
      </TabPanel>

      <TabPanel value={currentTab} index={1}>
        <CandidaturesManagement />
      </TabPanel>
    </Container>
  );
};

export default AdminDashboard;
