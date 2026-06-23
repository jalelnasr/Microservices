const express = require('express');
const router = express.Router();
const candidatureController = require('../controllers/candidatureController');
const authMiddleware = require('../middleware/auth');
const { hasAnyRole, ownsCandidatureParamOrHasRole } = require('../middleware/roles');
const { body } = require('express-validator');

// Validation rules
const candidatureValidation = [
  body('offreId').isInt({ min: 1 }).withMessage('offreId must be a positive integer'),
  body('nomCandidat').trim().notEmpty().withMessage('nomCandidat is required'),
  body('emailCandidat').isEmail().withMessage('Valid email is required'),
  body('telephone').optional().trim(),
  body('lettreMotivation').optional().trim(),
  body('cvUrl').optional().trim()
];

router.get('/', authMiddleware, hasAnyRole('ADMIN', 'RECRUITER'), candidatureController.getAllCandidatures);
router.post('/', authMiddleware, hasAnyRole('USER', 'ADMIN', 'RECRUITER'), candidatureValidation, candidatureController.createCandidature);
router.patch('/:id/statut', authMiddleware, hasAnyRole('ADMIN', 'RECRUITER'), candidatureController.updateStatut);
router.put('/:id', authMiddleware, hasAnyRole('USER', 'ADMIN', 'RECRUITER'), candidatureValidation, candidatureController.updateCandidature);
router.delete('/:id', authMiddleware, hasAnyRole('USER', 'ADMIN', 'RECRUITER'), candidatureController.deleteCandidature);
router.get('/user/:userId', authMiddleware, ownsCandidatureParamOrHasRole('ADMIN', 'RECRUITER'), candidatureController.getCandidaturesByUserId);
router.get('/offre/:offreId/stats', authMiddleware, hasAnyRole('ADMIN', 'RECRUITER'), candidatureController.getStatsByOffreId);
router.get('/offre/:offreId', authMiddleware, hasAnyRole('ADMIN', 'RECRUITER'), candidatureController.getCandidaturesByOffreId);
router.get('/:id', authMiddleware, hasAnyRole('USER', 'ADMIN', 'RECRUITER'), candidatureController.getCandidatureById);

module.exports = router;
