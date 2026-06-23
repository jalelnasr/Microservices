const Candidature = require('../models/Candidature');
const offreServiceClient = require('../services/offreServiceClient');
const { validationResult } = require('express-validator');
const {
  publishCandidatureCreated,
  publishCandidatureStatusUpdated
} = require('../config/rabbitmq');

const getUsername = (user) => user?.preferred_username || user?.sub;
const getRoles = (user) => user?.realm_access?.roles || [];
const isManager = (user) => {
  const roles = getRoles(user);
  return roles.includes('ADMIN') || roles.includes('RECRUITER');
};
const canAccessCandidature = (user, candidature) => {
  return isManager(user) || candidature.userId === getUsername(user);
};

class CandidatureController {
  
  async getAllCandidatures(req, res) {
    try {
      const candidatures = await Candidature.findAll({
        order: [['dateCandidature', 'DESC']]
      });
      res.json(candidatures);
    } catch (error) {
      console.error('Error fetching candidatures:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getCandidatureById(req, res) {
    try {
      const { id } = req.params;
      const candidature = await Candidature.findByPk(id);

      if (!candidature) {
        return res.status(404).json({ error: 'Candidature not found' });
      }

      if (!canAccessCandidature(req.user, candidature)) {
        return res.status(403).json({ error: 'Forbidden' });
      }

      res.json(candidature);
    } catch (error) {
      console.error('Error fetching candidature:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async createCandidature(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const candidatureData = req.body;

      // Synchronous communication: Check if offre exists via Feign equivalent (axios)
      const offreExists = await offreServiceClient.offreExists(
        candidatureData.offreId,
        req.token
      );

      if (!offreExists) {
        return res.status(400).json({ 
          error: `L'offre avec ID ${candidatureData.offreId} n'existe pas` 
        });
      }

      // Add user ID from token if available
      if (req.user) {
        candidatureData.userId = req.user.preferred_username || req.user.sub || candidatureData.userId;
      }

      const candidature = await Candidature.create(candidatureData);
      publishCandidatureCreated(candidature);
      
      console.log(`✅ Candidature created: ${candidature.id} for offre ${candidature.offreId}`);
      
      res.status(201).json(candidature);
    } catch (error) {
      console.error('Error creating candidature:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async updateStatut(req, res) {
    try {
      const { id } = req.params;
      const { statut } = req.query;

      const validStatuts = ['EN_ATTENTE', 'EN_COURS', 'ACCEPTE', 'REFUSE'];
      if (!validStatuts.includes(statut)) {
        return res.status(400).json({ 
          error: `Statut invalide. Valeurs possibles: ${validStatuts.join(', ')}` 
        });
      }

      const candidature = await Candidature.findByPk(id);
      if (!candidature) {
        return res.status(404).json({ error: 'Candidature not found' });
      }

      candidature.statut = statut;
      await candidature.save();
      publishCandidatureStatusUpdated(candidature);

      console.log(`📝 Candidature ${id} status updated to: ${statut}`);

      res.json(candidature);
    } catch (error) {
      console.error('Error updating statut:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async updateCandidature(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { id } = req.params;
      const candidature = await Candidature.findByPk(id);
      if (!candidature) {
        return res.status(404).json({ error: 'Candidature not found' });
      }

      if (!canAccessCandidature(req.user, candidature)) {
        return res.status(403).json({ error: 'Forbidden' });
      }

      const { nomCandidat, emailCandidat, telephone, cvUrl, lettreMotivation } = req.body;
      await candidature.update({
        nomCandidat,
        emailCandidat,
        telephone,
        cvUrl,
        lettreMotivation
      });

      res.json(candidature);
    } catch (error) {
      console.error('Error updating candidature:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async deleteCandidature(req, res) {
    try {
      const { id } = req.params;
      const candidature = await Candidature.findByPk(id);
      if (!candidature) {
        return res.status(404).json({ error: 'Candidature not found' });
      }

      if (!canAccessCandidature(req.user, candidature)) {
        return res.status(403).json({ error: 'Forbidden' });
      }

      await candidature.destroy();
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting candidature:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getCandidaturesByUserId(req, res) {
    try {
      const { userId } = req.params;
      const candidatures = await Candidature.findAll({
        where: { userId },
        order: [['dateCandidature', 'DESC']]
      });
      res.json(candidatures);
    } catch (error) {
      console.error('Error fetching candidatures by user:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getCandidaturesByOffreId(req, res) {
    try {
      const { offreId } = req.params;
      const candidatures = await Candidature.findAll({
        where: { offreId },
        order: [['dateCandidature', 'DESC']]
      });
      res.json(candidatures);
    } catch (error) {
      console.error('Error fetching candidatures by offre:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getStatsByOffreId(req, res) {
    try {
      const { offreId } = req.params;
      const total = await Candidature.count({ where: { offreId } });

      res.json({
        offreId: Number(offreId),
        totalCandidatures: total
      });
    } catch (error) {
      console.error('Error fetching candidature stats by offre:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

module.exports = new CandidatureController();
